/* =========================================================
   K.P.'S KITCHEN STAFF ATTENDANCE SYSTEM
   ========================================================= */


/* =========================================================
   SETTINGS
   ========================================================= */

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

const MANAGER_USERNAME = "manager";
const MANAGER_PASSWORD = "kp1234";

const STORAGE_KEY = "kpsKitchenAttendance";


/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    updateClock();

    renderTodayAttendance();

    updateSummary();

    updateButtons();

    setInterval(function () {
        updateClock();
        renderTodayAttendance();
        updateSummary();
        updateButtons();
    }, 1000);

});


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function getRecords() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        return JSON.parse(saved);

    } catch (error) {

        console.error("Unable to read attendance records:", error);

        return [];

    }

}


function saveRecords(records) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );

}


/* =========================================================
   LOCAL DATE
   ========================================================= */

function getLocalDate() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(date) {

    return date.toLocaleDateString(
        "en-AU",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(date) {

    return date.toLocaleTimeString(
        "en-AU",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }
    );

}


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

    const now = new Date();

    const dateText = formatDate(now);

    const timeText = formatTime(now);


    const headerDate =
        document.getElementById("headerDate");

    const headerTime =
        document.getElementById("headerTime");

    const currentDate =
        document.getElementById("currentDate");

    const currentTime =
        document.getElementById("currentTime");


    if (headerDate) {
        headerDate.textContent = dateText;
    }

    if (headerTime) {
        headerTime.textContent = timeText;
    }

    if (currentDate) {
        currentDate.textContent = dateText;
    }

    if (currentTime) {
        currentTime.textContent = timeText;
    }

}


/* =========================================================
   FIND ACTIVE SHIFT
   ========================================================= */

function findActiveShift(staffName) {

    const records = getRecords();

    const today = getLocalDate();

    return records.find(function (record) {

        return (
            record.name === staffName &&
            record.date === today &&
            !record.endTimestamp
        );

    });

}


/* =========================================================
   CHECK STAFF STATUS
   ========================================================= */

function checkStaffStatus() {

    const staffName =
        document.getElementById("staffName").value;

    const message =
        document.getElementById("staffMessage");

    const endButton =
        document.getElementById("endShiftBtn");

    if (!staffName) {

        message.className = "staff-message";

        message.innerHTML =
            '<i class="fa-solid fa-circle-info"></i>' +
            " Please select your name.";

        endButton.classList.remove("active");

        return;

    }


    const activeShift =
        findActiveShift(staffName);


    if (activeShift) {

        message.className =
            "staff-message success";

        message.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> ' +
            staffName +
            " is currently working. Clock-in: " +
            activeShift.clockIn;

        endButton.classList.add("active");

    } else {

        message.className =
            "staff-message";

        message.innerHTML =
            '<i class="fa-solid fa-circle-info"></i> ' +
            "Ready to start a new shift.";

        endButton.classList.remove("active");

    }

}


/* =========================================================
   START SHIFT
   ========================================================= */

function startShift() {

    const staffName =
        document.getElementById("staffName").value;


    /* No name selected */

    if (!staffName) {

        showStaffMessage(
            "Please select your name before starting your shift.",
            "error"
        );

        return;

    }


    /* Check if already working */

    const activeShift =
        findActiveShift(staffName);


    if (activeShift) {

        showStaffMessage(
            staffName +
            " is already working. Please end the current shift first.",
            "error"
        );

        return;

    }


    const now = new Date();

    const records = getRecords();


    const newRecord = {

        id: Date.now(),

        name: staffName,

        date: getLocalDate(),

        clockIn: formatTime(now),

        clockOut: null,

        startTimestamp: now.getTime(),

        endTimestamp: null

    };


    records.push(newRecord);

    saveRecords(records);


    showStaffMessage(
        "✓ " +
        staffName +
        " successfully started the shift at " +
        formatTime(now),
        "success"
    );


    renderTodayAttendance();

    updateSummary();

    updateButtons();

}


/* =========================================================
   END SHIFT
   ========================================================= */

function endShift() {

    const staffName =
        document.getElementById("staffName").value;


    if (!staffName) {

        showStaffMessage(
            "Please select your name before ending your shift.",
            "error"
        );

        return;

    }


    const records = getRecords();

    const today = getLocalDate();


    const recordIndex =
        records.findIndex(function (record) {

            return (
                record.name === staffName &&
                record.date === today &&
                !record.endTimestamp
            );

        });


    if (recordIndex === -1) {

        showStaffMessage(
            staffName +
            " does not currently have an active shift.",
            "error"
        );

        return;

    }


    const now = new Date();


    records[recordIndex].clockOut =
        formatTime(now);

    records[recordIndex].endTimestamp =
        now.getTime();


    saveRecords(records);


    const duration =
        getRecordMinutes(records[recordIndex]);


    showStaffMessage(
        "✓ " +
        staffName +
        " successfully ended the shift at " +
        formatTime(now) +
        " (" +
        formatMinutes(duration) +
        ")",
        "success"
    );


    renderTodayAttendance();

    updateSummary();

    updateButtons();

}


