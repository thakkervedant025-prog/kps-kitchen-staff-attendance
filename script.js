/* ============================================================
   K.P.'s KITCHEN
   STAFF ATTENDANCE SYSTEM
   ============================================================ */


/* ============================================================
   STAFF
   ============================================================ */

const STAFF_PINS = {
    Vedant: "1234",
    Jinal: "2345",
    Divya: "3456",
    Mittal: "4567",
    Trupti: "5678",
    Harsh: "6789",
    JK: "7890",
    Kush: "8901"
};

const STAFF_LIST = [
    "Vedant",
    "Jinal",
    "Divya",
    "Mittal",
    "Trupti",
    "Harsh",
    "JK",
    "Kush"
];


/* ============================================================
   MANAGER LOGIN
   ============================================================ */

const MANAGER_USERNAME = "manager";
const MANAGER_PASSWORD = "1234";


/* ============================================================
   STORAGE
   ============================================================ */

const STORAGE_KEY = "kpsKitchenAttendance";


/* ============================================================
   DATA
   ============================================================ */

let attendanceRecords =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];


/* ============================================================
   CURRENT STAFF ACTION
   ============================================================ */

let pendingAction = null;


/*
   pendingAction will be either:

   "start"

   or

   "end"
*/


/* ============================================================
   HELPER
   ============================================================ */

function saveRecords() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(attendanceRecords)
    );
}


/* ============================================================
   DATE
   ============================================================ */

