# K.P.'s Kitchen Staff Attendance — Deployment Ready

This folder is prepared for a Python/Flask deployment on Render.

## Render settings

- Runtime: Python 3
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Plan: Free for initial testing

The included `render.yaml` contains the same settings and asks Render to generate a `SECRET_KEY`.

## Important attendance-data note

The app currently uses SQLite (`attendance.db`). SQLite works well for local testing, but Render's free service has an ephemeral filesystem. For real long-term attendance records, move the database to a persistent database such as PostgreSQL before relying on this as the permanent staff attendance system.

## Australian time

The application uses the `Australia/Adelaide` timezone for staff dates and times.

## Local test

```bash
python3 app.py
```

Then open `http://127.0.0.1:5000`.

## Deploy

1. Put the contents of this folder in a GitHub repository.
2. In Render, choose **New → Web Service** and connect the repository.
3. Use Python 3, `pip install -r requirements.txt`, and `gunicorn app:app`.
4. Render will provide a public HTTPS `onrender.com` URL.

Manager login in the current demo remains `manager` / `manager123`; change it before real use.
