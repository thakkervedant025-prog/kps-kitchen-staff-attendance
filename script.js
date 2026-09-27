/* =========================================================
   K.P.'s KITCHEN
   STAFF ATTENDANCE SYSTEM
   ========================================================= */


/* =========================================================
   STAFF PINs
========================================================= */

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


/* =========================================================
   MANAGER LOGIN
========================================================= */

const MANAGER_USERNAME = "manager";
const MANAGER_PASSWORD = "2710";


/* =========================================================
   STAFF LIST
========================================================= */

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


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "kpsKitchenAttendance";


/* =========================================================
   VARIABLES
========================================================= */

let attendanceRecords = [];
let pendingStaff = "";
let pendingAction = "";


/* =========================================================
   LOAD RECORDS
========================================================= */

function loadRecords() {

    try {

        const savedRecords = localStorage.getItem(STORAGE_KEY);

        if (savedRecords) {
            attendanceRecords = JSON.parse(savedRecords);
        } else {
            attendanceRecords = [];
        }

    } catch (error) {

        console.error("Could not load attendance records:", error);

        attendanceRecords = [];

    }

}


/* =========================================================
   SAVE RECORDS
========================================================= */

function saveRecords() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(attendanceRecords)
    );

}


/* =========================================================
   DATE HELPERS
========================================================= */

