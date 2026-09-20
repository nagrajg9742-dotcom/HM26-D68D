const trackBtn = document.getElementById("trackBtn");
const complaintIdInput = document.getElementById("complaintId");
const trackingMessage = document.getElementById("trackingMessage");
const complaintDetails = document.getElementById("complaintDetails");

const displayComplaintId =
    document.getElementById("displayComplaintId");

const displayCategory =
    document.getElementById("displayCategory");

const displayStatus =
    document.getElementById("displayStatus");

const displayLocation =
    document.getElementById("displayLocation");

const displayDate =
    document.getElementById("displayDate");


trackBtn.addEventListener("click", async function () {

    const complaintId =
        complaintIdInput.value.trim();

    const token =
        localStorage.getItem("token");


    if (!token) {

        trackingMessage.textContent =
            "Please login first.";

        complaintDetails.style.display = "none";

        return;
    }


    if (!complaintId) {

        trackingMessage.textContent =
            "Please enter your complaint ID.";

        complaintDetails.style.display = "none";

        return;
    }


    trackingMessage.textContent =
        "Loading complaint...";


    try {

        const response = await fetch(
            "http://localhost:5000/api/complaints",
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            trackingMessage.textContent =
                data.message || "Unable to load complaints.";

            return;
        }


        const complaint =
            data.complaints.find(function (item) {

                return String(item.id) === complaintId;

            });


        if (!complaint) {

            trackingMessage.textContent =
                "Complaint not found.";

            complaintDetails.style.display = "none";

            return;
        }


        // Show complaint details

        displayComplaintId.textContent =
            complaint.id;

        displayCategory.textContent =
            complaint.category;

        displayStatus.textContent =
            complaint.status.replace(/_/g, " ");

        displayLocation.textContent =
            complaint.latitude + ", " +
            complaint.longitude;

        displayDate.textContent =
            new Date(complaint.created_at)
                .toLocaleString();


        // Show result section

        complaintDetails.style.display = "block";


        trackingMessage.textContent =
            "✓ Complaint found successfully.";


        // Update timeline

        updateTimeline(complaint.status);

    }

    catch (error) {

        console.error(error);

        trackingMessage.textContent =
            "Unable to connect to the server.";

        complaintDetails.style.display = "none";
    }

});


// Timeline

function updateTimeline(status) {

    const timelineItems =
        document.querySelectorAll(".timeline-item");


    timelineItems.forEach(function (item, index) {

        item.classList.remove("completed");
        item.classList.remove("current");

        const dot =
            item.querySelector(".timeline-dot");

        const label =
            item.querySelector(".timeline-content span");


        if (status === "submitted") {

            if (index === 0) {

                item.classList.add("current");
                dot.textContent = "●";
                label.textContent = "Current";

            } else {

                dot.textContent = index + 1;
                label.textContent = "Waiting";

            }

        }

        else if (status === "assigned") {

            if (index < 1) {

                item.classList.add("completed");
                dot.textContent = "✓";

            } else if (index === 1) {

                item.classList.add("current");
                dot.textContent = "●";
                label.textContent = "Current";

            }

        }

        else if (status === "in_progress") {

            if (index < 2) {

                item.classList.add("completed");
                dot.textContent = "✓";

            } else if (index === 2) {

                item.classList.add("current");
                dot.textContent = "●";
                label.textContent = "Current";

            }

        }

        else if (status === "resolved") {

            if (index < 3) {

                item.classList.add("completed");
                dot.textContent = "✓";

            } else if (index === 3) {

                item.classList.add("current");
                dot.textContent = "●";
                label.textContent = "Current";

            }

        }

        else if (status === "verified" || status === "closed") {

            if (index < 4) {

                item.classList.add("completed");
                dot.textContent = "✓";

            } else {

                item.classList.add("current");
                dot.textContent = "●";
                label.textContent = "Current";

            }

        }

    });

}