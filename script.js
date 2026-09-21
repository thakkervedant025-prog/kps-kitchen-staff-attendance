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


// ================================
// LOGIN DETAILS
// ================================

// Staff PINs
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

// Manager login
const MANAGER_USERNAME = "manager";
const MANAGER_PASSWORD = "kp1234";


// ================================
// STORAGE
// ================================

const STORAGE_KEY = "kpsKitchenAttendance";

let selectedStaffForLogin = null;


// ================================
// GET RECORDS
// ================================

function getRecords() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const records = JSON.parse(saved);

        return Array.isArray(records) ? records : [];

    } catch (error) {

        console.error("Could not load attendance records:", error);

        return [];
    }
}


// ================================
// SAVE RECORDS
// ================================

function saveRecords(records) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );

}


// ================================
// LOCAL DATE
// ================================

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


// ================================
// CURRENT TIME
// ================================

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


// ================================
// DISPLAY DATE
// ================================

function updateDateTime() {

    const now = new Date();

    document.getElementById("currentDate").textContent =
        now.toLocaleDateString(
            "en-AU",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    document.getElementById("currentTime").textContent =
        now.toLocaleTimeString(
            "en-AU",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        );
}


// ================================
// FIND ACTIVE SHIFT
// ================================

function getActiveShift(staffName) {

    const records = getRecords();

    return records.find(function(record) {

        return (
            record.name === staffName &&
            record.clockOut === null
        );

    });

}


// ================================
// CHECK STAFF STATUS
// ================================

function checkStaffStatus() {

    const staffName =
        document.getElementById("staffName").value;

    const status =
        document.getElementById("staffStatus");

    const startButton =
        document.getElementById("startShiftBtn");

    const endButton =
        document.getElementById("endShiftBtn");


    if (!staffName) {

        status.textContent =
            "Please select your name.";

        status.className = "status";

        startButton.disabled = false;

        endButton.disabled = true;

        return;
    }


    const activeShift =
        getActiveShift(staffName);


    if (activeShift) {

        status.textContent =
            `${staffName} is currently working. Started at ${activeShift.clockIn}.`;

        status.className =
            "status active";

        startButton.disabled = true;

        endButton.disabled = false;

    } else {

        status.textContent =
            `${staffName} is ready to start a shift.`;

        status.className =
            "status ready";

        startButton.disabled = false;

        endButton.disabled = true;
    }
}


// ================================
// START SHIFT
// ================================

function startShift() {

    const staffName =
        document.getElementById("staffName").value;


    if (!staffName) {

        alert("Please select your name first.");

        return;
    }


    const activeShift =
        getActiveShift(staffName);


    if (activeShift) {

        alert(
            `${staffName} already has an active shift.`
        );

        return;
    }


    selectedStaffForLogin = staffName;

    document.getElementById("staffPin").value = "";

    document.getElementById("staffLoginError").textContent = "";

    document.getElementById("staffLoginMessage").textContent =
        `Enter ${staffName}'s PIN to start the shift.`;


    document
        .getElementById("staffLoginModal")
        .classList.add("show");


    setTimeout(function() {

        document
            .getElementById("staffPin")
            .focus();

    }, 100);

}


// ================================
// CONFIRM STAFF LOGIN
// ================================

function confirmStaffLogin() {

    const pin =
        document.getElementById("staffPin").value.trim();

    const error =
        document.getElementById("staffLoginError");


    if (!selectedStaffForLogin) {

        error.textContent =
            "Please select your name again.";

        return;
    }


    const correctPin =
        STAFF_PINS[selectedStaffForLogin];


    if (pin !== correctPin) {

        error.textContent =
            "Incorrect PIN. Please try again.";

        document.getElementById("staffPin").value = "";

        return;
    }


    // LOGIN SUCCESSFUL

    const now = new Date();

    const record = {

        id: Date.now(),

        name: selectedStaffForLogin,

        date: getLocalDate(),

        clockIn: getCurrentTime(),

        clockOut: null,

        startTimestamp: now.getTime(),

        endTimestamp: null

    };


    const records = getRecords();

    records.push(record);

    saveRecords(records);


    closeStaffLogin();


    alert(
        `Shift started successfully for ${selectedStaffForLogin} at ${record.clockIn}.`
    );


    checkStaffStatus();

    renderToday();

    renderSummary();

}


// ================================
// CLOSE STAFF LOGIN
// ================================

function closeStaffLogin() {

    document
        .getElementById("staffLoginModal")
        .classList.remove("show");

    document.getElementById("staffPin").value = "";

    document.getElementById("staffLoginError").textContent = "";

    selectedStaffForLogin = null;
}


// ================================
// END SHIFT
// ================================

function endShift() {

    const staffName =
        document.getElementById("staffName").value;


    if (!staffName) {

        alert("Please select your name.");

        return;
    }


    const records = getRecords();


    const activeIndex =
        records.findIndex(function(record) {

            return (
                record.name === staffName &&
                record.clockOut === null
            );

        });


    if (activeIndex === -1) {

        alert(
            "There is no active shift for this staff member."
        );

        checkStaffStatus();

        return;
    }


    const now = new Date();


    records[activeIndex].clockOut =
        getCurrentTime();

    records[activeIndex].endTimestamp =
        now.getTime();


    saveRecords(records);


    const duration =
        getRecordMinutes(records[activeIndex]);


    alert(
        `Shift ended at ${records[activeIndex].clockOut}.\n\nHours worked: ${formatMinutes(duration)}`
    );


    checkStaffStatus();

    renderToday();

    renderSummary();

}


// ================================
// CALCULATE MINUTES
// ================================

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


// ================================
// FORMAT MINUTES
// ================================

function formatMinutes(minutes) {

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;


    return `${hours}h ${mins}m`;
}


// ================================
// TODAY'S RECORDS
// ================================

function getTodayRecords() {

    const today =
        getLocalDate();

    return getRecords().filter(function(record) {

        return record.date === today;

    });

}


// ================================
// RENDER TODAY
// ================================

function renderToday() {

    const tbody =
        document.getElementById("todayTableBody");

    const records =
        getTodayRecords();


    if (records.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No shifts recorded today.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = "";


    records.forEach(function(record) {

        const row =
            document.createElement("tr");


        const minutes =
            getRecordMinutes(record);


        let hours = "-";

        if (record.clockOut) {

            hours =
                formatMinutes(minutes);
        }


        let statusHTML;


        if (record.clockOut) {

            statusHTML =
                `<span class="badge badge-complete">Completed</span>`;

        } else {

            statusHTML =
                `<span class="badge badge-active">Working</span>`;
        }


        row.innerHTML = `

            <td><strong>${record.name}</strong></td>

            <td>${record.clockIn}</td>

            <td>${record.clockOut || "—"}</td>

            <td>${hours}</td>

            <td>${statusHTML}</td>

        `;


        tbody.appendChild(row);

    });

}


// ================================
// SUMMARY
// ================================

function renderSummary() {

    const records =
        getTodayRecords();


    const uniqueStaff =
        new Set(
            records.map(function(record) {
                return record.name;
            })
        );


    const completed =
        records.filter(function(record) {

            return record.clockOut;

        });


    let totalMinutes = 0;


    completed.forEach(function(record) {

        totalMinutes +=
            getRecordMinutes(record);

    });


    document.getElementById("staffToday").textContent =
        uniqueStaff.size;


    document.getElementById("completedToday").textContent =
        completed.length;


    document.getElementById("hoursToday").textContent =
        formatMinutes(totalMinutes);

}


// ================================
// MANAGER LOGIN
// ================================

function openManagerLogin() {

    document
        .getElementById("managerLoginModal")
        .classList.add("show");


    document.getElementById("managerUsername").value = "";

    document.getElementById("managerPassword").value = "";

    document.getElementById("managerLoginError").textContent = "";


    setTimeout(function() {

        document
            .getElementById("managerUsername")
            .focus();

    }, 100);

}


function closeManagerLogin() {

    document
        .getElementById("managerLoginModal")
        .classList.remove("show");

}


// ================================
// MANAGER LOGIN CHECK
// ================================

function loginManager() {

    const username =
        document
            .getElementById("managerUsername")
            .value
            .trim();


    const password =
        document
            .getElementById("managerPassword")
            .value;


    const error =
        document.getElementById("managerLoginError");


    if (
        username === MANAGER_USERNAME &&
        password === MANAGER_PASSWORD
    ) {

        closeManagerLogin();

        openDashboard();

    } else {

        error.textContent =
            "Incorrect username or password.";

    }

}


// ================================
// OPEN DASHBOARD
// ================================

function openDashboard() {

    renderDashboard();

    document
        .getElementById("dashboardModal")
        .classList.add("show");

}


// ================================
// CLOSE DASHBOARD
// ================================

function closeDashboard() {

    document
        .getElementById("dashboardModal")
        .classList.remove("show");

}


// ================================
// RENDER DASHBOARD
// ================================

function renderDashboard() {

    const records =
        getRecords();


    let totalMinutes = 0;

    let completedCount = 0;


    records.forEach(function(record) {

        if (record.clockOut) {

            completedCount++;

            totalMinutes +=
                getRecordMinutes(record);

        }

    });


    document.getElementById("dashStaffCount").textContent =
        STAFF_NAMES.length;


    document.getElementById("dashCompleted").textContent =
        completedCount;


    document.getElementById("dashTotalHours").textContent =
        formatMinutes(totalMinutes);


    renderStaffHours();

    renderAllRecords();

}


// ================================
// STAFF HOURS
// ================================

function renderStaffHours() {

    const grid =
        document.getElementById("staffHoursGrid");


    grid.innerHTML = "";


    const records =
        getRecords();


    STAFF_NAMES.forEach(function(name) {

        const staffRecords =
            records.filter(function(record) {

                return (
                    record.name === name &&
                    record.clockOut
                );

            });


        let totalMinutes = 0;


        staffRecords.forEach(function(record) {

            totalMinutes +=
                getRecordMinutes(record);

        });


        const card =
            document.createElement("div");


        card.className =
            "staff-hour-card";


        card.innerHTML = `

            <div class="name">
                ${name}
            </div>

            <div class="hours">
                ${formatMinutes(totalMinutes)}
            </div>

            <div class="shift-count">
                ${staffRecords.length}
                completed shift${staffRecords.length === 1 ? "" : "s"}
            </div>

        `;


        grid.appendChild(card);

    });

}


// ================================
// ALL RECORDS
// ================================

function renderAllRecords() {

    const tbody =
        document.getElementById("allRecordsBody");


    const records =
        getRecords().slice().reverse();


    if (records.length === 0) {

        tbody.innerHTML = `

            <tr>
                <td colspan="6" class="empty">
                    No attendance records yet.
                </td>
            </tr>

        `;

        return;
    }


    tbody.innerHTML = "";


    records.forEach(function(record) {

        const row =
            document.createElement("tr");


        let hours = "Working";


        if (record.clockOut) {

            hours =
                formatMinutes(
                    getRecordMinutes(record)
                );

        }


        row.innerHTML = `

            <td><strong>${record.name}</strong></td>

            <td>${record.date}</td>

            <td>${record.clockIn}</td>

            <td>${record.clockOut || "—"}</td>

            <td>${hours}</td>

            <td>
                <button
                    class="delete-btn"
                    onclick="deleteRecord(${record.id})"
                >
                    Delete
                </button>
            </td>

        `;


        tbody.appendChild(row);

    });

}


// ================================
// DELETE RECORD
// ================================

function deleteRecord(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this attendance record?"
        );


    if (!confirmed) {
        return;
    }


    const records =
        getRecords().filter(function(record) {

            return record.id !== id;

        });


    saveRecords(records);


    renderDashboard();

    renderToday();

    renderSummary();

    checkStaffStatus();

}


// ================================
// CLEAR ALL
// ================================

function clearAllRecords() {

    const records =
        getRecords();


    if (records.length === 0) {

        alert("There are no attendance records to delete.");

        return;
    }


    const confirmed =
        confirm(
            "WARNING: This will permanently delete ALL attendance records from this browser.\n\nContinue?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(STORAGE_KEY);


    renderDashboard();

    renderToday();

    renderSummary();

    checkStaffStatus();


    alert("All attendance records have been cleared.");

}


// ================================
// ENTER KEY LOGIN
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDateTime();

        renderToday();

        renderSummary();

        checkStaffStatus();


        setInterval(
            updateDateTime,
            1000
        );


        document
            .getElementById("staffPin")
            .addEventListener(
                "keydown",
                function(event) {

                    if (event.key === "Enter") {

                        confirmStaffLogin();

                    }

                }
            );


        document
            .getElementById("managerPassword")
            .addEventListener(
                "keydown",
                function(event) {

                    if (event.key === "Enter") {

                        loginManager();

                    }

                }
            );

    }
);


// ================================
// AUTO REFRESH
// ================================

setInterval(
    function() {

        renderToday();

        renderSummary();

        const staffName =
            document.getElementById("staffName").value;

        if (staffName) {
            checkStaffStatus();
        }

    },
    30000
);
