/* =========================================
   K.P.'s KITCHEN
   STAFF ATTENDANCE SYSTEM
   NO STAFF PIN REQUIRED
========================================= */

const STAFF_NAMES = [
    "Vedant",
    "Jinal",
    "Divya",
    "Mittal",
    "Trupti",
    "Harsh",
    "JK",
    "Kush"
];

const STORAGE_KEY = "kpsKitchenAttendance";

const MANAGER_USERNAME = "manager";
const MANAGER_PASSWORD = "kp1234";


/* =========================================
   STORAGE
========================================= */

function getRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}


/* =========================================
   DATE & TIME
========================================= */

function getLocalDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getFormattedDate() {
    return new Date().toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function getFormattedTime() {
    return new Date().toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}


/* =========================================
   CLOCK
========================================= */

function updateClock() {

    const timeElement = document.getElementById("currentTime");
    const dateElement = document.getElementById("currentDate");

    if (timeElement) {
        timeElement.textContent = getFormattedTime();
    }

    if (dateElement) {
        dateElement.textContent = getFormattedDate();
    }
}

setInterval(updateClock, 1000);


/* =========================================
   STAFF STATUS
========================================= */

function getActiveShift(staffName) {

    if (!staffName) {
        return null;
    }

    const records = getRecords();

    return records.find(record =>
        record.name === staffName &&
        record.clockOut === null
    );
}


/* =========================================
   CHECK STAFF
========================================= */

function checkStaffStatus() {

    const staffSelect = document.getElementById("staffName");

    if (!staffSelect) {
        return;
    }

    const staffName = staffSelect.value;

    const message = document.getElementById("statusMessage");
    const startButton = document.getElementById("startShiftBtn");
    const endButton = document.getElementById("endShiftBtn");

    if (!staffName) {

        if (message) {
            message.innerHTML =
                "ⓘ &nbsp; Please select your name.";
            message.className = "status-message info";
        }

        if (startButton) {
            startButton.disabled = true;
        }

        if (endButton) {
            endButton.disabled = true;
        }

        return;
    }

    const activeShift = getActiveShift(staffName);

    if (activeShift) {

        if (message) {
            message.innerHTML =
                `● &nbsp; ${staffName} is currently working. Clock-in: ${activeShift.clockIn}`;
            message.className = "status-message working";
        }

        if (startButton) {
            startButton.disabled = true;
        }

        if (endButton) {
            endButton.disabled = false;
        }

    } else {

        if (message) {
            message.innerHTML =
                `ⓘ &nbsp; Ready to start a shift for ${staffName}.`;
            message.className = "status-message info";
        }

        if (startButton) {
            startButton.disabled = false;
        }

        if (endButton) {
            endButton.disabled = true;
        }
    }
}


/* =========================================
   START SHIFT
========================================= */

function startShift() {

    const staffSelect = document.getElementById("staffName");

    if (!staffSelect) {
        return;
    }

    const staffName = staffSelect.value;

    if (!staffName) {

        showMessage(
            "Please select your name before starting your shift.",
            "error"
        );

        return;
    }

    const existingShift = getActiveShift(staffName);

    if (existingShift) {

        showMessage(
            `${staffName} already has an active shift.`,
            "error"
        );

        return;
    }

    const now = new Date();

    const newRecord = {

        id: Date.now(),

        name: staffName,

        date: getLocalDate(),

        clockIn: now.toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }),

        clockOut: null,

        startTimestamp: now.getTime(),

        endTimestamp: null
    };

    const records = getRecords();

    records.push(newRecord);

    saveRecords(records);

    showMessage(
        `✓ ${staffName} successfully clocked in at ${newRecord.clockIn}`,
        "success"
    );

    checkStaffStatus();

    renderTodayAttendance();

    updateSummary();

    updateDashboard();
}


/* =========================================
   END SHIFT
========================================= */

