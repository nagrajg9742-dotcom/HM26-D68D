/* =========================================================
   CIVICTRACK - OFFICER JAVASCRIPT
   ========================================================= */

/* ---------- Backend Configuration ---------- */

const API_BASE_URL = "http://localhost:5000/api";

const TOKEN_KEY = "civictrack_token";


/* =========================================================
   COMMON HELPERS
   ========================================================= */

/* Get JWT token stored by the Officer login */

function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}


/* Show a message safely */

function showMessage(element, message, type = "") {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = type;
}


/* Get numeric complaint ID from URL */

function getComplaintId() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        return null;
    }

    if (!/^\d+$/.test(id)) {
        return null;
    }

    return Number(id);
}


/* =========================================================
   OFFICER LOGIN
   ========================================================= */

function setupLogin() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = loginForm.querySelector("button");

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        showMessage(loginMessage, "");

        if (!email || !password) {

            showMessage(
                loginMessage,
                "Please enter your email and password.",
                "message-warning"
            );

            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {

            const response = await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                showMessage(
                    loginMessage,
                    data.message || "Login failed.",
                    "message-error"
                );

                return;
            }


            if (!data.token) {

                showMessage(
                    loginMessage,
                    "Login succeeded but no authentication token was returned.",
                    "message-error"
                );

                return;
            }


            /* Store the real JWT */

            localStorage.setItem(
                TOKEN_KEY,
                data.token
            );


            showMessage(
                loginMessage,
                "Login successful. Opening dashboard...",
                "message-success"
            );


            /* Go to Officer Dashboard */

            window.location.href = "dashboard.html";

        }

        catch (error) {

            console.error("Login error:", error);

            showMessage(
                loginMessage,
                "Unable to connect to the CivicTrack backend.",
                "message-error"
            );

        }

        finally {

            loginButton.disabled = false;
            loginButton.textContent = "Login";

        }

    });
}


/* =========================================================
   COMPLAINT DETAILS NAVIGATION
   ========================================================= */

function openComplaintDetails(complaintId) {

    if (!complaintId) {

        console.error("Complaint ID is missing.");

        return;
    }

    const numericId = Number(complaintId);

    if (!Number.isInteger(numericId) || numericId <= 0) {

        console.error("Complaint ID must be a positive number.");

        return;
    }

    window.location.href =
        `complaint-details.html?id=${encodeURIComponent(numericId)}`;
}


/* =========================================================
   RESCUE API
   ========================================================= */

function setupRescueButton() {

    const rescueButton =
        document.getElementById("rescueButton");

    if (!rescueButton) {
        return;
    }


    const rescueMessage =
        document.getElementById("rescueMessage");


    rescueButton.addEventListener("click", async () => {

        /* Get numeric complaint ID from URL */

        const complaintId = getComplaintId();


        if (!complaintId) {

            showMessage(
                rescueMessage,
                "A valid complaint ID is required to trigger rescue.",
                "message-error"
            );

            return;
        }


        /* Get JWT */

        const token = getAuthToken();


        if (!token) {

            showMessage(
                rescueMessage,
                "Your officer session has expired. Please log in again.",
                "message-error"
            );

            return;
        }


        /* Prevent repeated clicks */

        rescueButton.disabled = true;
        rescueButton.textContent = "Triggering Rescue...";


        try {

            const response = await fetch(
                `${API_BASE_URL}/complaints/${complaintId}/rescue`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",

                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        reason: "Emergency assistance required",
                        priority: "high"
                    })
                }
            );


            const data = await response.json();


            /* ---------- Success ---------- */

            if (response.ok && data.success) {

                showMessage(
                    rescueMessage,
                    data.message || "Rescue request created successfully.",
                    "message-success"
                );

                return;
            }


            /* ---------- 400 ---------- */

            if (response.status === 400) {

                showMessage(
                    rescueMessage,
                    data.message ||
                    "Invalid rescue request. Please check the reason and priority.",
                    "message-error"
                );

                return;
            }


            /* ---------- 404 ---------- */

            if (response.status === 404) {

                showMessage(
                    rescueMessage,
                    data.message ||
                    "Complaint not found.",
                    "message-error"
                );

                return;
            }


            /* ---------- 500 ---------- */

            if (response.status === 500) {

                showMessage(
                    rescueMessage,
                    "Server error while creating the rescue request.",
                    "message-error"
                );

                return;
            }


            /* ---------- Other errors ---------- */

            showMessage(
                rescueMessage,
                data.message || "Unable to create rescue request.",
                "message-error"
            );

        }

        catch (error) {

            console.error("Rescue API error:", error);

            showMessage(
                rescueMessage,
                "Unable to connect to the CivicTrack backend.",
                "message-error"
            );

        }

        finally {

            rescueButton.disabled = false;
            rescueButton.textContent = "Trigger Rescue";

        }

    });
}


/* =========================================================
   INITIALIZE OFFICER PAGES
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupLogin();

    setupRescueButton();

});