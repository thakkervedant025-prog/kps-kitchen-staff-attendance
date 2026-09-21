/* =====================================================
   K.P.'S KITCHEN
   STAFF ATTENDANCE SYSTEM
   ===================================================== */


/* =====================================================
   STAFF
   ===================================================== */

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


/* =====================================================
   STAFF PINS
   ===================================================== */

const STAFF_PINS = {

    Vedant: "1111",
    Jinal: "2222",
    Divya: "3333",
    Mittal: "4444",
    Trupti: "5555",
    Harsh: "6666",
    JK: "7777",
    Kush: "8888"

};


/* =====================================================
   MANAGER LOGIN
   ===================================================== */

const MANAGER_USERNAME = "manager";

const MANAGER_PASSWORD = "kp1234";


/* =====================================================
   STORAGE
   ===================================================== */

const STORAGE_KEY =
    "kpKitchenAttendance";


/* =====================================================
   CURRENT STAFF LOGIN
   ===================================================== */

let selectedStaffForLogin = null;


/* =====================================================
   GET RECORDS
   ===================================================== */

function getRecords() {

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

    } catch (error) {

        return [];

    }

}


/* =====================================================
   SAVE RECORDS
   ===================================================== */

function saveRecords(records) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );

}


/* =====================================================
   LOCAL DATE
   ===================================================== */

function getLocalDate() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =====================================================
   CURRENT TIME
   ===================================================== */

function getCurrentTime() {

    return new Date().toLocaleTimeString(
        "en-AU",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }
    );

}


/* =====================================================
   CURRENT DATE
   ===================================================== */

