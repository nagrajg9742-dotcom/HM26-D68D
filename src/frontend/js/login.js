const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Logging in...";

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
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

        if (response.ok && data.success) {
            loginMessage.textContent = "✓ Login successful!";

            // Save JWT token
            localStorage.setItem("token", data.token);

            // Save user details if provided by backend
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1000);

        } else {
            loginMessage.textContent =
                data.message || "Login failed.";
        }

    } catch (error) {
        console.error("Login error:", error);

        loginMessage.textContent =
            "Unable to connect to the server.";
    }
});