/* =========================================================
   STAFF MESSAGE
   ========================================================= */

function showStaffMessage(text, type) {

    const message =
        document.getElementById("staffMessage");

    message.className =
        "staff-message " + type;

    message.innerHTML =
        '<i class="fa-solid fa-circle-info"></i> ' +
        text;

}


/* =========================================================
   GET RECORD MINUTES
   ========================================================= */

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


/* =========================================================
   FORMAT MINUTES
   ========================================================= */

function formatMinutes(minutes) {

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;


    return (
        hours +
        "h " +
        remainingMinutes +
        "m"
    );

}


/* =========================================================
   TODAY'S ATTENDANCE
   ========================================================= */

function renderTodayAttendance() {

    const table =
        document.getElementById(
            "todayAttendance"
        );

    const empty =
        document.getElementById(
            "emptyAttendance"
        );


    if (!table) {
        return;
    }


    const records = getRecords();

    const today = getLocalDate();


    const todayRecords =
        records.filter(function (record) {

            return record.date === today;

        });


    table.innerHTML = "";


    if (todayRecords.length === 0) {

        empty.style.display = "flex";

        return;

    }


    empty.style.display = "none";


    todayRecords.forEach(function (record) {

        const row =
            document.createElement("tr");


        const duration =
            getRecordMinutes(record);


        let status = "";

        if (record.endTimestamp) {

            status =
                '<span class="status-completed">' +
                "Completed" +
                "</span>";

        } else {

            status =
                '<span class="status-working">' +
                "● Working" +
                "</span>";

        }


        row.innerHTML = `

            <td>
                <strong>${escapeHTML(record.name)}</strong>
            </td>

            <td>
                ${escapeHTML(record.clockIn)}
            </td>

            <td>
                ${record.clockOut
                    ? escapeHTML(record.clockOut)
                    : "—"
                }
            </td>

            <td>
                ${record.endTimestamp
                    ? formatMinutes(duration)
                    : "—"
                }
            </td>

            <td>
                ${status}
            </td>

        `;


        table.appendChild(row);

    });

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

    const records = getRecords();

    const today = getLocalDate();


    const todayRecords =
        records.filter(function (record) {

            return record.date === today;

        });


    const uniqueStaff =
        new Set(
            todayRecords.map(
                record => record.name
            )
        );


    const completed =
        todayRecords.filter(
            record => record.endTimestamp
        );


    let totalMinutes = 0;


    completed.forEach(function (record) {

        totalMinutes +=
            getRecordMinutes(record);

    });


    document.getElementById(
        "staffToday"
    ).textContent =
        uniqueStaff.size;


    document.getElementById(
        "completedToday"
    ).textContent =
        completed.length;


    document.getElementById(
        "totalToday"
    ).textContent =
        formatMinutes(totalMinutes);

}


/* =========================================================
   BUTTON STATE
   ========================================================= */

function updateButtons() {

    const staffName =
        document.getElementById("staffName").value;

    const startButton =
        document.getElementById("startShiftBtn");

    const endButton =
        document.getElementById("endShiftBtn");


    if (!staffName) {

        startButton.disabled = true;

        endButton.disabled = true;

        return;

    }


    const active =
        findActiveShift(staffName);


    if (active) {

        startButton.disabled = true;

        endButton.disabled = false;

        endButton.classList.add("active");

    } else {

        startButton.disabled = false;

        endButton.disabled = true;

        endButton.classList.remove("active");

    }

}


/* =========================================================
   MANAGER LOGIN
   ========================================================= */

function openManagerLogin() {

    document
        .getElementById("managerModal")
        .classList.add("show");


    document
        .getElementById("managerUsername")
        .focus();

}


function closeManagerLogin() {

    document
        .getElementById("managerModal")
        .classList.remove("show");

    document.getElementById(
        "loginError"
    ).style.display = "none";

}