function getTodayDate() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-AU",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(date) {

    return new Date(date).toLocaleTimeString(
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
   SHORT TIME
========================================================= */

function formatShortTime(date) {

    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleTimeString(
        "en-AU",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );

}


/* =========================================================
   FORMAT HOURS
========================================================= */

function formatHours(milliseconds) {

    if (!milliseconds || milliseconds < 0) {
        return "0h 0m";
    }

    const totalMinutes = Math.floor(
        milliseconds / 60000
    );

    const hours = Math.floor(
        totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   AUTOMATIC LOGOUT TIME
========================================================= */

/*
   Staff who have not manually logged out are automatically
   logged out at 8:00 PM.

   Their status becomes:

   "Logout Missing"

   This is different from a normal completed shift.
*/

function getAutomaticLogoutTime(dateString) {

    const logoutDate = new Date(
        `${dateString}T20:00:00`
    );

    return logoutDate;

}


/* =========================================================
   AUTOMATIC LOGOUT CHECK
========================================================= */

function processAutomaticLogouts() {

    const now = new Date();

    let recordsChanged = false;

    attendanceRecords.forEach(record => {

        /*
           Only process records that are still working.
        */

        if (
            record.status === "Working" &&
            record.clockIn
        ) {

            const shiftDate = record.date;

            const automaticLogout = getAutomaticLogoutTime(
                shiftDate
            );


            /*
               If current time is after 8:00 PM on the
               shift date, automatically close the shift.
            */

            if (now >= automaticLogout) {

                record.clockOut =
                    automaticLogout.toISOString();

                record.hours =
                    automaticLogout.getTime()
                    -
                    new Date(record.clockIn).getTime();

                record.status = "Logout Missing";

                record.autoLogout = true;

                /*
                   Keep existing notes if there are any.
                */

                if (!record.notes) {
                    record.notes = "Staff did not manually logout.";
                }

                recordsChanged = true;

            }

        }

    });


    /*
       Save changes if automatic logout happened.
    */

    if (recordsChanged) {
        saveRecords();
    }

}


/* =========================================================
   UPDATE CLOCK
========================================================= */

function updateClock() {

    const now = new Date();

    const dateText = now.toLocaleDateString(
        "en-AU",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    const timeText = now.toLocaleTimeString(
        "en-AU",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }
    );


    const headerDate =
        document.getElementById("headerDate");

    const headerTime =
        document.getElementById("headerTime");

    const currentDate =
        document.getElementById("currentDate");

    const currentTime =
        document.getElementById("currentTime");

    const dashboardDate =
        document.getElementById("dashboardDate");

    const dashboardTime =
        document.getElementById("dashboardTime");


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

    if (dashboardDate) {
        dashboardDate.textContent = dateText;
    }

    if (dashboardTime) {
        dashboardTime.textContent = timeText;
    }

}


/* =========================================================
   SCROLL TO ATTENDANCE
========================================================= */

function scrollToAttendance() {

    const section =
        document.getElementById("attendanceSection");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   FIND WORKING SHIFT
========================================================= */

function findWorkingShift(staffName) {

    return attendanceRecords.find(
        record =>
            record.staff === staffName &&
            record.status === "Working"
    );

}


/* =========================================================
   CHECK STAFF STATUS
========================================================= */

function checkStaffStatus() {

    const staffSelect =
        document.getElementById("staffName");

    const message =
        document.getElementById("staffMessage");

    const startButton =
        document.getElementById("startShiftBtn");

    const endButton =
        document.getElementById("endShiftBtn");


    if (!staffSelect) {
        return;
    }


    const staffName =
        staffSelect.value;


    if (!staffName) {

        if (message) {

            message.innerHTML =
                '<i class="fa-solid fa-circle-info"></i> ' +
                'Please select your name.';

        }

        if (startButton) {
            startButton.disabled = false;
        }

        if (endButton) {
            endButton.disabled = false;
        }

        return;
    }


    const workingShift =
        findWorkingShift(staffName);


    if (workingShift) {

        if (message) {

            message.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> ' +
                `${escapeHTML(staffName)} is currently working.`;

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
                '<i class="fa-solid fa-circle-info"></i> ' +
                `${escapeHTML(staffName)} can start a shift.`;

        }

        if (startButton) {
            startButton.disabled = false;
        }

        if (endButton) {
            endButton.disabled = true;
        }

    }

}


/* =========================================================
   START SHIFT
========================================================= */

function startShift() {

    const staffSelect =
        document.getElementById("staffName");

    if (!staffSelect || !staffSelect.value) {

        alert("Please select your name first.");

        return;
    }


    const staffName =
        staffSelect.value;


    /*
       Prevent duplicate active shifts.
    */

    const workingShift =
        findWorkingShift(staffName);


    if (workingShift) {

        alert(
            `${staffName} already has an active shift.`
        );

        return;
    }


    pendingStaff = staffName;
    pendingAction = "start";


    openStaffPinModal();

}


/* =========================================================
   END SHIFT
========================================================= */

function endShift() {

    const staffSelect =
        document.getElementById("staffName");

    if (!staffSelect || !staffSelect.value) {

        alert("Please select your name first.");

        return;
    }


    const staffName =
        staffSelect.value;


    const workingShift =
        findWorkingShift(staffName);


    if (!workingShift) {

        alert(
            `${staffName} does not have an active shift.`
        );

        return;
    }


    pendingStaff = staffName;
    pendingAction = "end";


    openStaffPinModal();

}


/* =========================================================
   OPEN STAFF PIN MODAL
========================================================= */

function openStaffPinModal() {

    const modal =
        document.getElementById("staffPinModal");

    const pinInput =
        document.getElementById("staffPin");

    const pinName =
        document.getElementById("staffPinName");

    const pinError =
        document.getElementById("staffPinError");


    if (!modal) {
        return;
    }


    if (pinName) {

        if (pendingAction === "start") {

            pinName.textContent =
                `Enter ${pendingStaff}'s 4-digit PIN to start the shift.`;

        } else {

            pinName.textContent =
                `Enter ${pendingStaff}'s 4-digit PIN to end the shift.`;

        }

    }


    if (pinError) {
        pinError.style.display = "none";
    }


    /*
       Change button text depending on action.
    */

    const submitButton =
        modal.querySelector(".login-submit");


    if (submitButton) {

        if (pendingAction === "start") {

            submitButton.innerHTML =
                '<i class="fa-solid fa-right-to-bracket"></i> Verify & Start Shift';

        } else {

            submitButton.innerHTML =
                '<i class="fa-solid fa-right-from-bracket"></i> Verify & End Shift';

        }

    }


    modal.classList.add("show");


    if (pinInput) {

        pinInput.value = "";

        setTimeout(() => {
            pinInput.focus();
        }, 100);

    }

}


/* =========================================================
   CLOSE STAFF PIN MODAL
========================================================= */

function closeStaffPinModal() {

    const modal =
        document.getElementById("staffPinModal");

    const pinInput =
        document.getElementById("staffPin");

    const pinError =
        document.getElementById("staffPinError");


    if (modal) {
        modal.classList.remove("show");
    }


    if (pinInput) {
        pinInput.value = "";
    }


    if (pinError) {
        pinError.style.display = "none";
    }


    pendingStaff = "";
    pendingAction = "";

}


/* =========================================================
   VERIFY STAFF PIN
========================================================= */

function verifyStaffPin() {

    const pinInput =
        document.getElementById("staffPin");

    const enteredPin =
        pinInput ? pinInput.value.trim() : "";


    if (!pendingStaff) {
        return;
    }


    const correctPin =
        STAFF_PINS[pendingStaff];


    if (enteredPin !== correctPin) {

        showPinError(
            "Incorrect PIN. Please try again."
        );

        if (pinInput) {
            pinInput.select();
        }

        return;
    }


    /*
       Correct PIN.
    */

    if (pendingAction === "start") {

        performStartShift();

    } else if (pendingAction === "end") {

        performEndShift();

    }


    closeStaffPinModal();

}


/* =========================================================
   SHOW PIN ERROR
========================================================= */

function showPinError(message) {

    const error =
        document.getElementById("staffPinError");

    if (!error) {
        return;
    }

    error.textContent = message;

    error.style.display = "block";

}


/* =========================================================
   PERFORM START SHIFT
========================================================= */

function performStartShift() {

    const now = new Date();

    const record = {

        id:
            Date.now().toString() +
            Math.random().toString(36).substring(2, 8),

        staff: pendingStaff,

        date: getTodayDate(),

        clockIn: now.toISOString(),

        clockOut: null,

        hours: 0,

        status: "Working",

        autoLogout: false,

        notes: ""

    };


    attendanceRecords.push(record);

    saveRecords();

    refreshPage();


    alert(
        `${pendingStaff}'s shift started at ${formatTime(now)}.`
    );

}


/* =========================================================
   PERFORM END SHIFT
========================================================= */

function performEndShift() {

    const now = new Date();

    const workingShift =
        findWorkingShift(pendingStaff);


    if (!workingShift) {

        alert(
            "No active shift was found for this staff member."
        );

        return;
    }


    const clockIn =
        new Date(workingShift.clockIn);


    const millisecondsWorked =
        now.getTime() -
        clockIn.getTime();


    workingShift.clockOut =
        now.toISOString();


    workingShift.hours =
        millisecondsWorked;


    workingShift.status =
        "Completed";


    workingShift.autoLogout =
        false;


    saveRecords();

    refreshPage();


    alert(
        `${pendingStaff}'s shift ended at ${formatTime(now)}.`
    );

}


/* =========================================================
   RENDER TODAY'S ATTENDANCE
========================================================= */

function renderTodayAttendance() {

    const tbody =
        document.getElementById("todayAttendance");

    const empty =
        document.getElementById("emptyAttendance");


    if (!tbody) {
        return;
    }


    const today =
        getTodayDate();


    const todayRecords =
        attendanceRecords.filter(
            record => record.date === today
        );


    tbody.innerHTML = "";


    if (todayRecords.length === 0) {

        if (empty) {
            empty.style.display = "flex";
        }

        return;

    }


    if (empty) {
        empty.style.display = "none";
    }


    todayRecords
        .sort(
            (a, b) =>
                new Date(a.clockIn) -
                new Date(b.clockIn)
        )
        .forEach(record => {

            const row =
                document.createElement("tr");


            let statusClass = "status-working";

            if (record.status === "Completed") {
                statusClass = "status-completed";
            }

            if (record.status === "Logout Missing") {
                statusClass = "status-missing";
            }


            let hoursText =
                "0h 0m";


            if (record.clockOut) {

                hoursText =
                    formatHours(
                        new Date(record.clockOut).getTime() -
                        new Date(record.clockIn).getTime()
                    );

            } else {

                hoursText =
                    formatHours(
                        Date.now() -
                        new Date(record.clockIn).getTime()
                    );

            }


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(record.staff)}
                    </strong>
                </td>

                <td>
                    ${formatShortTime(record.clockIn)}
                </td>

                <td>
                    ${
                        record.clockOut
                            ? formatShortTime(record.clockOut)
                            : "-"
                    }
                </td>

                <td>
                    ${hoursText}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${escapeHTML(record.status)}
                    </span>
                </td>

            `;


            tbody.appendChild(row);

        });

}


/* =========================================================
   UPDATE TODAY SUMMARY
========================================================= */

function updateTodaySummary() {

    const today =
        getTodayDate();


    const todayRecords =
        attendanceRecords.filter(
            record => record.date === today
        );


    const staffToday =
        document.getElementById("staffToday");

    const completedToday =
        document.getElementById("completedToday");

    const totalToday =
        document.getElementById("totalToday");


    /*
       Unique staff who have records today.
    */

    const uniqueStaff =
        new Set(
            todayRecords.map(
                record => record.staff
            )
        );


    if (staffToday) {
        staffToday.textContent =
            uniqueStaff.size;
    }


    const completed =
        todayRecords.filter(
            record =>
                record.status === "Completed" ||
                record.status === "Logout Missing"
        );


    if (completedToday) {
        completedToday.textContent =
            completed.length;
    }


    let totalMilliseconds = 0;


    todayRecords.forEach(record => {

        if (record.clockOut) {

            totalMilliseconds +=
                new Date(record.clockOut).getTime() -
                new Date(record.clockIn).getTime();

        } else if (record.status === "Working") {

            totalMilliseconds +=
                Date.now() -
                new Date(record.clockIn).getTime();

        }

    });


    if (totalToday) {

        totalToday.textContent =
            formatHours(totalMilliseconds);

    }

}


/* =========================================================
   REFRESH PAGE
========================================================= */

function refreshPage() {

    /*
       First check automatic logout.
    */

    processAutomaticLogouts();


    renderTodayAttendance();

    updateTodaySummary();

    checkStaffStatus();

    updateClock();

}


/* =========================================================
   MANAGER LOGIN
========================================================= */

function openManagerLogin() {

    const modal =
        document.getElementById("managerModal");

    const username =
        document.getElementById("managerUsername");

    const password =
        document.getElementById("managerPassword");

    const error =
        document.getElementById("loginError");


    if (!modal) {
        return;
    }


    modal.classList.add("show");


    if (error) {
        error.style.display = "none";
    }


    if (username) {
        username.focus();
    }


    if (password) {
        password.value = "";
    }

}


/* =========================================================
   CLOSE MANAGER LOGIN
========================================================= */

function closeManagerLogin() {

    const modal =
        document.getElementById("managerModal");

    const username =
        document.getElementById("managerUsername");

    const password =
        document.getElementById("managerPassword");

    const error =
        document.getElementById("loginError");


    if (modal) {
        modal.classList.remove("show");
    }


    if (username) {
        username.value = "";
    }


    if (password) {
        password.value = "";
    }


    if (error) {
        error.style.display = "none";
    }

}


/* =========================================================
   MANAGER LOGIN VERIFY
========================================================= */

function managerLogin() {

    const username =
        document
            .getElementById("managerUsername")
            .value
            .trim();


    const password =
        document
            .getElementById("managerPassword")
            .value
            .trim();


    const error =
        document.getElementById("loginError");


    if (
        username === MANAGER_USERNAME &&
        password === MANAGER_PASSWORD
    ) {

        if (error) {
            error.style.display = "none";
        }


        closeManagerLogin();

        openDashboard();

        return;

    }


    if (error) {

        error.textContent =
            "Incorrect username or password.";

        error.style.display =
            "block";

    }

}


/* =========================================================
   OPEN MANAGER DASHBOARD
========================================================= */

function openDashboard() {

    /*
       Process any missed logout before displaying
       manager records.
    */

    processAutomaticLogouts();


    const dashboard =
        document.getElementById("dashboardModal");


    if (!dashboard) {
        return;
    }


    dashboard.classList.add("show");


    updateDashboard();

}


/* =========================================================
   CLOSE DASHBOARD
========================================================= */

function closeDashboard() {

    const dashboard =
        document.getElementById("dashboardModal");


    if (dashboard) {
        dashboard.classList.remove("show");
    }

}


/* =========================================================
   UPDATE DASHBOARD
========================================================= */

function updateDashboard() {

    processAutomaticLogouts();

    updateManagerSummary();

    renderStaffHours();

    renderAllRecords();

    updateClock();

}


/* =========================================================
   UPDATE MANAGER SUMMARY
========================================================= */

function updateManagerSummary() {

    const staffCount =
        document.getElementById(
            "managerStaffCount"
        );


    const workingCount =
        document.getElementById(
            "managerWorkingCount"
        );


    const totalHours =
        document.getElementById(
            "managerTotalHours"
        );


    const entryCount =
        document.getElementById(
            "managerEntryCount"
        );


    if (staffCount) {

        staffCount.textContent =
            STAFF_LIST.length;

    }


    const currentlyWorking =
        attendanceRecords.filter(
            record =>
                record.status === "Working"
        ).length;


    if (workingCount) {

        workingCount.textContent =
            currentlyWorking;

    }


    let totalMilliseconds = 0;


    attendanceRecords.forEach(record => {

        if (record.clockOut) {

            totalMilliseconds +=
                new Date(record.clockOut).getTime() -
                new Date(record.clockIn).getTime();

        } else if (record.status === "Working") {

            totalMilliseconds +=
                Date.now() -
                new Date(record.clockIn).getTime();

        }

    });


    if (totalHours) {

        totalHours.textContent =
            formatHours(totalMilliseconds);

    }


    if (entryCount) {

        entryCount.textContent =
            attendanceRecords.length;

    }

}


/* =========================================================
   GET STAFF TOTAL HOURS
========================================================= */

function getStaffTotalHours(staffName) {

    let totalMilliseconds = 0;


    attendanceRecords
        .filter(
            record =>
                record.staff === staffName
        )
        .forEach(record => {

            if (record.clockOut) {

                totalMilliseconds +=
                    new Date(record.clockOut).getTime() -
                    new Date(record.clockIn).getTime();

            } else if (record.status === "Working") {

                totalMilliseconds +=
                    Date.now() -
                    new Date(record.clockIn).getTime();

            }

        });


    return totalMilliseconds;

}


/* =========================================================
   RENDER STAFF HOURS
========================================================= */

function renderStaffHours() {

    const container =
        document.getElementById(
            "dashboardBody"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    STAFF_LIST.forEach(staff => {

        const totalMilliseconds =
            getStaffTotalHours(staff);


        const staffRecords =
            attendanceRecords.filter(
                record =>
                    record.staff === staff
            );


        const working =
            staffRecords.some(
                record =>
                    record.status === "Working"
            );


        const card =
            document.createElement("div");


        card.className =
            "staff-hours-card";


        card.innerHTML = `

            <div class="staff-hours-card-top">

                <div class="staff-avatar">
                    ${escapeHTML(staff.charAt(0))}
                </div>

                <div>

                    <h4>
                        ${escapeHTML(staff)}
                    </h4>

                    <span class="${working ? "working-text" : "not-working-text"}">
                        ${
                            working
                                ? "Currently Working"
                                : "Not Working"
                        }
                    </span>

                </div>

            </div>


            <div class="staff-hours-total">

                <span>
                    Total Hours
                </span>

                <strong>
                    ${formatHours(totalMilliseconds)}
                </strong>

            </div>


            <div class="staff-hours-entries">

                <span>
                    ${staffRecords.length}
                    ${staffRecords.length === 1 ? "entry" : "entries"}
                </span>

            </div>

        `;


        container.appendChild(card);

    });

}


/* =========================================================
   RENDER ALL RECORDS
========================================================= */

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
                    colspan="8"
                    class="empty-dashboard"
                >
                    No attendance records.
                </td>

            </tr>

        `;

        return;
    }


    /*
       Newest records first.
    */

    const sortedRecords =
        [...attendanceRecords].sort(
            (a, b) =>
                new Date(b.clockIn) -
                new Date(a.clockIn)
        );


    sortedRecords.forEach(record => {

        const row =
            document.createElement("tr");


        let hoursText =
            "0h 0m";


        if (record.clockOut) {

            hoursText =
                formatHours(
                    new Date(record.clockOut).getTime() -
                    new Date(record.clockIn).getTime()
                );

        } else {

            hoursText =
                formatHours(
                    Date.now() -
                    new Date(record.clockIn).getTime()
                );

        }


        let statusClass =
            "status-working";


        if (record.status === "Completed") {
            statusClass = "status-completed";
        }


        if (record.status === "Logout Missing") {
            statusClass = "status-missing";
        }


        const notes =
            record.notes || "";


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(record.staff)}
                </strong>
            </td>


            <td>
                ${formatDate(record.date)}
            </td>


            <td>
                ${formatShortTime(record.clockIn)}
            </td>


            <td>
                ${
                    record.clockOut
                        ? formatShortTime(record.clockOut)
                        : "-"
                }
            </td>


            <td>
                ${hoursText}
            </td>


            <td>
                <span class="status-badge ${statusClass}">
                    ${escapeHTML(record.status)}
                </span>
            </td>


            <!-- NOTES -->

            <td>

                <input
                    type="text"
                    class="record-note-input"
                    value="${escapeHTML(notes)}"
                    placeholder="Add note..."
                    onchange="updateRecordNote('${record.id}', this.value)"
                >

            </td>


            <!-- ACTION -->

            <td>

                <button
                    class="delete-record-btn"
                    onclick="deleteAttendanceRecord('${record.id}')"
                    title="Delete record"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   UPDATE RECORD NOTE
========================================================= */

function updateRecordNote(recordId, note) {

    const record =
        attendanceRecords.find(
            item =>
                item.id === recordId
        );


    if (!record) {
        return;
    }


    record.notes =
        note.trim();


    saveRecords();

}


/* =========================================================
   DELETE ATTENDANCE RECORD
========================================================= */

function deleteAttendanceRecord(recordId) {

    const record =
        attendanceRecords.find(
            item =>
                item.id === recordId
        );


    if (!record) {
        return;
    }


    const confirmed =
        confirm(
            `Delete ${record.staff}'s attendance record?`
        );


    if (!confirmed) {
        return;
    }


    attendanceRecords =
        attendanceRecords.filter(
            item =>
                item.id !== recordId
        );


    saveRecords();

    refreshPage();

    updateDashboard();

}


/* =========================================================
   CLEAR ALL RECORDS
========================================================= */

function clearAllRecords() {

    const confirmed =
        confirm(
            "Are you sure you want to delete ALL attendance records? This cannot be undone."
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


/* =========================================================
   ENTER KEY - STAFF PIN
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        const staffPin =
            document.getElementById("staffPin");


        const staffModal =
            document.getElementById("staffPinModal");


        if (
            event.key === "Enter" &&
            staffModal &&
            staffModal.classList.contains("show") &&
            staffPin &&
            document.activeElement === staffPin
        ) {

            verifyStaffPin();

        }

    }
);


/* =========================================================
   ENTER KEY - MANAGER LOGIN
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        const managerModal =
            document.getElementById("managerModal");


        const password =
            document.getElementById("managerPassword");


        if (
            event.key === "Enter" &&
            managerModal &&
            managerModal.classList.contains("show") &&
            password &&
            document.activeElement === password
        ) {

            managerLogin();

        }

    }
);


/* =========================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================================= */

window.addEventListener(
    "click",
    function(event) {

        const staffModal =
            document.getElementById("staffPinModal");


        const managerModal =
            document.getElementById("managerModal");


        if (
            staffModal &&
            event.target === staffModal
        ) {

            closeStaffPinModal();

        }


        if (
            managerModal &&
            event.target === managerModal
        ) {

            closeManagerLogin();

        }

    }
);


/* =========================================================
   INITIALISE SYSTEM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Load saved attendance.
        */

        loadRecords();


        /*
           Check for missed 8 PM logouts.
        */

        processAutomaticLogouts();


        /*
           Display current information.
        */

        refreshPage();


        /*
           Update clock every second.
        */

        setInterval(
            updateClock,
            1000
        );


        /*
           Check automatic logout every 30 seconds.
        */

        setInterval(
            function() {

                processAutomaticLogouts();

                refreshPage();

            },
            30000
        );


        /*
           Update manager dashboard if it is open.
        */

        setInterval(
            function() {

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

    }
);
