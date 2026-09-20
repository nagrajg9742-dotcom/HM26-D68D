const locationBtn = document.getElementById("locationBtn");
const locationStatus = document.getElementById("locationStatus");

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");

const complaintForm = document.getElementById("complaintForm");
const complaintMessage = document.getElementById("complaintMessage");


// -------------------------
// Get Current Location
// -------------------------

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


// -------------------------
// Submit Complaint
// -------------------------

complaintForm.addEventListener("submit", async function (event) {

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


    // Check login
    if (!token) {
        complaintMessage.textContent =
            "Please login before submitting a complaint.";
        return;
    }


    // Check location
    if (!latitude || !longitude) {
        complaintMessage.textContent =
            "Please capture your location before submitting.";
        return;
    }


    // Check required fields
    if (!category || !description) {
        complaintMessage.textContent =
            "Please fill in all required complaint details.";
        return;
    }


    complaintMessage.textContent =
        "Submitting complaint...";


    try {

        const response = await fetch(
            "http://localhost:5000/api/complaints",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify({

                    // Backend requires title
                    title: category + " Complaint",

                    description: description,

                    category: category,

                    latitude: Number(latitude),

                    longitude: Number(longitude)

                })
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
                data.message || "Complaint submission failed.";
        }


    } catch (error) {

        console.error("Complaint submission error:", error);

        complaintMessage.textContent =
            "Unable to connect to the server.";
    }

});

