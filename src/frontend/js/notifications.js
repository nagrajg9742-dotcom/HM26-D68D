const notificationEmpty =
    document.getElementById("notificationEmpty");

const notificationList =
    document.getElementById("notificationList");

const markAllReadBtn =
    document.getElementById("markAllReadBtn");

const token =
    localStorage.getItem("token");


// Load notifications
if (!token) {

    notificationEmpty.innerHTML = `
        <div class="notification-icon">
            🔒
        </div>

        <h3>Please login</h3>

        <p>
            Login to view your notifications.
        </p>
    `;

} else {

    loadNotifications();

}


// ------------------------------------
// Get Notifications
// ------------------------------------

async function loadNotifications() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/notifications",
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            notificationEmpty.innerHTML = `
                <div class="notification-icon">
                    ⚠️
                </div>

                <h3>Unable to load notifications</h3>

                <p>
                    ${data.message || "Something went wrong."}
                </p>
            `;

            return;
        }


        const notifications =
            data.notifications || [];


        // No notifications
        if (notifications.length === 0) {

            notificationEmpty.style.display = "block";
            notificationList.innerHTML = "";

            return;
        }


        // Notifications exist
        notificationEmpty.style.display = "none";

        notificationList.innerHTML = "";


        notifications.forEach(function (notification) {

            const notificationItem =
                document.createElement("div");

            notificationItem.className =
                "notification-item";


            notificationItem.innerHTML = `

                <div class="notification-icon">
                    🔔
                </div>

                <div class="notification-content">

                    <h3>
                        ${notification.title || "Notification"}
                    </h3>

                    <p>
                        ${notification.message || ""}
                    </p>

                    <span>
                        ${new Date(
                            notification.created_at
                        ).toLocaleString()}
                    </span>

                </div>

            `;


            notificationList.appendChild(
                notificationItem
            );

        });

    }

    catch (error) {

        console.error(
            "Notification error:",
            error
        );

        notificationEmpty.innerHTML = `
            <div class="notification-icon">
                ⚠️
            </div>

            <h3>Unable to connect to server</h3>

            <p>
                Please make sure the CivicTrack backend is running.
            </p>
        `;

    }

}


// ------------------------------------
// Mark All As Read
// ------------------------------------

markAllReadBtn.addEventListener(
    "click",
    async function () {

        if (!token) {
            return;
        }


        try {

            const response = await fetch(
                "http://localhost:5000/api/notifications/read-all",
                {
                    method: "PATCH",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


            const data =
                await response.json();


            if (response.ok && data.success) {

                markAllReadBtn.textContent =
                    "All notifications read";

                markAllReadBtn.disabled =
                    true;

                loadNotifications();

            } else {

                console.log(
                    data.message ||
                    "Unable to mark notifications as read."
                );

            }

        }

        catch (error) {

            console.error(
                "Mark notifications error:",
                error
            );

        }

    }
);