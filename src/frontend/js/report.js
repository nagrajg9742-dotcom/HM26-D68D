const locationBtn = document.getElementById("locationBtn");
const locationStatus = document.getElementById("locationStatus");

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");

const complaintForm = document.getElementById("complaintForm");
const complaintMessage = document.getElementById("complaintMessage");

const API_URL = "http://localhost:5000/api/complaints";


// =====================================================
// GET CURRENT LOCATION
// =====================================================

locationBtn.addEventListener("click", function () {

    if (!navigator.geolocation) {
        locationStatus.textContent =
            "Location is not supported by this browser.";
        return;
    }

    locationStatus.textContent =
        "Getting your current location...";

    locationBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(

        function (position) {

            latitudeInput.value = position.coords.latitude;
            longitudeInput.value = position.coords.longitude;

            locationStatus.textContent =
                "✓ Location captured successfully.";

            locationBtn.textContent =
                "✓ Location Captured";

            locationBtn.disabled = false;
        },

        function (error) {

            locationBtn.disabled = false;

            if (error.code === 1) {
                locationStatus.textContent =
                    "Location permission was denied. Please allow location access.";
            } else if (error.code === 2) {
                locationStatus.textContent =
                    "Your location could not be determined.";
            } else {
                locationStatus.textContent =
                    "Unable to get your location. Please try again.";
            }
        }
    );
});


// =====================================================
// SAVE OFFLINE COMPLAINT
// =====================================================

function saveComplaintOffline(complaint) {

    const pendingComplaints =
        JSON.parse(
            localStorage.getItem("pendingComplaints") || "[]"
        );

    pendingComplaints.push(complaint);

    localStorage.setItem(
        "pendingComplaints",
        JSON.stringify(pendingComplaints)
    );

    console.log("Complaint saved offline.");
}


// =====================================================
// SYNC OFFLINE COMPLAINTS
// =====================================================

async function syncOfflineComplaints() {

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    const pendingComplaints =
        JSON.parse(
            localStorage.getItem("pendingComplaints") || "[]"
        );

    if (pendingComplaints.length === 0) {
        return;
    }

    complaintMessage.textContent =
        "Internet restored. Syncing offline complaints...";

    const remainingComplaints = [];

    for (const complaint of pendingComplaints) {

        try {

            const response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },

                    body: JSON.stringify(complaint)
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {

                console.log(
                    "Offline complaint synced successfully."
                );

            } else {

                // Keep failed complaint for another attempt
                remainingComplaints.push(complaint);

                console.log(
                    "Complaint could not be synced:",
                    data.message
                );
            }

        } catch (error) {

            // Internet may still be unavailable
            remainingComplaints.push(complaint);

            console.log(
                "Sync failed:",
                error
            );
        }
    }

    localStorage.setItem(
        "pendingComplaints",
        JSON.stringify(remainingComplaints)
    );

    if (remainingComplaints.length === 0) {

        complaintMessage.textContent =
            "✓ Offline complaints synced successfully!";

    } else {

        complaintMessage.textContent =
            "Some offline complaints are still waiting to sync.";
    }
}


// =====================================================
// AUTOMATIC SYNC WHEN INTERNET RETURNS
// =====================================================

window.addEventListener("online", function () {

    console.log("Internet connection restored.");

    syncOfflineComplaints();
});


// =====================================================
// SUBMIT COMPLAINT
// =====================================================

complaintForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const category =
            document.getElementById("category").value;

        const description =
            document.getElementById("description").value.trim();

        const latitude =
            latitudeInput.value;

        const longitude =
            longitudeInput.value;

        const token =
            localStorage.getItem("token");


        // -------------------------------------------------
        // CHECK LOGIN
        // -------------------------------------------------

        if (!token) {

            complaintMessage.textContent =
                "Please login before submitting a complaint.";

            return;
        }


        // -------------------------------------------------
        // CHECK LOCATION
        // -------------------------------------------------

        if (!latitude || !longitude) {

            complaintMessage.textContent =
                "Please capture your location before submitting.";

            return;
        }


        // -------------------------------------------------
        // CHECK REQUIRED FIELDS
        // -------------------------------------------------

        if (!category || !description) {

            complaintMessage.textContent =
                "Please fill in all required complaint details.";

            return;
        }


        // -------------------------------------------------
        // CREATE COMPLAINT DATA
        // -------------------------------------------------

        const complaintData = {

            title: category + " Complaint",

            description: description,

            category: category,

            latitude: Number(latitude),

            longitude: Number(longitude)

        };


        // -------------------------------------------------
        // OFFLINE MODE
        // -------------------------------------------------

        if (!navigator.onLine) {

            saveComplaintOffline(complaintData);

            complaintMessage.textContent =
                "📴 Offline — complaint saved and queued for sync.";

            return;
        }


        complaintMessage.textContent =
            "Submitting complaint...";


        // -------------------------------------------------
        // SEND TO BACKEND
        // -------------------------------------------------

        try {

            const response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },

                    body: JSON.stringify(complaintData)
                }
            );


            const data = await response.json();


            if (response.ok && data.success) {

                complaintMessage.textContent =
                    "✓ Complaint submitted successfully!";

                complaintForm.reset();

                locationStatus.textContent =
                    "Location not captured yet.";

                locationBtn.textContent =
                    "📍 Use My Current Location";

            } else {

                complaintMessage.textContent =
                    data.message ||
                    "Complaint submission failed.";
            }


        } catch (error) {

            console.error(
                "Complaint submission error:",
                error
            );

            // -------------------------------------------------
            // NETWORK FAILURE FALLBACK
            // -------------------------------------------------

            saveComplaintOffline(complaintData);

            complaintMessage.textContent =
                "📴 Network unavailable — complaint saved and queued.";
        }

    }
);


// =====================================================
// TRY SYNC ON PAGE LOAD
// =====================================================

window.addEventListener("load", function () {

    if (navigator.onLine) {
        syncOfflineComplaints();
    }

});