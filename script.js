/* =========================================
   K.P.'S KITCHEN
   STAFF ATTENDANCE SYSTEM
========================================= */


/* =========================
   STAFF LIST
========================= */

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


/* =========================
   MANAGER LOGIN
========================= */

const MANAGER_USERNAME = "manager";

const MANAGER_PASSWORD = "kp1234";


/* =========================
   LOCAL STORAGE
========================= */

const STORAGE_KEY =
    "kpsKitchenAttendance";


/* =========================
   GET RECORDS
========================= */

function getRecords() {

    return JSON.parse(
        localStorage.getItem(
            STORAGE_KEY
        )
    ) || [];

}


/* =========================
   SAVE RECORDS
========================= */

function saveRecords(records) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );

}


/* =========================
   CURRENT DATE
========================= */

function getCurrentDate() {

    const now = new Date();

    return now
        .toISOString()
        .split("T")[0];

}


/* =========================
   CURRENT TIME
========================= */

function getCurrentTime() {

    const now = new Date();

    return now.toLocaleTimeString(
        "en-AU",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }
    );

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-AU",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================
   FORMAT TIME
========================= */

function formatTime(time) {

    if (!time) {

        return "-";

    }

    return time;

}


/* =========================
   LIVE CLOCK
========================= */

function updateClock() {

    const now = new Date();


    document.getElementById(
        "currentTime"
    ).textContent =

        now.toLocaleTimeString(
            "en-AU",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        );


    document.getElementById(
        "currentDate"
    ).textContent =

        now.toLocaleDateString(
            "en-AU",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    document.getElementById(
        "todayDateBadge"
    ).textContent =

        now.toLocaleDateString(
            "en-AU",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

}


setInterval(
    updateClock,
    1000
);

updateClock();


/* =========================
   MESSAGE
========================= */

function showMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "message"
        );


    messageBox.textContent =
        message;


    messageBox.className =
        "message " + type;


    setTimeout(
        function() {

            messageBox.className =
                "message";

        },
        4000
    );

}


/* =========================
   CHECK STAFF STATUS
========================= */

function checkStaffStatus() {

    const name =
        document.getElementById(
            "staffName"
        ).value;


    const statusBox =
        document.getElementById(
            "staffStatus"
        );


    if (!name) {

        statusBox.className =
            "staff-status hidden";

        statusBox.textContent = "";

        return;

    }


    const records =
        getRecords();


    const today =
        getCurrentDate();


    const activeRecord =
        records.find(
            function(record) {

                return (

                    record.name === name &&

                    record.date === today &&

                    !record.clockOut

                );

            }
        );


    if (activeRecord) {

        statusBox.className =
            "staff-status working";


        statusBox.textContent =

            "● " +
            name +
            " is currently working. Clock-in: " +
            activeRecord.clockIn;

    }

    else {

        statusBox.className =
            "staff-status";


        statusBox.textContent =
            "Ready to clock in.";

    }

}


/* =========================
   CLOCK IN
========================= */

function clockIn() {

    const staffName =
        document.getElementById(
            "staffName"
        ).value;


    if (!staffName) {

        showMessage(
            "Please select your name before clocking in.",
            "error"
        );

        return;

    }


    const records =
        getRecords();


    const today =
        getCurrentDate();


    const alreadyWorking =
        records.find(
            function(record) {

                return (

                    record.name === staffName &&

                    record.date === today &&

                    !record.clockOut

                );

            }
        );


    if (alreadyWorking) {

        showMessage(
            staffName +
            " is already clocked in.",
            "error"
        );

        checkStaffStatus();

        return;

    }


    const newRecord = {

        id: Date.now(),

        name: staffName,

        date: today,

        clockIn: getCurrentTime(),

        clockOut: null,

        startTimestamp: Date.now(),

        endTimestamp: null

    };


    records.push(
        newRecord
    );


    saveRecords(
        records
    );


    showMessage(

        "✓ " +
        staffName +
        " successfully clocked in at " +
        newRecord.clockIn,

        "success"

    );


    document.getElementById(
        "staffName"
    ).value = "";


    checkStaffStatus();

    renderTodayRecords();

    updateSummary();

    updateManagerDashboard();

    renderStaffHours();

}


/* =========================
   CLOCK OUT
========================= */

function clockOut() {

    const staffName =
        document.getElementById(
            "staffName"
        ).value;


    if (!staffName) {

        showMessage(
            "Please select your name before clocking out.",
            "error"
        );

        return;

    }


    const records =
        getRecords();


    const today =
        getCurrentDate();


    const activeRecord =
        records.find(
            function(record) {

                return (

                    record.name === staffName &&

                    record.date === today &&

                    !record.clockOut

                );

            }
        );


    if (!activeRecord) {

        showMessage(

            staffName +
            " does not have an active shift today.",

            "error"

        );

        return;

    }


    activeRecord.clockOut =
        getCurrentTime();


    activeRecord.endTimestamp =
        Date.now();


    saveRecords(
        records
    );


    showMessage(

        "✓ " +
        staffName +
        " successfully clocked out at " +
        activeRecord.clockOut,

        "success"

    );


    document.getElementById(
        "staffName"
    ).value = "";


    renderTodayRecords();

    updateSummary();

    updateManagerDashboard();

    renderStaffHours();

}


