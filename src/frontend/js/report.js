const locationBtn = document.getElementById("locationBtn");
const locationStatus = document.getElementById("locationStatus");

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");

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

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            latitudeInput.value = latitude;
            longitudeInput.value = longitude;

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