function getTodayDate() {

    const now = new Date();

    return now.toLocaleDateString(
        "en-AU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* ============================================================
   TIME
   ============================================================ */

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


function formatShortTime(date) {

    return date.toLocaleTimeString(
        "en-AU",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
}


/* ============================================================
   HOURS
   ============================================================ */

function formatHours(decimalHours) {

    decimalHours =
        Number(decimalHours) || 0;

    const hours =
        Math.floor(decimalHours);

    const minutes =
        Math.round(
            (decimalHours - hours) * 60
        );

    if (hours === 0) {
        return `${minutes}m`;
    }

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   LIVE CLOCK
   ============================================================ */

function updateClock() {

    const now = new Date();


    /* Header date */

    const headerDate =
        document.getElementById("headerDate");

    if (headerDate) {

        headerDate.textContent =
            now.toLocaleDateString(
                "en-AU",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );
    }


    /* Header time */

    const headerTime =
        document.getElementById("headerTime");

    if (headerTime) {

        headerTime.textContent =
            formatTime(now);
    }


    /* Main current time */

    const currentTime =
        document.getElementById("currentTime");

    if (currentTime) {

        currentTime.textContent =
            formatTime(now);
    }


    /* Main current date */

    const currentDate =
        document.getElementById("currentDate");

    if (currentDate) {

        currentDate.textContent =
            now.toLocaleDateString(
                "en-AU",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );
    }


    /* Dashboard */

    const dashboardDate =
        document.getElementById("dashboardDate");

    if (dashboardDate) {

        dashboardDate.textContent =
            now.toLocaleDateString(
                "en-AU",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );
    }


    const dashboardTime =
        document.getElementById("dashboardTime");

    if (dashboardTime) {

        dashboardTime.textContent =
            formatTime(now);
    }
}


setInterval(updateClock, 1000);

updateClock();


/* ============================================================
   SCROLL TO ATTENDANCE
   ============================================================ */

function scrollToAttendance() {

    const section =
        document.getElementById(
            "attendanceSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* ============================================================
   CHECK STAFF STATUS
   ============================================================ */

function checkStaffStatus() {

    const staffName =
        document.getElementById("staffName");

    const staffMessage =
        document.getElementById("staffMessage");

    if (!staffName || !staffMessage) {
        return;
    }


    const selectedStaff =
        staffName.value;


    if (!selectedStaff) {

        staffMessage.innerHTML = `
            <i class="fa-solid fa-circle-info"></i>
            Please select your name.
        `;

        return;
    }


    const workingRecord =
        attendanceRecords.find(
            record =>
                record.staff === selectedStaff &&
                record.status === "Working"
        );


    if (workingRecord) {

        staffMessage.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            ${escapeHTML(selectedStaff)} is currently working.
            Enter your PIN to end the shift.
        `;

    } else {

        staffMessage.innerHTML = `
            <i class="fa-solid fa-circle-info"></i>
            ${escapeHTML(selectedStaff)} is ready to start a shift.
        `;
    }
}


/* ============================================================
   FIND WORKING SHIFT
   ============================================================ */

function findWorkingShift(staff) {

    return attendanceRecords.find(
        record =>
            record.staff === staff &&
            record.status === "Working"
    );
}


/* ============================================================
   START SHIFT BUTTON
   ============================================================ */

function startShift() {

    const staffSelect =
        document.getElementById("staffName");

    if (!staffSelect) {
        return;
    }


    const staff =
        staffSelect.value;


    if (!staff) {

        const message =
            document.getElementById("staffMessage");

        if (message) {

            message.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                Please select your name first.
            `;
        }

        return;
    }


    /* Check if already working */

    const existing =
        findWorkingShift(staff);


    if (existing) {

        const message =
            document.getElementById("staffMessage");

        if (message) {

            message.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                You already have an active shift.
            `;
        }

        return;
    }


    /*
       Tell the PIN popup that
       we are starting a shift.
    */

    pendingAction = "start";


    openStaffPinModal();
}


/* ============================================================
   END SHIFT BUTTON
   ============================================================ */

function endShift() {

    const staffSelect =
        document.getElementById("staffName");

    if (!staffSelect) {
        return;
    }


    const staff =
        staffSelect.value;


    if (!staff) {

        const message =
            document.getElementById("staffMessage");

        if (message) {

            message.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                Please select your name first.
            `;
        }

        return;
    }


    /* Check if there is an active shift */

    const existing =
        findWorkingShift(staff);


    if (!existing) {

        const message =
            document.getElementById("staffMessage");

        if (message) {

            message.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                You do not have an active shift.
            `;
        }

        return;
    }


    /*
       Tell the PIN popup that
       we are ending a shift.
    */

    pendingAction = "end";


    openStaffPinModal();
}


/* ============================================================
   OPEN STAFF PIN MODAL
   ============================================================ */

function openStaffPinModal() {

    const modal =
        document.getElementById(
            "staffPinModal"
        );

    const pinInput =
        document.getElementById(
            "staffPin"
        );

    const pinError =
        document.getElementById(
            "staffPinError"
        );

    const pinName =
        document.getElementById(
            "staffPinName"
        );


    const staffSelect =
        document.getElementById(
            "staffName"
        );


    const staff =
        staffSelect
            ? staffSelect.value
            : "";


    if (!modal) {
        return;
    }


    /* Change popup message */

    if (pinName) {

        if (pendingAction === "start") {

            pinName.textContent =
                `Enter ${staff}'s PIN to start the shift.`;

        } else {

            pinName.textContent =
                `Enter ${staff}'s PIN to end the shift.`;
        }
    }


    /* Clear previous PIN */

    if (pinInput) {

        pinInput.value = "";
    }


    /* Hide error */

    if (pinError) {

        pinError.style.display =
            "none";

        pinError.textContent =
            "";
    }


    /* Show modal */

    modal.classList.add("show");


    /* Focus PIN */

    setTimeout(
        function () {

            if (pinInput) {
                pinInput.focus();
            }

        },
        150
    );
}


/* ============================================================
   CLOSE STAFF PIN MODAL
   ============================================================ */

function closeStaffPinModal() {

    const modal =
        document.getElementById(
            "staffPinModal"
        );

    if (modal) {

        modal.classList.remove("show");
    }


    const pinInput =
        document.getElementById(
            "staffPin"
        );

    if (pinInput) {

        pinInput.value = "";
    }


    const pinError =
        document.getElementById(
            "staffPinError"
        );

    if (pinError) {

        pinError.style.display =
            "none";

        pinError.textContent =
            "";
    }


    pendingAction = null;
}


/* ============================================================
   VERIFY STAFF PIN
   ============================================================ */

function verifyStaffPin() {

    const staffSelect =
        document.getElementById(
            "staffName"
        );

    const pinInput =
        document.getElementById(
            "staffPin"
        );

    const pinError =
        document.getElementById(
            "staffPinError"
        );


    if (!staffSelect || !pinInput) {
        return;
    }


    const staff =
        staffSelect.value;

    const enteredPIN =
        pinInput.value.trim();


    /* No staff */

    if (!staff) {

        showPinError(
            "Please select your name first."
        );

        return;
    }


    /* No PIN */

    if (!enteredPIN) {

        showPinError(
            "Please enter your 4-digit PIN."
        );

        return;
    }


    /* PIN format */

    if (!/^\d{4}$/.test(enteredPIN)) {

        showPinError(
            "PIN must contain 4 digits."
        );

        return;
    }


    /* Check PIN */

    if (STAFF_PINS[staff] !== enteredPIN) {

        showPinError(
            "Incorrect PIN. Please try again."
        );

        pinInput.select();

        return;
    }


    /* Correct PIN */

    if (pendingAction === "start") {

        performStartShift(staff);

    } else if (pendingAction === "end") {

        performEndShift(staff);
    }
}


/* ============================================================
   SHOW PIN ERROR
   ============================================================ */

function showPinError(message) {

    const pinError =
        document.getElementById(
            "staffPinError"
        );

    if (!pinError) {
        return;
    }


    pinError.textContent =
        message;

    pinError.style.display =
        "block";
}


/* ============================================================
   PERFORM START SHIFT
   ============================================================ */

function performStartShift(staff) {

    const now =
        new Date();


    const newRecord = {

        id:
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2),

        staff:
            staff,

        date:
            getTodayDate(),

        clockIn:
            now.toISOString(),

        clockOut:
            null,

        hours:
            0,

        status:
            "Working"
    };


    attendanceRecords.push(
        newRecord
    );


    saveRecords();


    closeStaffPinModal();


    const message =
        document.getElementById(
            "staffMessage"
        );


    if (message) {

        message.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            ${escapeHTML(staff)} started their shift at
            ${formatShortTime(now)}.
        `;
    }


    refreshPage();
}


/* ============================================================
   PERFORM END SHIFT
   ============================================================ */

function performEndShift(staff) {

    const record =
        findWorkingShift(staff);


    if (!record) {

        closeStaffPinModal();

        return;
    }


    const now =
        new Date();


    const clockIn =
        new Date(record.clockIn);


    const difference =
        now.getTime() -
        clockIn.getTime();


    const hours =
        difference /
        (1000 * 60 * 60);


    record.clockOut =
        now.toISOString();

    record.hours =
        Number(hours.toFixed(2));

    record.status =
        "Completed";


    saveRecords();


    closeStaffPinModal();


    const message =
        document.getElementById(
            "staffMessage"
        );


    if (message) {

        message.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            ${escapeHTML(staff)} finished their shift at
            ${formatShortTime(now)}.
            Hours worked: ${formatHours(record.hours)}.
        `;
    }


    refreshPage();
}


/* ============================================================
   RENDER TODAY'S ATTENDANCE
   ============================================================ */

function renderTodayAttendance() {

    const tbody =
        document.getElementById(
            "todayAttendance"
        );

    const empty =
        document.getElementById(
            "emptyAttendance"
        );


    if (!tbody) {
        return;
    }


    const today =
        getTodayDate();


    const records =
        attendanceRecords.filter(
            record =>
                record.date === today
        );


    tbody.innerHTML = "";


    if (records.length === 0) {

        if (empty) {
            empty.style.display =
                "flex";
        }

        return;
    }


    if (empty) {
        empty.style.display =
            "none";
    }


    records.forEach(
        function (record) {

            const row =
                document.createElement(
                    "tr"
                );


            const clockIn =
                new Date(record.clockIn);


            const clockOut =
                record.clockOut
                    ? new Date(record.clockOut)
                    : null;


            let hours =
                Number(record.hours) || 0;


            if (record.status === "Working") {

                hours =
                    (
                        Date.now() -
                        clockIn.getTime()
                    ) /
                    (1000 * 60 * 60);
            }


            const statusClass =
                record.status === "Working"
                    ? "status-working"
                    : "status-completed";


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(record.staff)}
                    </strong>
                </td>

                <td>
                    ${formatShortTime(clockIn)}
                </td>

                <td>
                    ${
                        clockOut
                            ? formatShortTime(clockOut)
                            : "—"
                    }
                </td>

                <td>
                    ${formatHours(hours)}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${escapeHTML(record.status)}
                    </span>
                </td>

            `;


            tbody.appendChild(row);
        }
    );
}


/* ============================================================
   UPDATE TODAY SUMMARY
   ============================================================ */

function updateTodaySummary() {

    const today =
        getTodayDate();


    const records =
        attendanceRecords.filter(
            record =>
                record.date === today
        );


    const staffToday =
        document.getElementById(
            "staffToday"
        );


    const completedToday =
        document.getElementById(
            "completedToday"
        );


    const totalToday =
        document.getElementById(
            "totalToday"
        );


    const uniqueStaff =
        new Set(
            records.map(
                record => record.staff
            )
        );


    let totalHours = 0;


    records.forEach(
        function (record) {

            if (record.status === "Working") {

                const clockIn =
                    new Date(record.clockIn);

                totalHours +=
                    (
                        Date.now() -
                        clockIn.getTime()
                    ) /
                    (1000 * 60 * 60);

            } else {

                totalHours +=
                    Number(record.hours) || 0;
            }
        }
    );


    if (staffToday) {

        staffToday.textContent =
            uniqueStaff.size;
    }


    if (completedToday) {

        completedToday.textContent =
            records.filter(
                record =>
                    record.status ===
                    "Completed"
            ).length;
    }


    if (totalToday) {

        totalToday.textContent =
            formatHours(totalHours);
    }
}


/* ============================================================
   REFRESH MAIN PAGE
   ============================================================ */

function refreshPage() {

    renderTodayAttendance();

    updateTodaySummary();

    checkStaffStatus();
}


/* ============================================================
   MANAGER LOGIN - OPEN
   ============================================================ */

function openManagerLogin() {

    const modal =
        document.getElementById(
            "managerModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add("show");


    const username =
        document.getElementById(
            "managerUsername"
        );


    const password =
        document.getElementById(
            "managerPassword"
        );


    const error =
        document.getElementById(
            "loginError"
        );


    if (username) {
        username.value = "";
    }


    if (password) {
        password.value = "";
    }


    if (error) {

        error.style.display =
            "none";

        error.textContent =
            "";
    }


    setTimeout(
        function () {

            if (username) {
                username.focus();
            }

        },
        150
    );
}


/* ============================================================
   MANAGER LOGIN - CLOSE
   ============================================================ */

function closeManagerLogin() {

    const modal =
        document.getElementById(
            "managerModal"
        );


    if (modal) {

        modal.classList.remove("show");
    }
}


/* ============================================================
   MANAGER LOGIN
   ============================================================ */

function managerLogin() {

    const usernameInput =
        document.getElementById(
            "managerUsername"
        );


    const passwordInput =
        document.getElementById(
            "managerPassword"
        );


    const error =
        document.getElementById(
            "loginError"
        );


    const username =
        usernameInput
            ? usernameInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (
        username === MANAGER_USERNAME &&
        password === MANAGER_PASSWORD
    ) {

        if (error) {

            error.style.display =
                "none";
        }


        closeManagerLogin();

        openDashboard();

    } else {

        if (error) {

            error.textContent =
                "Incorrect username or password.";

            error.style.display =
                "block";
        }
    }
}


/* ============================================================
   OPEN DASHBOARD
   ============================================================ */

function openDashboard() {

    const dashboard =
        document.getElementById(
            "dashboardModal"
        );


    if (!dashboard) {
        return;
    }


    dashboard.classList.add("show");


    updateDashboard();
}


/* ============================================================
   CLOSE DASHBOARD
   ============================================================ */

function closeDashboard() {

    const dashboard =
        document.getElementById(
            "dashboardModal"
        );


    if (dashboard) {

        dashboard.classList.remove("show");
    }
}


/* ============================================================
   UPDATE DASHBOARD
   ============================================================ */

function updateDashboard() {

    updateManagerSummary();

    renderStaffHours();

    renderAllRecords();
}


/* ============================================================
   MANAGER SUMMARY
   ============================================================ */

function updateManagerSummary() {

    const staffCount =
        document.getElementById(
            "managerStaffCount"
        );


    const workingCount =
        document.getElementById(
            "managerWorkingCount"
        );


    const totalHoursElement =
        document.getElementById(
            "managerTotalHours"
        );


    const entryCount =
        document.getElementById(
            "managerEntryCount"
        );


    const workingStaff =
        attendanceRecords.filter(
            record =>
                record.status === "Working"
        );


    let totalHours = 0;


    attendanceRecords.forEach(
        function (record) {

            if (record.status === "Working") {

                const clockIn =
                    new Date(record.clockIn);

                totalHours +=
                    (
                        Date.now() -
                        clockIn.getTime()
                    ) /
                    (1000 * 60 * 60);

            } else {

                totalHours +=
                    Number(record.hours) || 0;
            }
        }
    );


    if (staffCount) {

        staffCount.textContent =
            STAFF_LIST.length;
    }


    if (workingCount) {

        workingCount.textContent =
            workingStaff.length;
    }


    if (totalHoursElement) {

        totalHoursElement.textContent =
            formatHours(totalHours);
    }


    if (entryCount) {

        entryCount.textContent =
            attendanceRecords.length;
    }
}


/* ============================================================
   STAFF TOTAL HOURS
   ============================================================ */

function getStaffTotalHours(staff) {

    let total = 0;


    attendanceRecords
        .filter(
            record =>
                record.staff === staff
        )
        .forEach(
            function (record) {

                if (record.status === "Working") {

                    const clockIn =
                        new Date(record.clockIn);

                    total +=
                        (
                            Date.now() -
                            clockIn.getTime()
                        ) /
                        (1000 * 60 * 60);

                } else {

                    total +=
                        Number(record.hours) || 0;
                }
            }
        );


    return total;
}


/* ============================================================
   RENDER STAFF HOURS
   ============================================================ */

function renderStaffHours() {

    const container =
        document.getElementById(
            "dashboardBody"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    STAFF_LIST.forEach(
        function (staff) {

            const totalHours =
                getStaffTotalHours(staff);


            const working =
                !!findWorkingShift(staff);


            const staffRecords =
                attendanceRecords.filter(
                    record =>
                        record.staff === staff
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "staff-hours-card";


            card.innerHTML = `

                <div class="staff-card-top">

                    <div class="staff-avatar">
                        ${escapeHTML(
                            staff.charAt(0)
                        )}
                    </div>

                    <div class="staff-card-name">

                        <h3>
                            ${escapeHTML(staff)}
                        </h3>

                        <span class="${
                            working
                                ? "working-label"
                                : "completed-label"
                        }">

                            ${
                                working
                                    ? "Currently Working"
                                    : "Not Working"
                            }

                        </span>

                    </div>

                </div>


                <div class="staff-hours-value">
                    ${formatHours(totalHours)}
                </div>


                <div class="staff-hours-label">
                    Total Hours
                </div>


                <div class="staff-record-count">
                    ${staffRecords.length}
                    ${
                        staffRecords.length === 1
                            ? "attendance entry"
                            : "attendance entries"
                    }
                </div>

            `;


            container.appendChild(card);
        }
    );
}


/* ============================================================
   RENDER ALL RECORDS
   ============================================================ */

function renderAllRecords() {

    const tbody =
        document.getElementById(
            "allRecordsBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (attendanceRecords.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-dashboard"
                >

                    No attendance records.

                </td>

            </tr>

        `;

        return;
    }


    const sorted =
        [...attendanceRecords]
            .sort(
                (a, b) =>
                    new Date(b.clockIn) -
                    new Date(a.clockIn)
            );


    sorted.forEach(
        function (record) {

            const clockIn =
                new Date(record.clockIn);


            const clockOut =
                record.clockOut
                    ? new Date(record.clockOut)
                    : null;


            let hours =
                Number(record.hours) || 0;


            if (record.status === "Working") {

                hours =
                    (
                        Date.now() -
                        clockIn.getTime()
                    ) /
                    (1000 * 60 * 60);
            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(record.staff)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(record.date)}
                </td>

                <td>
                    ${formatShortTime(clockIn)}
                </td>

                <td>
                    ${
                        clockOut
                            ? formatShortTime(clockOut)
                            : "—"
                    }
                </td>

                <td>
                    ${formatHours(hours)}
                </td>

                <td>

                    <span class="status-badge ${
                        record.status === "Working"
                            ? "status-working"
                            : "status-completed"
                    }">

                        ${escapeHTML(record.status)}

                    </span>

                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteAttendanceRecord('${record.id}')"
                    >

                        <i class="fa-solid fa-trash"></i>

                        Delete

                    </button>

                </td>

            `;


            tbody.appendChild(row);
        }
    );
}


/* ============================================================
   DELETE RECORD
   ============================================================ */

function deleteAttendanceRecord(id) {

    const record =
        attendanceRecords.find(
            item =>
                item.id === id
        );


    if (!record) {
        return;
    }


    const confirmed =
        confirm(
            `Delete ${record.staff}'s attendance record for ${record.date}?`
        );


    if (!confirmed) {
        return;
    }


    attendanceRecords =
        attendanceRecords.filter(
            item =>
                item.id !== id
        );


    saveRecords();


    refreshPage();

    updateDashboard();
}


/* ============================================================
   CLEAR ALL RECORDS
   ============================================================ */

function clearAllRecords() {

    if (attendanceRecords.length === 0) {

        alert(
            "There are no attendance records to clear."
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


    attendanceRecords = [];


    saveRecords();


    refreshPage();

    updateDashboard();


    alert(
        "All attendance records have been cleared."
    );
}


/* ============================================================
   ENTER KEY FOR PIN
   ============================================================ */

const pinInput =
    document.getElementById(
        "staffPin"
    );


if (pinInput) {

    pinInput.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 4);
        }
    );


    pinInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                verifyStaffPin();
            }
        }
    );
}


/* ============================================================
   ENTER KEY FOR MANAGER LOGIN
   ============================================================ */

const managerPassword =
    document.getElementById(
        "managerPassword"
    );


if (managerPassword) {

    managerPassword.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                managerLogin();
            }
        }
    );
}


/* ============================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
   ============================================================ */

const staffPinModal =
    document.getElementById(
        "staffPinModal"
    );


if (staffPinModal) {

    staffPinModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                staffPinModal
            ) {

                closeStaffPinModal();
            }
        }
    );
}


const managerModal =
    document.getElementById(
        "managerModal"
    );


if (managerModal) {

    managerModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                managerModal
            ) {

                closeManagerLogin();
            }
        }
    );
}


/* ============================================================
   LIVE DASHBOARD UPDATE
   ============================================================ */

setInterval(
    function () {

        updateTodaySummary();

        renderTodayAttendance();


        const dashboard =
            document.getElementById(
                "dashboardModal"
            );


        if (
            dashboard &&
            dashboard.classList.contains("show")
        ) {

            updateDashboard();
        }

    },
    30000
);


/* ============================================================
   INITIAL PAGE LOAD
   ============================================================ */

refreshPage();


console.log(
    "K.P.'s Kitchen Attendance System loaded."
);