function getCurrentDateText() {

    return new Date().toLocaleDateString(
        "en-AU",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* =====================================================
   UPDATE CLOCK
   ===================================================== */

function updateClock() {

    const currentTime =
        getCurrentTime();

    const currentDate =
        getCurrentDateText();


    document.getElementById(
        "headerTime"
    ).textContent =
        currentTime;


    document.getElementById(
        "panelTime"
    ).textContent =
        currentTime;


    document.getElementById(
        "headerDate"
    ).textContent =
        currentDate;


    document.getElementById(
        "panelDate"
    ).textContent =
        currentDate;

}


/* =====================================================
   FIND ACTIVE SHIFT
   ===================================================== */

function getActiveShift(name) {

    const records =
        getRecords();

    return records.find(
        record =>
            record.name === name &&
            record.clockOut === null
    );

}


/* =====================================================
   CALCULATE MINUTES
   ===================================================== */

function getMinutes(record) {

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


/* =====================================================
   FORMAT HOURS
   ===================================================== */

function formatHours(minutes) {

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;

    return `${hours}h ${mins}m`;

}


/* =====================================================
   CHECK STAFF STATUS
   ===================================================== */

function checkStaffStatus() {

    const staffName =
        document.getElementById(
            "staffName"
        ).value;


    const status =
        document.getElementById(
            "staffStatus"
        );


    const startButton =
        document.getElementById(
            "startShiftBtn"
        );


    const endButton =
        document.getElementById(
            "endShiftBtn"
        );


    if (!staffName) {

        status.textContent =
            "●  Please select your name.";

        status.className =
            "staff-status";

        startButton.disabled = false;

        endButton.disabled = true;

        return;

    }


    const activeShift =
        getActiveShift(
            staffName
        );


    if (activeShift) {

        status.textContent =
            `●  ${staffName} is currently working. Clock-in: ${activeShift.clockIn}`;

        status.className =
            "staff-status working";

        startButton.disabled = true;

        endButton.disabled = false;

    } else {

        status.textContent =
            `✓  ${staffName} is ready to start a shift.`;

        status.className =
            "staff-status ready";

        startButton.disabled = false;

        endButton.disabled = true;

    }

}


/* =====================================================
   START SHIFT
   ===================================================== */

function startShift() {

    const staffName =
        document.getElementById(
            "staffName"
        ).value;


    if (!staffName) {

        alert(
            "Please select your name first."
        );

        return;

    }


    if (
        getActiveShift(staffName)
    ) {

        alert(
            `${staffName} already has an active shift.`
        );

        return;

    }


    /*
       SAVE STAFF NAME
       FOR LOGIN MODAL
    */

    selectedStaffForLogin =
        staffName;


    /*
       CLEAR OLD PIN
    */

    document.getElementById(
        "staffPin"
    ).value = "";


    document.getElementById(
        "staffLoginError"
    ).textContent = "";


    document.getElementById(
        "staffLoginMessage"
    ).textContent =
        `Enter ${staffName}'s PIN to start the shift.`;


    /*
       OPEN LOGIN
    */

    document.getElementById(
        "staffLoginModal"
    ).classList.add("show");


    setTimeout(
        function () {

            document.getElementById(
                "staffPin"
            ).focus();

        },
        100
    );

}


/* =====================================================
   CONFIRM STAFF LOGIN
   ===================================================== */

function confirmStaffLogin() {

    if (!selectedStaffForLogin) {

        return;

    }


    const enteredPin =
        document.getElementById(
            "staffPin"
        ).value.trim();


    const correctPin =
        STAFF_PINS[
            selectedStaffForLogin
        ];


    /*
       CHECK PIN
    */

    if (
        enteredPin !== correctPin
    ) {

        document.getElementById(
            "staffLoginError"
        ).textContent =
            "Incorrect PIN. Please try again.";

        return;

    }


    /*
       CREATE SHIFT
    */

    const now =
        Date.now();


    const records =
        getRecords();


    const newRecord = {

        id: now,

        name:
            selectedStaffForLogin,

        date:
            getLocalDate(),

        clockIn:
            getCurrentTime(),

        clockOut:
            null,

        startTimestamp:
            now,

        endTimestamp:
            null

    };


    records.push(
        newRecord
    );


    saveRecords(records);


    const staffName =
        selectedStaffForLogin;


    closeStaffLogin();


    alert(
        `Shift started successfully for ${staffName}.`
    );


    checkStaffStatus();

    renderTodayAttendance();

    renderSummary();

}


/* =====================================================
   CLOSE STAFF LOGIN
   ===================================================== */

function closeStaffLogin() {

    document.getElementById(
        "staffLoginModal"
    ).classList.remove("show");


    selectedStaffForLogin =
        null;

}


/* =====================================================
   END SHIFT
   ===================================================== */

function endShift() {

    const staffName =
        document.getElementById(
            "staffName"
        ).value;


    if (!staffName) {

        alert(
            "Please select your name."
        );

        return;

    }


    const records =
        getRecords();


    const index =
        records.findIndex(
            record =>
                record.name === staffName &&
                record.clockOut === null
        );


    if (index === -1) {

        alert(
            "There is no active shift for this staff member."
        );

        return;

    }


    const now =
        Date.now();


    records[index].clockOut =
        getCurrentTime();


    records[index].endTimestamp =
        now;


    saveRecords(records);


    const workedMinutes =
        getMinutes(
            records[index]
        );


    alert(
        `Shift ended successfully for ${staffName}.\n\nHours worked: ${formatHours(workedMinutes)}`
    );


    checkStaffStatus();

    renderTodayAttendance();

    renderSummary();

}


/* =====================================================
   GET TODAY'S RECORDS
   ===================================================== */

function getTodayRecords() {

    const today =
        getLocalDate();


    return getRecords().filter(
        record =>
            record.date === today
    );

}


/* =====================================================
   RENDER TODAY'S ATTENDANCE
   ===================================================== */

function renderTodayAttendance() {

    const tableBody =
        document.getElementById(
            "todayTableBody"
        );


    const records =
        getTodayRecords();


    if (!records.length) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-attendance"
                >

                    <div class="empty-icon">
                        ▤
                    </div>

                    <span>
                        No shifts recorded today.
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        records.map(
            function (record) {

                const hours =
                    record.clockOut
                        ? formatHours(
                            getMinutes(record)
                        )
                        : "—";


                const status =
                    record.clockOut

                        ? `
                            <span
                                class="status-badge status-completed"
                            >
                                Completed
                            </span>
                          `

                        : `
                            <span
                                class="status-badge status-working"
                            >
                                Working
                            </span>
                          `;


                return `

                    <tr>

                        <td>
                            <strong>
                                ${record.name}
                            </strong>
                        </td>

                        <td>
                            ${record.clockIn}
                        </td>

                        <td>
                            ${record.clockOut || "—"}
                        </td>

                        <td>
                            ${hours}
                        </td>

                        <td>
                            ${status}
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =====================================================
   RENDER SUMMARY
   ===================================================== */

function renderSummary() {

    const records =
        getTodayRecords();


    const uniqueStaff =
        new Set(
            records.map(
                record => record.name
            )
        );


    const completed =
        records.filter(
            record =>
                record.clockOut
        );


    let totalMinutes =
        0;


    completed.forEach(
        record => {

            totalMinutes +=
                getMinutes(record);

        }
    );


    document.getElementById(
        "staffToday"
    ).textContent =
        uniqueStaff.size;


    document.getElementById(
        "completedToday"
    ).textContent =
        completed.length;


    document.getElementById(
        "hoursToday"
    ).textContent =
        formatHours(
            totalMinutes
        );

}


/* =====================================================
   MANAGER LOGIN
   ===================================================== */

function openManagerLogin() {

    document.getElementById(
        "managerLoginModal"
    ).classList.add("show");


    document.getElementById(
        "managerLoginError"
    ).textContent = "";


    document.getElementById(
        "managerUsername"
    ).value = "";


    document.getElementById(
        "managerPassword"
    ).value = "";


    setTimeout(
        function () {

            document.getElementById(
                "managerUsername"
            ).focus();

        },
        100
    );

}


/* =====================================================
   CLOSE MANAGER LOGIN
   ===================================================== */

function closeManagerLogin() {

    document.getElementById(
        "managerLoginModal"
    ).classList.remove("show");

}


/* =====================================================
   LOGIN MANAGER
   ===================================================== */

function loginManager() {

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

    } else {

        document.getElementById(
            "managerLoginError"
        ).textContent =
            "Incorrect username or password.";

    }

}


/* =====================================================
   OPEN DASHBOARD
   ===================================================== */

function openDashboard() {

    renderDashboard();


    document.getElementById(
        "dashboardModal"
    ).classList.add("show");

}


/* =====================================================
   CLOSE DASHBOARD
   ===================================================== */

function closeDashboard() {

    document.getElementById(
        "dashboardModal"
    ).classList.remove("show");

}


/* =====================================================
   RENDER DASHBOARD
   ===================================================== */

function renderDashboard() {

    const records =
        getRecords();


    const completed =
        records.filter(
            record =>
                record.clockOut
        );


    let totalMinutes =
        0;


    completed.forEach(
        record => {

            totalMinutes +=
                getMinutes(record);

        }
    );


    document.getElementById(
        "dashStaffCount"
    ).textContent =
        STAFF_NAMES.length;


    document.getElementById(
        "dashCompleted"
    ).textContent =
        completed.length;


    document.getElementById(
        "dashTotalHours"
    ).textContent =
        formatHours(
            totalMinutes
        );


    renderStaffHours();

    renderAllRecords();

}


/* =====================================================
   STAFF HOURS
   ===================================================== */

function renderStaffHours() {

    const records =
        getRecords();


    const grid =
        document.getElementById(
            "staffHoursGrid"
        );


    grid.innerHTML =
        STAFF_NAMES.map(
            function (name) {

                const staffRecords =
                    records.filter(
                        record =>
                            record.name === name &&
                            record.clockOut
                    );


                let totalMinutes =
                    0;


                staffRecords.forEach(
                    record => {

                        totalMinutes +=
                            getMinutes(record);

                    }
                );


                return `

                    <div class="staff-hour-card">

                        <strong>
                            ${name}
                        </strong>

                        <span class="hours">
                            ${formatHours(totalMinutes)}
                        </span>

                        <small>
                            ${staffRecords.length}
                            completed
                            shift${staffRecords.length === 1 ? "" : "s"}
                        </small>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   ALL RECORDS
   ===================================================== */

function renderAllRecords() {

    const body =
        document.getElementById(
            "allRecordsBody"
        );


    const records =
        getRecords()
            .slice()
            .reverse();


    if (!records.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-attendance"
                >
                    No attendance records yet.
                </td>

            </tr>

        `;

        return;

    }


    body.innerHTML =
        records.map(
            function (record) {

                const hours =
                    record.clockOut
                        ? formatHours(
                            getMinutes(record)
                        )
                        : "Working";


                return `

                    <tr>

                        <td>
                            <strong>
                                ${record.name}
                            </strong>
                        </td>

                        <td>
                            ${record.date}
                        </td>

                        <td>
                            ${record.clockIn}
                        </td>

                        <td>
                            ${record.clockOut || "—"}
                        </td>

                        <td>
                            ${hours}
                        </td>

                        <td>

                            <button
                                class="delete-button"
                                onclick="deleteRecord(${record.id})"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =====================================================
   DELETE RECORD
   ===================================================== */

function deleteRecord(id) {

    const confirmed =
        confirm(
            "Delete this attendance record?"
        );


    if (!confirmed) {

        return;

    }


    const records =
        getRecords()
            .filter(
                record =>
                    record.id !== id
            );


    saveRecords(records);


    renderDashboard();

    renderTodayAttendance();

    renderSummary();

    checkStaffStatus();

}


/* =====================================================
   CLEAR ALL
   ===================================================== */

function clearAllRecords() {

    const records =
        getRecords();


    if (!records.length) {

        alert(
            "There are no attendance records."
        );

        return;

    }


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


    renderDashboard();

    renderTodayAttendance();

    renderSummary();

    checkStaffStatus();


    alert(
        "All attendance records have been cleared."
    );

}


/* =====================================================
   SIDEBAR
   ===================================================== */

function showHome() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function scrollToAttendance() {

    document.getElementById(
        "attendanceSection"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


/* =====================================================
   KEYBOARD LOGIN
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        updateClock();

        renderTodayAttendance();

        renderSummary();

        checkStaffStatus();


        /*
           UPDATE CLOCK EVERY SECOND
        */

        setInterval(
            updateClock,
            1000
        );


        /*
           STAFF PIN ENTER
        */

        document.getElementById(
            "staffPin"
        ).addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    confirmStaffLogin();

                }

            }
        );


        /*
           MANAGER PASSWORD ENTER
        */

        document.getElementById(
            "managerPassword"
        ).addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    loginManager();

                }

            }
        );


    }
);
