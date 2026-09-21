```javascript
/* =========================================
   K.P.'S KITCHEN STAFF ATTENDANCE SYSTEM
========================================= */


/* =========================================
   MANAGER LOGIN
========================================= */

const MANAGER_USERNAME = "manager";
const MANAGER_PASSWORD = "kp1234";


/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY = "kpsKitchenAttendance";


function getRecords() {
    const savedRecords = localStorage.getItem(STORAGE_KEY);

    if (!savedRecords) {
        return [];
    }

    try {
        return JSON.parse(savedRecords);
    } catch (error) {
        return [];
    }
}


function saveRecords(records) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );
}


/* =========================================
   CURRENT DATE AND TIME
========================================= */

function getCurrentDate() {
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


function getCurrentTime() {
    const now = new Date();

    const hours = String(
        now.getHours()
    ).padStart(2, "0");

    const minutes = String(
        now.getMinutes()
    ).padStart(2, "0");

    const seconds = String(
        now.getSeconds()
    ).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}


function formatDate(dateString) {
    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
        "en-AU",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function formatTime(timeString) {
    if (!timeString) {
        return "-";
    }

    const parts = timeString.split(":");

    let hours = Number(parts[0]);
    const minutes = parts[1];

    const suffix = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    return `${hours}:${minutes} ${suffix}`;
}


/* =========================================
   UPDATE CLOCK
========================================= */

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
            second: "2-digit"
        }
    );

    document.getElementById(
        "currentDate"
    ).textContent = dateText;

    document.getElementById(
        "currentTime"
    ).textContent = timeText;

    document.getElementById(
        "footerYear"
    ).textContent = now.getFullYear();
}


setInterval(updateClock, 1000);

updateClock();


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(text, type) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    message.className =
        "message " + type;

    setTimeout(() => {
        message.className = "message";
        message.textContent = "";
    }, 4000);
}


/* =========================================
   CLOCK IN
========================================= */

function clockIn() {

    const nameInput =
        document.getElementById("staffName");

    const name =
        nameInput.value.trim();

    if (!name) {

        showMessage(
            "Please enter the staff name.",
            "error"
        );

        nameInput.focus();

        return;
    }


    const records = getRecords();

    const today = getCurrentDate();

    const existingWorkingRecord =
        records.find(
            record =>
                record.name.toLowerCase() === name.toLowerCase() &&
                record.date === today &&
                !record.clockOut
        );


    if (existingWorkingRecord) {

        showMessage(
            `${name} is already clocked in.`,
            "error"
        );

        return;
    }


    const now = new Date();

    const record = {

        id:
            Date.now().toString(),

        name:
            name,

        date:
            today,

        clockIn:
            getCurrentTime(),

        clockOut:
            "",

        clockInTimestamp:
            now.getTime(),

        clockOutTimestamp:
            null
    };


    records.push(record);

    saveRecords(records);

    nameInput.value = "";

    showMessage(
        `${name} successfully clocked in at ${formatTime(record.clockIn)}.`,
        "success"
    );

    renderTodayRecords();

    updateManagerDashboard();
}


/* =========================================
   CLOCK OUT
========================================= */

function clockOut() {

    const nameInput =
        document.getElementById("staffName");

    const name =
        nameInput.value.trim();

    if (!name) {

        showMessage(
            "Please enter the staff name.",
            "error"
        );

        nameInput.focus();

        return;
    }


    const records = getRecords();

    const today = getCurrentDate();


    const record =
        records.find(
            item =>
                item.name.toLowerCase() === name.toLowerCase() &&
                item.date === today &&
                !item.clockOut
        );


    if (!record) {

        showMessage(
            `No active shift found for ${name}.`,
            "error"
        );

        return;
    }


    const now = new Date();

    record.clockOut =
        getCurrentTime();

    record.clockOutTimestamp =
        now.getTime();


    saveRecords(records);

    nameInput.value = "";


    const duration =
        calculateDuration(
            record.clockInTimestamp,
            record.clockOutTimestamp
        );


    showMessage(
        `${name} successfully clocked out. Shift duration: ${duration}.`,
        "success"
    );


    renderTodayRecords();

    updateManagerDashboard();
}


/* =========================================
   CALCULATE DURATION
========================================= */

function calculateDuration(
    startTimestamp,
    endTimestamp
) {

    if (!startTimestamp || !endTimestamp) {
        return "-";
    }


    let difference =
        endTimestamp - startTimestamp;


    if (difference < 0) {
        difference = 0;
    }


    const totalMinutes =
        Math.floor(
            difference / 60000
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    if (hours === 0) {
        return `${minutes} min`;
    }


    return `${hours} hr ${minutes} min`;
}


/* =========================================
   RENDER TODAY'S RECORDS
========================================= */

function renderTodayRecords() {

    const tableBody =
        document.getElementById(
            "attendanceTableBody"
        );

    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );

    const recordCount =
        document.getElementById(
            "recordCount"
        );


    const records =
        getRecords();


    const today =
        getCurrentDate();


    const todayRecords =
        records
            .filter(
                record =>
                    record.date === today
            )
            .sort(
                (a, b) =>
                    b.id.localeCompare(a.id)
            );


    tableBody.innerHTML = "";


    recordCount.textContent =
        `${todayRecords.length} ${
            todayRecords.length === 1
                ? "record"
                : "records"
        }`;


    if (todayRecords.length === 0) {

        emptyMessage.style.display =
            "block";

        return;

    }


    emptyMessage.style.display =
        "none";


    todayRecords.forEach(record => {

        const row =
            document.createElement("tr");


        const duration =
            record.clockOut
                ? calculateDuration(
                    record.clockInTimestamp,
                    record.clockOutTimestamp
                )
                : calculateLiveDuration(
                    record.clockInTimestamp
                );


        const status =
            record.clockOut
                ? `<span class="status status-completed">Completed</span>`
                : `<span class="status status-working">Working</span>`;


        row.innerHTML = `

            <td>
                <strong>${escapeHTML(record.name)}</strong>
            </td>

            <td>
                ${formatTime(record.clockIn)}
            </td>

            <td>
                ${formatTime(record.clockOut)}
            </td>

            <td>
                ${duration}
            </td>

            <td>
                ${status}
            </td>

        `;


        tableBody.appendChild(row);

    });
}


/* =========================================
   LIVE DURATION
========================================= */

function calculateLiveDuration(
    startTimestamp
) {

    if (!startTimestamp) {
        return "-";
    }


    return calculateDuration(
        startTimestamp,
        Date.now()
    );
}


/* =========================================
   MANAGER LOGIN MODAL
========================================= */

const managerLoginButton =
    document.getElementById(
        "managerLoginButton"
    );

const loginModal =
    document.getElementById(
        "loginModal"
    );

const closeLogin =
    document.getElementById(
        "closeLogin"
    );


managerLoginButton.addEventListener(
    "click",
    () => {

        loginModal.classList.add(
            "active"
        );

        document
            .getElementById("managerUsername")
            .focus();
    }
);


closeLogin.addEventListener(
    "click",
    () => {

        loginModal.classList.remove(
            "active"
        );

        clearLoginMessage();
    }
);


loginModal.addEventListener(
    "click",
    event => {

        if (
            event.target === loginModal
        ) {

            loginModal.classList.remove(
                "active"
            );

            clearLoginMessage();
        }
    }
);


/* =========================================
   LOGIN
========================================= */

document
    .getElementById("loginButton")
    .addEventListener(
        "click",
        managerLogin
    );


document
    .getElementById("managerPassword")
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                managerLogin();

            }

        }
    );


function managerLogin() {

    const username =
        document
            .getElementById(
                "managerUsername"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "managerPassword"
            )
            .value;


    const loginMessage =
        document.getElementById(
            "loginMessage"
        );


    if (
        username === MANAGER_USERNAME &&
        password === MANAGER_PASSWORD
    ) {

        loginMessage.textContent = "";

        loginModal.classList.remove(
            "active"
        );


        document
            .getElementById(
                "managerUsername"
            )
            .value = "";


        document
            .getElementById(
                "managerPassword"
            )
            .value = "";


        document
            .getElementById(
                "managerDashboard"
            )
            .classList.add(
                "active"
            );


        updateManagerDashboard();

    } else {

        loginMessage.textContent =
            "Incorrect username or password.";

    }
}


function clearLoginMessage() {

    document.getElementById(
        "loginMessage"
    ).textContent = "";
}


/* =========================================
   MANAGER LOGOUT
========================================= */

document
    .getElementById(
        "logoutButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "managerDashboard"
                )
                .classList.remove(
                    "active"
                );

        }
    );


/* =========================================
   MANAGER DASHBOARD
========================================= */

function updateManagerDashboard() {

    const records =
        getRecords();


    const totalRecords =
        document.getElementById(
            "totalRecords"
        );


    const activeStaff =
        document.getElementById(
            "activeStaff"
        );


    const completedShifts =
        document.getElementById(
            "completedShifts"
        );


    totalRecords.textContent =
        records.length;


    activeStaff.textContent =
        records.filter(
            record =>
                !record.clockOut
        ).length;


    completedShifts.textContent =
        records.filter(
            record =>
                record.clockOut
        ).length;


    renderManagerRecords();
}


/* =========================================
   RENDER MANAGER RECORDS
========================================= */

function renderManagerRecords() {

    const tableBody =
        document.getElementById(
            "managerTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "managerEmptyMessage"
        );


    const records =
        getRecords()
            .sort(
                (a, b) =>
                    b.id.localeCompare(a.id)
            );


    tableBody.innerHTML = "";


    if (records.length === 0) {

        emptyMessage.style.display =
            "block";

        return;

    }


    emptyMessage.style.display =
        "none";


    records.forEach(record => {

        const row =
            document.createElement("tr");


        const duration =
            record.clockOut
                ? calculateDuration(
                    record.clockInTimestamp,
                    record.clockOutTimestamp
                )
                : calculateLiveDuration(
                    record.clockInTimestamp
                );


        const status =
            record.clockOut
                ? `<span class="status status-completed">Completed</span>`
                : `<span class="status status-working">Working</span>`;


        row.innerHTML = `

            <td>
                ${formatDate(record.date)}
            </td>

            <td>
                <strong>${escapeHTML(record.name)}</strong>
            </td>

            <td>
                ${formatTime(record.clockIn)}
            </td>

            <td>
                ${formatTime(record.clockOut)}
            </td>

            <td>
                ${duration}
            </td>

            <td>
                ${status}
            </td>

            <td>
                <button
                    class="delete-button"
                    onclick="deleteRecord('${record.id}')"
                >
                    Delete
                </button>
            </td>

        `;


        tableBody.appendChild(row);

    });
}


/* =========================================
   DELETE RECORD
========================================= */

function deleteRecord(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this attendance record?"
        );


    if (!confirmDelete) {
        return;
    }


    let records =
        getRecords();


    records =
        records.filter(
            record =>
                record.id !== id
        );


    saveRecords(records);


    updateManagerDashboard();

    renderTodayRecords();
}


/* =========================================
   CLEAR ALL RECORDS
========================================= */

document
    .getElementById(
        "clearRecordsButton"
    )
    .addEventListener(
        "click",
        () => {

            const records =
                getRecords();


            if (records.length === 0) {

                alert(
                    "There are no records to clear."
                );

                return;

            }


            const confirmation =
                confirm(
                    "This will permanently delete ALL attendance records from this browser. Continue?"
                );


            if (!confirmation) {
                return;
            }


            localStorage.removeItem(
                STORAGE_KEY
            );


            updateManagerDashboard();

            renderTodayRecords();

            alert(
                "All attendance records have been cleared."
            );

        }
    );


/* =========================================
   SECURITY / HTML ESCAPE
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================
   UPDATE LIVE DASHBOARD TIMES
========================================= */

setInterval(
    () => {

        renderTodayRecords();

        const dashboard =
            document.getElementById(
                "managerDashboard"
            );


        if (
            dashboard.classList.contains(
                "active"
            )
        ) {

            updateManagerDashboard();

        }

    },
    30000
);


/* =========================================
   INITIAL LOAD
========================================= */

renderTodayRecords();

updateManagerDashboard();
```
