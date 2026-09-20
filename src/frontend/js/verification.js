const resolvedBtn = document.getElementById("resolvedBtn");
const notResolvedBtn = document.getElementById("notResolvedBtn");
const verificationMessage =
    document.getElementById("verificationMessage");

resolvedBtn.addEventListener("click", function () {

    verificationMessage.textContent =
        "Your confirmation will be submitted when the backend is connected.";

    resolvedBtn.disabled = true;
    notResolvedBtn.disabled = true;
});


notResolvedBtn.addEventListener("click", function () {

    verificationMessage.textContent =
        "Your feedback will be submitted when the backend is connected.";

    resolvedBtn.disabled = true;
    notResolvedBtn.disabled = true;
});