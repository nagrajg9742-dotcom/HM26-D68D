const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        registerMessage.textContent =
            "Please fill in all required fields.";
        return;
    }

    registerMessage.textContent = "Creating your account...";

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok && data.success) {
            registerMessage.textContent =
                "✓ Account created successfully!";

            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);

        } else {
            registerMessage.textContent =
                data.message || "Registration failed.";
        }

    } catch (error) {
        console.error("Registration error:", error);

        registerMessage.textContent =
            "Unable to connect to the server.";
    }
});