function managerLogin() {

    const username =
        document.getElementById(
            "managerUsername"
        ).value.trim();

    const password =
        document.getElementById(
            "managerPassword"
        ).value;


    if (
        username === MANAGER_USERNAME &&
        password === MANAGER_PASSWORD
    ) {

        closeManagerLogin();

        openDashboard();

        document.getElementById(
            "managerPassword"
        ).value = "";

        return;

    }


    document.getElementById(
        "loginError"
    ).style.display = "block";

}


/* =========================================================
   ENTER KEY FOR MANAGER LOGIN
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            document
                .getElementById("managerModal")
                .classList.contains("show")
        ) {

            managerLogin();

        }

    }
);


/* =========================================================
   OPEN DASHBOARD
   ========================================================= */

function openDashboard() {

    document
        .getElementById("dashboardModal")
        .classList.add("show");


    renderDashboard();

}


/* =========================================================
   CLOSE DASHBOARD
   ========================================================= */

function closeDashboard() {

    document
        .getElementById("dashboardModal")
        .classList.remove("show");

}


/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

function renderDashboard() {

    const records = getRecords();


    const completed =
        records.filter(
            record => record.endTimestamp
        );


    let totalMinutes = 0;


    completed.forEach(function (record) {

        totalMinutes +=
            getRecordMinutes(record);

    });


    document.getElementById(
        "dashboardStaff"
    ).textContent =
        STAFF_NAMES.length;


    document.getElementById(
        "dashboardCompleted"
    ).textContent =
        completed.length;


    document.getElementById(
        "dashboardHours"
    ).textContent =
        formatMinutes(totalMinutes);


    renderStaffHours();

    renderAllRecords();

}


/* =========================================================
   STAFF HOURS
   ========================================================= */

function renderStaffHours() {

    const container =
        document.getElementById(
            "staffHoursGrid"
        );


    const records = getRecords();


    container.innerHTML = "";


    STAFF_NAMES.forEach(function (name) {

        const staffRecords =
            records.filter(
                record => record.name === name
            );


        let totalMinutes = 0;


        staffRecords.forEach(function (record) {

            if (record.endTimestamp) {

                totalMinutes +=
                    getRecordMinutes(record);

            }

        });


        const card =
            document.createElement("div");


        card.className =
            "staff-hour-card";


        card.innerHTML = `

            <span>${escapeHTML(name)}</span>

            <strong>
                ${formatMinutes(totalMinutes)}
            </strong>

        `;


        container.appendChild(card);

    });

}


/* =========================================================
   ALL RECORDS
   ========================================================= */

function renderAllRecords() {

    const table =
        document.getElementById(
            "allRecordsTable"
        );


    const records = getRecords();


    table.innerHTML = "";


    if (records.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="7"
                    style="text-align:center;padding:25px;color:#777;">

                    No attendance records found.

                </td>

            </tr>

        `;

        return;

    }


    const sortedRecords =
        [...records].sort(
            (a, b) => b.id - a.id
        );


    sortedRecords.forEach(function (record) {

        const row =
            document.createElement("tr");


        const duration =
            record.endTimestamp
                ? formatMinutes(
                    getRecordMinutes(record)
                )
                : "—";


        const status =
            record.endTimestamp
                ? "Completed"
                : "Working";


        row.innerHTML = `

            <td>
                ${escapeHTML(record.name)}
            </td>

            <td>
                ${escapeHTML(record.date)}
            </td>

            <td>
                ${escapeHTML(record.clockIn)}
            </td>

            <td>
                ${record.clockOut
                    ? escapeHTML(record.clockOut)
                    : "—"
                }
            </td>

            <td>
                ${duration}
            </td>

            <td>
                ${status}
            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteRecord(${record.id})"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


/* =========================================================
   DELETE RECORD
   ========================================================= */

function deleteRecord(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this attendance record?"
        );


    if (!confirmDelete) {
        return;
    }


    let records = getRecords();


    records =
        records.filter(
            record => record.id !== id
        );


    saveRecords(records);


    renderDashboard();

    renderTodayAttendance();

    updateSummary();

    updateButtons();

}


/* =========================================================
   CLEAR ALL RECORDS
   ========================================================= */

function clearAllRecords() {

    const confirmDelete =
        confirm(
            "WARNING: This will delete ALL attendance records. Continue?"
        );


    if (!confirmDelete) {
        return;
    }


    localStorage.removeItem(
        STORAGE_KEY
    );


    renderDashboard();

    renderTodayAttendance();

    updateSummary();

    updateButtons();

}


/* =========================================================
   SCROLL TO ATTENDANCE
   ========================================================= */

function scrollToAttendance() {

    const section =
        document.getElementById(
            "attendanceSection"
        );


    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* =========================================================
   HTML SECURITY
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
