const markAllReadBtn = document.getElementById("markAllReadBtn");
const notificationEmpty = document.getElementById("notificationEmpty");

markAllReadBtn.addEventListener("click", function () {
    markAllReadBtn.textContent = "All notifications read";
    markAllReadBtn.disabled = true;

    notificationEmpty.innerHTML = `
        <div class="notification-icon">
            ✓
        </div>

        <h3>You're all caught up</h3>

        <p>
            You don't have any unread notifications.
        </p>
    `;
});