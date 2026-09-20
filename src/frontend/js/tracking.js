const trackBtn = document.getElementById("trackBtn");
const complaintIdInput = document.getElementById("complaintId");
const trackingMessage = document.getElementById("trackingMessage");
const complaintDetails = document.getElementById("complaintDetails");

complaintDetails.style.display = "none";

trackBtn.addEventListener("click", function () {

    const complaintId = complaintIdInput.value.trim();

    if (!complaintId) {
        trackingMessage.textContent =
            "Please enter your complaint ID.";
        complaintDetails.style.display = "none";
        return;
    }

    trackingMessage.textContent =
        "Tracking will be connected to your complaint data soon.";

    complaintDetails.style.display = "none";
});