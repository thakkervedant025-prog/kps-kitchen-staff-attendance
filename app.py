from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
from datetime import datetime, date, time, timedelta
from zoneinfo import ZoneInfo
import os
from pathlib import Path
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-secret-key")
LOCAL_TZ = ZoneInfo("Australia/Adelaide")

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "attendance.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        employee_type TEXT NOT NULL CHECK(employee_type IN ('Kitchen', 'Delivery')),
        active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        work_date TEXT NOT NULL,
        login_time TEXT NOT NULL,
        scheduled_logout TEXT NOT NULL,
        actual_logout TEXT,
        logout_method TEXT,
        status TEXT NOT NULL DEFAULT 'Working',
        FOREIGN KEY(employee_id) REFERENCES employees(id)
    );
    """)

    count = conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
    if count == 0:
        conn.executemany(
            "INSERT INTO employees (name, employee_type) VALUES (?, ?)",
            [
                ("John Smith", "Kitchen"),
                ("Sarah Lee", "Kitchen"),
                ("Alex Brown", "Kitchen"),
                ("Mike Wilson", "Delivery"),
                ("David Patel", "Delivery"),
            ],
        )
    conn.commit()
    conn.close()



# Initialise the database when the application starts (including Gunicorn/Render).
init_db()

def current_time():
    return datetime.now(LOCAL_TZ)


def current_date():
    return current_time().date()


def auto_logout_overdue():
    """Automatically close any active shift whose scheduled time has passed."""
    conn = get_db()
    rows = conn.execute("""
        SELECT id, scheduled_logout
        FROM attendance
        WHERE status = 'Working'
    """).fetchall()

    now = current_time()
    for row in rows:
        try:
            scheduled = datetime.strptime(row["scheduled_logout"], "%Y-%m-%d %H:%M")
            if now >= scheduled:
                conn.execute("""
                    UPDATE attendance
                    SET actual_logout = ?, logout_method = 'Automatic',
                        status = 'Completed'
                    WHERE id = ?
                """, (scheduled.strftime("%Y-%m-%d %H:%M"), row["id"]))
        except ValueError:
            pass

    conn.commit()
    conn.close()


def manager_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("manager_logged_in"):
            return redirect(url_for("login"))
        auto_logout_overdue()
        return view(*args, **kwargs)
    return wrapped


@app.route("/")
def index():
    if session.get("manager_logged_in"):
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        # Demo credentials. Change these before real deployment.
        if username == "manager" and password == "manager123":
            session["manager_logged_in"] = True
            return redirect(url_for("dashboard"))

        flash("Incorrect username or password.", "error")

    return render_template("login.html")


@app.route("/logout")
def manager_logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/dashboard")
@manager_required
def dashboard():
    conn = get_db()
    employees = conn.execute("""
        SELECT e.*,
               a.id AS attendance_id,
               a.login_time,
               a.scheduled_logout,
               a.actual_logout,
               a.status,
               a.logout_method
        FROM employees e
        LEFT JOIN attendance a
          ON a.id = (
              SELECT id FROM attendance
              WHERE employee_id = e.id
                AND work_date = ?
              ORDER BY id DESC LIMIT 1
          )
        WHERE e.active = 1
        ORDER BY e.employee_type, e.name
    """, (current_date().isoformat(),)).fetchall()

    working = conn.execute(
        "SELECT COUNT(*) FROM attendance WHERE work_date = ? AND status = 'Working'",
        (current_date().isoformat(),)
    ).fetchone()[0]

    completed = conn.execute(
        "SELECT COUNT(*) FROM attendance WHERE work_date = ? AND status = 'Completed'",
        (current_date().isoformat(),)
    ).fetchone()[0]

    conn.close()

    return render_template(
        "dashboard.html",
        employees=employees,
        working=working,
        completed=completed,
        today=current_date().strftime("%d %B %Y"),
        now=current_time().strftime("%I:%M %p"),
    )


@app.route("/staff/login", methods=["POST"])
@manager_required
def staff_login():
    employee_id = request.form.get("employee_id", type=int)
    finish_time = request.form.get("finish_time", "").strip()

    conn = get_db()
    employee = conn.execute(
        "SELECT * FROM employees WHERE id = ? AND active = 1", (employee_id,)
    ).fetchone()

    if not employee:
        conn.close()
        flash("Employee not found.", "error")
        return redirect(url_for("dashboard"))

    # Delivery shifts default to 5:00 PM.
    if employee["employee_type"] == "Delivery":
        start_time = time(17, 0)
    else:
        start_time = current_time().time().replace(second=0, microsecond=0)

    if not finish_time:
        flash("Please enter a finish time.", "error")
        conn.close()
        return redirect(url_for("dashboard"))

    try:
        finish = datetime.strptime(finish_time, "%H:%M").time()
    except ValueError:
        flash("Invalid finish time.", "error")
        conn.close()
        return redirect(url_for("dashboard"))

    start_dt = datetime.combine(date.today(), start_time)
    finish_dt = datetime.combine(date.today(), finish)

    # Allow overnight finish times, e.g. 12:30 AM after a 5:00 PM shift.
    if finish_dt <= start_dt:
        finish_dt = finish_dt + timedelta(days=1)

    # Prevent duplicate active shifts.
    active = conn.execute(
        "SELECT id FROM attendance WHERE employee_id = ? AND status = 'Working'",
        (employee_id,)
    ).fetchone()

    if active:
        flash("This employee is already logged in.", "error")
        conn.close()
        return redirect(url_for("dashboard"))

    conn.execute("""
        INSERT INTO attendance
        (employee_id, work_date, login_time, scheduled_logout, status)
        VALUES (?, ?, ?, ?, 'Working')
    """, (
        employee_id,
        current_date().isoformat(),
        start_dt.strftime("%Y-%m-%d %H:%M"),
        finish_dt.strftime("%Y-%m-%d %H:%M"),
    ))
    conn.commit()
    conn.close()

    flash(f"{employee['name']} has been logged in.", "success")
    return redirect(url_for("dashboard"))


@app.route("/staff/logout/<int:attendance_id>", methods=["POST"])
@manager_required
def staff_logout(attendance_id):
    conn = get_db()
    row = conn.execute("""
        SELECT a.*, e.name
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        WHERE a.id = ? AND a.status = 'Working'
    """, (attendance_id,)).fetchone()

    if row:
        conn.execute("""
            UPDATE attendance
            SET actual_logout = ?, logout_method = 'Manual', status = 'Completed'
            WHERE id = ?
        """, (current_time().strftime("%Y-%m-%d %H:%M"), attendance_id))
        conn.commit()
        flash(f"{row['name']} has been logged out.", "success")
    else:
        flash("Active attendance record not found.", "error")

    conn.close()
    return redirect(url_for("dashboard"))


@app.route("/employees", methods=["GET", "POST"])
@manager_required
def employees():
    conn = get_db()

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        employee_type = request.form.get("employee_type", "")

        if name and employee_type in ("Kitchen", "Delivery"):
            conn.execute(
                "INSERT INTO employees (name, employee_type) VALUES (?, ?)",
                (name, employee_type)
            )
            conn.commit()
            flash("Employee added.", "success")
        else:
            flash("Please provide a name and employee type.", "error")

        conn.close()
        return redirect(url_for("employees"))

    rows = conn.execute(
        "SELECT * FROM employees WHERE active = 1 ORDER BY employee_type, name"
    ).fetchall()
    conn.close()
    return render_template("employees.html", employees=rows)


@app.route("/history")
@manager_required
def history():
    conn = get_db()
    rows = conn.execute("""
        SELECT a.*, e.name, e.employee_type
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        ORDER BY a.work_date DESC, a.id DESC
        LIMIT 200
    """).fetchall()
    conn.close()
    return render_template("history.html", records=rows)


if __name__ == "__main__":
    app.run(debug=False, host="127.0.0.1", port=int(os.environ.get("PORT", 5000)))