function endShift() {

    const staffSelect = document.getElementById("staffName");

    if (!staffSelect) {
        return;
    }

    const staffName = staffSelect.value;

    if (!staffName) {

        showMessage(
            "Please select your name before ending your shift.",
            "error"
        );

        return;
    }

    const records = getRecords();

    const activeIndex = records.findIndex(record =>
        record.name === staffName &&
        record.clockOut === null
    );

    if (activeIndex === -1) {

        showMessage(
            `${staffName} does not have an active shift.`,
            "error"
        );

        return;
    }

    const now = new Date();

    records[activeIndex].clockOut =
        now.toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

    records[activeIndex].endTimestamp =
        now.getTime();

    saveRecords(records);

    showMessage(
        `✓ ${staffName} successfully clocked out at ${records[activeIndex].clockOut}`,
        "success"
    );

    checkStaffStatus();

    renderTodayAttendance();

    updateSummary();

    updateDashboard();
}


/* =========================================
   MESSAGE
========================================= */

function showMessage(message, type) {

    const statusMessage =
        document.getElementById("statusMessage");

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent = message;

    statusMessage.className =
        `status-message ${type}`;
}


/* =========================================
   CALCULATE HOURS
========================================= */

function getRecordMinutes(record) {

    if (
        !record.startTimestamp ||
        !record.endTimestamp
    ) {
        return 0;
    }

    const difference =
        record.endTimestamp -
        record.startTimestamp;

    return Math.max(
        0,
        Math.floor(difference / 60000)
    );
}


function formatMinutes(minutes) {

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;

    return `${hours}h ${mins}m`;
}


/* =========================================
   TODAY'S ATTENDANCE
========================================= */

