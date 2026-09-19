document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = loginForm?.querySelector("button");

    if (!loginForm || !emailInput || !passwordInput || !loginMessage || !loginButton) {
        console.error("Officer login form elements are missing.");
        return;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        loginMessage.textContent = "";
        loginMessage.className = "";

        if (!email || !password) {
            loginMessage.textContent = "Please enter your email and password.";
            loginMessage.className = "message-warning";
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        /*
         * REAL BACKEND LOGIN
         *
         * Endpoint:
         * POST /api/auth/login
         *
         * We will add the actual backend URL and exact
         * response handling after confirming Member 2's
         * running backend configuration.
         */

        loginMessage.textContent =
            "Login connection will be linked to the CivicTrack backend.";

        loginMessage.className = "message-warning";

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    });
});