/* =========================
   GET RECORD MINUTES
========================= */

function getRecordMinutes(
    record
) {

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

        Math.floor(
            difference / 60000
        )

    );

}


/* =========================
   FORMAT MINUTES
========================= */

function formatTotalMinutes(
    totalMinutes
) {

    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    if (hours === 0) {

        return minutes + "m";

    }


    return (

        hours +
        "h " +
        minutes +
        "m"

    );

}


/* =========================
   CALCULATE SHIFT DURATION
========================= */

function calculateDuration(
    record
) {

    if (!record.endTimestamp) {

        return "Working";

    }


    return formatTotalMinutes(
        getRecordMinutes(record)
    );

}


/* =========================
   TODAY'S RECORDS
========================= */

function renderTodayRecords() {

    const tbody =
        document.getElementById(
            "attendanceTableBody"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    const today =
        getCurrentDate();


    const records =
        getRecords().filter(
            function(record) {

                return record.date === today;

            }
        );


    tbody.innerHTML = "";


    if (records.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    records.sort(
        function(a, b) {

            return (
                b.startTimestamp -
                a.startTimestamp
            );

        }
    );


    records.forEach(
        function(record) {

            const row =
                document.createElement(
                    "tr"
                );


            let status;


            if (record.clockOut) {

                status =

                    `<span class="status-badge status-completed">
                        Completed
                    </span>`;

            }

            else {

                status =

                    `<span class="status-badge status-working">
                        Working
                    </span>`;

            }


            row.innerHTML = `

                <td class="staff-name-cell">

                    ${escapeHTML(
                        record.name
                    )}

                </td>


                <td>

                    ${formatTime(
                        record.clockIn
                    )}

                </td>


                <td>

                    ${formatTime(
                        record.clockOut
                    )}

                </td>


                <td>

                    ${calculateDuration(
                        record
                    )}

                </td>


                <td>

                    ${status}

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}


/* =========================
   SUMMARY
========================= */

function updateSummary() {

    const today =
        getCurrentDate();


    const records =
        getRecords().filter(
            function(record) {

                return record.date === today;

            }
        );


    const working =
        records.filter(
            function(record) {

                return !record.clockOut;

            }
        ).length;


    const completed =
        records.filter(
            function(record) {

                return !!record.clockOut;

            }
        ).length;


    document.getElementById(
        "workingCount"
    ).textContent =
        working;


    document.getElementById(
        "completedCount"
    ).textContent =
        completed;

}


/* =========================
   STAFF HOURS
========================= */

function renderStaffHours() {

    const grid =
        document.getElementById(
            "staffHoursGrid"
        );


    if (!grid) {

        return;

    }


    const records =
        getRecords();


    grid.innerHTML = "";


    STAFF_NAMES.forEach(
        function(name) {


            const staffRecords =
                records.filter(
                    function(record) {

                        return (
                            record.name === name
                        );

                    }
                );


            let totalMinutes = 0;


            staffRecords.forEach(
                function(record) {

                    totalMinutes +=
                        getRecordMinutes(
                            record
                        );

                }
            );


            const activeShift =
                staffRecords.some(
                    function(record) {

                        return !record.clockOut;

                    }
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "staff-hours-card";


            const initials =
                name
                    .substring(0, 2)
                    .toUpperCase();


            let statusText;


            if (activeShift) {

                statusText =
                    "Currently working";

            }

            else if (
                staffRecords.length > 0
            ) {

                statusText =

                    staffRecords.length +
                    " recorded shift" +
                    (
                        staffRecords.length > 1
                            ? "s"
                            : ""
                    );

            }

            else {

                statusText =
                    "No completed shifts";

            }


            card.innerHTML = `

                <div class="staff-hours-top">

                    <div class="staff-avatar">

                        ${escapeHTML(
                            initials
                        )}

                    </div>


                    <div class="staff-hours-name">

                        ${escapeHTML(
                            name
                        )}

                    </div>

                </div>


                <span class="staff-hours-label">

                    Total hours worked

                </span>


                <div class="staff-hours-total">

                    ${formatTotalMinutes(
                        totalMinutes
                    )}

                </div>


                <div class="staff-hours-status">

                    ${statusText}

                </div>

            `;


            grid.appendChild(
                card
            );

        }
    );

}


/* =========================
   OPEN LOGIN
========================= */

function openLoginModal() {

    document.getElementById(
        "loginModal"
    ).classList.add(
        "show"
    );


    document.getElementById(
        "username"
    ).focus();

}


/* =========================
   CLOSE LOGIN
========================= */

function closeLoginModal() {

    document.getElementById(
        "loginModal"
    ).classList.remove(
        "show"
    );


    document.getElementById(
        "loginMessage"
    ).textContent = "";


    document.getElementById(
        "username"
    ).value = "";


    document.getElementById(
        "password"
    ).value = "";

}


/* =========================
   MANAGER LOGIN
========================= */

function managerLogin() {

    const username =
        document.getElementById(
            "username"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value;


    const loginMessage =
        document.getElementById(
            "loginMessage"
        );


    if (

        username ===
            MANAGER_USERNAME &&

        password ===
            MANAGER_PASSWORD

    ) {


        closeLoginModal();


        document.getElementById(
            "dashboardModal"
        ).classList.add(
            "show"
        );


        updateManagerDashboard();

        renderStaffHours();


    }

    else {

        loginMessage.textContent =
            "Incorrect username or password.";

    }

}


/* =========================
   MANAGER DASHBOARD
========================= */

function updateManagerDashboard() {

    const records =
        getRecords();


    const tbody =
        document.getElementById(
            "managerTableBody"
        );


    tbody.innerHTML = "";


    const working =
        records.filter(
            function(record) {

                return !record.clockOut;

            }
        ).length;


    const completed =
        records.filter(
            function(record) {

                return !!record.clockOut;

            }
        ).length;


    document.getElementById(
        "totalRecords"
    ).textContent =
        records.length;


    document.getElementById(
        "dashboardWorking"
    ).textContent =
        working;


    document.getElementById(
        "dashboardCompleted"
    ).textContent =
        completed;


    if (records.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:35px;
                        color:#888;
                    "
                >

                    No attendance records available.

                </td>

            </tr>

        `;


        renderStaffHours();

        return;

    }


    records.sort(
        function(a, b) {

            return (
                b.startTimestamp -
                a.startTimestamp
            );

        }
    );


    records.forEach(
        function(record) {


            const row =
                document.createElement(
                    "tr"
                );


            let status;


            if (record.clockOut) {

                status =

                    `<span class="status-badge status-completed">
                        Completed
                    </span>`;

            }

            else {

                status =

                    `<span class="status-badge status-working">
                        Working
                    </span>`;

            }


            row.innerHTML = `

                <td>

                    ${formatDate(
                        record.date
                    )}

                </td>


                <td class="staff-name-cell">

                    ${escapeHTML(
                        record.name
                    )}

                </td>


                <td>

                    ${formatTime(
                        record.clockIn
                    )}

                </td>


                <td>

                    ${formatTime(
                        record.clockOut
                    )}

                </td>


                <td>

                    ${calculateDuration(
                        record
                    )}

                </td>


                <td>

                    ${status}

                </td>


                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteRecord(${record.id})"
                    >

                        Delete

                    </button>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    renderStaffHours();

}


/* =========================
   DELETE RECORD
========================= */

function deleteRecord(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this attendance record?"
        );


    if (!confirmed) {

        return;

    }


    let records =
        getRecords();


    records =
        records.filter(
            function(record) {

                return record.id !== id;

            }
        );


    saveRecords(
        records
    );


    renderTodayRecords();

    updateSummary();

    updateManagerDashboard();

    renderStaffHours();

}


/* =========================
   CLEAR ALL
========================= */

function clearAllRecords() {

    const confirmed =
        confirm(
            "Are you sure you want to delete ALL attendance records?"
        );


    if (!confirmed) {

        return;

    }


    localStorage.removeItem(
        STORAGE_KEY
    );


    renderTodayRecords();

    updateSummary();

    updateManagerDashboard();

    renderStaffHours();


    showMessage(
        "All attendance records have been cleared.",
        "success"
    );

}


/* =========================
   LOGOUT
========================= */

function logoutManager() {

    document.getElementById(
        "dashboardModal"
    ).classList.remove(
        "show"
    );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================
   CLOSE MODAL OUTSIDE
========================= */

window.addEventListener(
    "click",
    function(event) {


        const loginModal =
            document.getElementById(
                "loginModal"
            );


        const dashboardModal =
            document.getElementById(
                "dashboardModal"
            );


        if (
            event.target ===
            loginModal
        ) {

            closeLoginModal();

        }


        if (
            event.target ===
            dashboardModal
        ) {

            logoutManager();

        }

    }
);


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function(event) {


        if (event.key === "Enter") {


            const loginModal =
                document.getElementById(
                    "loginModal"
                );


            if (
                loginModal.classList.contains(
                    "show"
                )
            ) {

                managerLogin();

            }

        }


        if (event.key === "Escape") {

            closeLoginModal();

            logoutManager();

        }

    }
);


/* =========================
   INITIAL LOAD
========================= */

renderTodayRecords();

updateSummary();

updateManagerDashboard();

renderStaffHours();


/* =========================
   AUTO REFRESH
========================= */

setInterval(
    function() {

        renderTodayRecords();

        updateSummary();

        updateManagerDashboard();

        renderStaffHours();

    },
    30000
);