function renderTodayAttendance() {

    const tbody =
        document.getElementById("attendanceBody");

    if (!tbody) {
        return;
    }

    const records = getRecords();

    const today =
        getLocalDate();

    const todayRecords =
        records.filter(record =>
            record.date === today
        );

    if (todayRecords.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-icon">📋</div>
                    <div>No shifts recorded today.</div>
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = "";

    todayRecords.forEach(record => {

        const row =
            document.createElement("tr");

        const minutes =
            getRecordMinutes(record);

        const status =
            record.clockOut
                ? "Completed"
                : "Working";

        row.innerHTML = `

            <td>
                <strong>${record.name}</strong>
            </td>

            <td>
                ${record.clockIn}
            </td>

            <td>
                ${record.clockOut || "—"}
            </td>

            <td>
                ${record.clockOut
                    ? formatMinutes(minutes)
                    : "In progress"}
            </td>

            <td>
                <span class="status-badge ${record.clockOut
                    ? "completed"
                    : "working"}">
                    ${status}
                </span>
            </td>
        `;

        tbody.appendChild(row);
    });
}


/* =========================================
   TODAY SUMMARY
========================================= */

function updateSummary() {

    const records = getRecords();

    const today =
        getLocalDate();

    const todayRecords =
        records.filter(record =>
            record.date === today
        );

    const uniqueStaff =
        [...new Set(
            todayRecords.map(record =>
                record.name
            )
        )];

    const completed =
        todayRecords.filter(record =>
            record.clockOut
        );

    let totalMinutes = 0;

    completed.forEach(record => {

        totalMinutes +=
            getRecordMinutes(record);

    });


    const staffToday =
        document.getElementById("staffToday");

    const completedShifts =
        document.getElementById("completedShifts");

    const totalHours =
        document.getElementById("totalHours");


    if (staffToday) {
        staffToday.textContent =
            uniqueStaff.length;
    }

    if (completedShifts) {
        completedShifts.textContent =
            completed.length;
    }

    if (totalHours) {
        totalHours.textContent =
            formatMinutes(totalMinutes);
    }
}


/* =========================================
   MANAGER LOGIN
========================================= */

function openManagerLogin() {

    const modal =
        document.getElementById("managerModal");

    if (modal) {
        modal.classList.add("show");
    }

    const username =
        document.getElementById("managerUsername");

    if (username) {
        username.focus();
    }
}


function closeManagerLogin() {

    const modal =
        document.getElementById("managerModal");

    if (modal) {
        modal.classList.remove("show");
    }
}


function managerLogin() {

    const username =
        document.getElementById("managerUsername").value.trim();

    const password =
        document.getElementById("managerPassword").value;

    const error =
        document.getElementById("managerLoginError");


    if (
        username === MANAGER_USERNAME &&
        password === MANAGER_PASSWORD
    ) {

        closeManagerLogin();

        openDashboard();

        document.getElementById("managerPassword").value = "";

        if (error) {
            error.textContent = "";
        }

    } else {

        if (error) {
            error.textContent =
                "Incorrect manager username or password.";
        }
    }
}


/* =========================================
   MANAGER DASHBOARD
========================================= */

function openDashboard() {

    const dashboard =
        document.getElementById("dashboardModal");

    if (dashboard) {

        dashboard.classList.add("show");

        updateDashboard();
    }
}


function closeDashboard() {

    const dashboard =
        document.getElementById("dashboardModal");

    if (dashboard) {
        dashboard.classList.remove("show");
    }
}


function updateDashboard() {

    const records =
        getRecords();


    const dashboardBody =
        document.getElementById("dashboardBody");

    if (!dashboardBody) {
        return;
    }


    dashboardBody.innerHTML = "";


    STAFF_NAMES.forEach(name => {

        const staffRecords =
            records.filter(record =>
                record.name === name
            );

        let totalMinutes = 0;

        staffRecords.forEach(record => {

            totalMinutes +=
                getRecordMinutes(record);

        });


        const active =
            staffRecords.some(record =>
                record.clockOut === null
            );


        const card =
            document.createElement("div");

        card.className =
            "staff-hours-card";


        card.innerHTML = `

            <div class="staff-hours-name">
                ${name}
            </div>

            <div class="staff-hours-total">
                ${formatMinutes(totalMinutes)}
            </div>

            <div class="staff-hours-status ${active
                ? "active"
                : ""}">
                ${active
                    ? "● Currently Working"
                    : "Total Recorded Hours"}
            </div>

        `;

        dashboardBody.appendChild(card);
    });


    renderAllRecords();
}


/* =========================================
   ALL RECORDS
========================================= */

function renderAllRecords() {

    const tbody =
        document.getElementById("allRecordsBody");

    if (!tbody) {
        return;
    }

    const records =
        getRecords();

    if (records.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No attendance records.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = "";


    [...records]
        .reverse()
        .forEach(record => {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>${record.name}</td>

                <td>${record.date}</td>

                <td>${record.clockIn}</td>

                <td>${record.clockOut || "Working"}</td>

                <td>
                    ${record.clockOut
                        ? formatMinutes(
                            getRecordMinutes(record)
                        )
                        : "In progress"}
                </td>

                <td>
                    ${record.clockOut
                        ? "Completed"
                        : "Working"}
                </td>

                <td>
                    <button
                        class="delete-btn"
                        onclick="deleteRecord(${record.id})">
                        Delete
                    </button>
                </td>

            `;

            tbody.appendChild(row);
        });
}


/* =========================================
   DELETE RECORD
========================================= */

function deleteRecord(id) {

    if (!confirm("Delete this attendance record?")) {
        return;
    }

    const records =
        getRecords();

    const updated =
        records.filter(record =>
            record.id !== id
        );

    saveRecords(updated);

    renderTodayAttendance();

    updateSummary();

    updateDashboard();
}


/* =========================================
   CLEAR ALL RECORDS
========================================= */

function clearAllRecords() {

    if (!confirm(
        "Are you sure you want to delete ALL attendance records?"
    )) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);

    renderTodayAttendance();

    updateSummary();

    updateDashboard();

    showMessage(
        "All attendance records have been cleared.",
        "success"
    );
}


/* =========================================
   INITIALISE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateClock();

        renderTodayAttendance();

        updateSummary();

        checkStaffStatus();

        updateDashboard();

    }
);
