const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (name === "" || email === "" || phone === "" ||
        password === "" || confirmPassword === "") {

        registerMessage.textContent = "Please fill in all fields.";
        return;
    }

    if (password.length < 8) {
        registerMessage.textContent =
            "Password must be at least 8 characters.";
        return;
    }

    if (password !== confirmPassword) {
        registerMessage.textContent =
            "Passwords do not match.";
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        registerMessage.textContent =
            "Please enter a valid 10-digit phone number.";
        return;
    }

    registerMessage.textContent =
        "Details look good. Ready to connect to the server!";
});

const evidenceInput = document.getElementById("evidence");

evidenceInput.addEventListener("change", function () {

    const file = evidenceInput.files[0];

    if (!file) {
        return;
    }

    const maxSize = 20 * 1024 * 1024; // 20 MB

    if (file.size > maxSize) {
        alert("File is too large. Please choose a file below 20 MB.");
        evidenceInput.value = "";
        return;
    }

    console.log("Evidence selected:", file.name);
    console.log("File type:", file.type);
    console.log("File size:", file.size);
});

const complaintForm = document.getElementById("complaintForm");
const complaintMessage = document.getElementById("complaintMessage");

complaintForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value.trim();
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const evidence = document.getElementById("evidence").files[0];

    // Check category
    if (!category) {
        complaintMessage.textContent =
            "Please select a problem category.";
        return;
    }

    // Check description
    if (!description) {
        complaintMessage.textContent =
            "Please describe the problem.";
        return;
    }

    // Check location
    if (!latitude || !longitude) {
        complaintMessage.textContent =
            "Please capture your current location.";
        return;
    }

    // Collect the complaint data
    const complaintData = {
        category: category,
        description: description,
        latitude: latitude,
        longitude: longitude,
        evidence: evidence ? evidence.name : null
    };

    console.log("Complaint ready to send:", complaintData);

    complaintMessage.textContent =
        "Complaint details are ready. Waiting for the server connection.";
});