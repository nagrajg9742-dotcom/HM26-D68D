const reopenBtn = document.getElementById("reopenBtn");
const reopenMessage = document.getElementById("reopenMessage");

reopenBtn.addEventListener("click", function () {

    const complaintId =
        document.getElementById("reopenComplaintId").value.trim();

    const reason =
        document.getElementById("reopenReason").value.trim();

    if (!complaintId) {
        reopenMessage.textContent =
            "Please enter your complaint ID.";
        return;
    }

    if (!reason) {
        reopenMessage.textContent =
            "Please explain why the complaint should be reopened.";
        return;
    }

    reopenMessage.textContent =
        "Your reopening request will be submitted when the backend is connected.";

    reopenBtn.disabled = true;
});
