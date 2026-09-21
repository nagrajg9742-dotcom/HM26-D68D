/* =========================================================
   CIVICTRACK - OFFICER JAVASCRIPT
   ========================================================= */

const API_BASE_URL = "http://localhost:5000/api";
const TOKEN_KEY = "civictrack_token";


/* =========================================================
   COMMON HELPERS
   ========================================================= */

function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}


function showMessage(element, message, type = "") {

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = type;
}


async function parseResponse(response) {

    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return {
            message: text
        };
    }
}


async function authenticatedFetch(
    url,
    options = {}
) {

    const token = getAuthToken();

    if (!token) {
        return null;
    }

    const headers = new Headers(
        options.headers || {}
    );

    headers.set(
        "Authorization",
        `Bearer ${token}`
    );

    return fetch(
        url,
        {
            ...options,
            headers
        }
    );
}


function handleUnauthorized(response) {

    if (
        response &&
        response.status === 401
    ) {

        localStorage.removeItem(
            TOKEN_KEY
        );

        window.location.href =
            "index.html";

        return true;
    }

    return false;
}


function formatStatus(status) {

    if (!status) {
        return "Unknown";
    }

    return String(status)
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );
}


function getComplaintId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id = params.get("id");

    if (
        !id ||
        !/^\d+$/.test(id)
    ) {
        return null;
    }

    const numericId =
        Number(id);

    if (
        !Number.isInteger(
            numericId
        ) ||
        numericId <= 0
    ) {
        return null;
    }

    return numericId;
}


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    if (!loginForm) {
        return;
    }

    const emailInput =
        document.getElementById(
            "email"
        );

    const passwordInput =
        document.getElementById(
            "password"
        );

    const loginMessage =
        document.getElementById(
            "loginMessage"
        );

    const loginButton =
        loginForm.querySelector(
            "button"
        );

    if (
        !emailInput ||
        !passwordInput ||
        !loginMessage ||
        !loginButton
    ) {

        console.error(
            "Officer login elements are missing."
        );

        return;
    }

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            if (
                !email ||
                !password
            ) {

                showMessage(
                    loginMessage,
                    "Please enter your email and password.",
                    "message-warning"
                );

                return;
            }

            loginButton.disabled =
                true;

            loginButton.textContent =
                "Logging in...";

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );

                const data =
                    await parseResponse(
                        response
                    );

                if (!response.ok) {

                    showMessage(
                        loginMessage,
                        data.message ||
                            "Login failed.",
                        "message-error"
                    );

                    return;
                }

                if (!data.token) {

                    showMessage(
                        loginMessage,
                        "Login succeeded but no authentication token was returned.",
                        "message-error"
                    );

                    return;
                }

                localStorage.setItem(
                    TOKEN_KEY,
                    data.token
                );

                window.location.href =
                    "dashboard.html";

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                showMessage(
                    loginMessage,
                    "Unable to connect to the CivicTrack backend.",
                    "message-error"
                );

            } finally {

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Login";
            }
        }
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    const logoutLinks =
        document.querySelectorAll(
            'a[href="index.html"]'
        );

    logoutLinks.forEach(
        link => {

            if (
                link.textContent
                    .trim()
                    .toLowerCase() !==
                "logout"
            ) {
                return;
            }

            link.addEventListener(
                "click",
                () => {

                    localStorage.removeItem(
                        TOKEN_KEY
                    );
                }
            );
        }
    );
}


/* =========================================================
   COMPLAINT NAVIGATION
   ========================================================= */

function openComplaintDetails(
    complaintId
) {

    const numericId =
        Number(complaintId);

    if (
        !Number.isInteger(
            numericId
        ) ||
        numericId <= 0
    ) {

        console.error(
            "Invalid complaint ID."
        );

        return;
    }

    window.location.href =
        `complaint-details.html?id=${encodeURIComponent(
            numericId
        )}`;
}

window.openComplaintDetails =
    openComplaintDetails;


/* =========================================================
   COMPLAINT LIST
   ========================================================= */

let allComplaints = [];


function getStatusFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("status");
}


function renderComplaintRows() {

    const tableBody =
        document.getElementById(
            "complaintsTableBody"
        );

    const countElement =
        document.getElementById(
            "complaintCount"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const searchInput =
        document.getElementById(
            "complaintSearch"
        );

    if (
        !tableBody ||
        !countElement
    ) {
        return;
    }

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";

    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const filtered =
        allComplaints.filter(
            complaint => {

                const status =
                    String(
                        complaint.status ||
                            ""
                    ).toLowerCase();

                const id =
                    String(
                        complaint.id ||
                            ""
                    ).toLowerCase();

                const title =
                    String(
                        complaint.title ||
                            ""
                    ).toLowerCase();

                const statusMatches =
                    selectedStatus ===
                        "all" ||
                    status ===
                        selectedStatus;

                const searchMatches =
                    !searchText ||
                    id.includes(
                        searchText
                    ) ||
                    title.includes(
                        searchText
                    );

                return (
                    statusMatches &&
                    searchMatches
                );
            }
        );

    tableBody.innerHTML = "";

    if (
        filtered.length === 0
    ) {

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `
            <td
                colspan="5"
                class="table-loading"
            >
                No complaints match the selected filters.
            </td>
        `;

        tableBody.appendChild(
            row
        );

    } else {

        filtered.forEach(
            complaint => {

                const row =
                    document.createElement(
                        "tr"
                    );

                const idCell =
                    document.createElement(
                        "td"
                    );

                idCell.textContent =
                    `#${complaint.id}`;


                const titleCell =
                    document.createElement(
                        "td"
                    );

                titleCell.textContent =
                    complaint.title ||
                    "Untitled complaint";


                const locationCell =
                    document.createElement(
                        "td"
                    );

                locationCell.textContent =
                    complaint.location ||
                    "Not provided";


                const statusCell =
                    document.createElement(
                        "td"
                    );

                const badge =
                    document.createElement(
                        "span"
                    );

                badge.className =
                    "status-badge";

                badge.textContent =
                    formatStatus(
                        complaint.status
                    );

                if (
                    complaint.status ===
                        "resolved" ||
                    complaint.status ===
                        "verified"
                ) {

                    badge.classList.add(
                        "success"
                    );
                }

                if (
                    complaint.status ===
                    "reopened"
                ) {

                    badge.classList.add(
                        "danger"
                    );
                }

                statusCell.appendChild(
                    badge
                );


                const actionCell =
                    document.createElement(
                        "td"
                    );

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.textContent =
                    "View Details";

                button.addEventListener(
                    "click",
                    () => {

                        openComplaintDetails(
                            complaint.id
                        );
                    }
                );

                actionCell.appendChild(
                    button
                );


                row.appendChild(
                    idCell
                );

                row.appendChild(
                    titleCell
                );

                row.appendChild(
                    locationCell
                );

                row.appendChild(
                    statusCell
                );

                row.appendChild(
                    actionCell
                );

                tableBody.appendChild(
                    row
                );
            }
        );
    }

    countElement.textContent =
        `${filtered.length} complaint${
            filtered.length === 1
                ? ""
                : "s"
        }`;
}


async function loadComplaints() {

    const tableBody =
        document.getElementById(
            "complaintsTableBody"
        );

    const countElement =
        document.getElementById(
            "complaintCount"
        );

    if (
        !tableBody ||
        !countElement
    ) {
        return;
    }

    const token =
        getAuthToken();

    if (!token) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-loading"
                >
                    Please log in to view complaints.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td
                colspan="5"
                class="table-loading"
            >
                Loading complaints...
            </td>
        </tr>
    `;

    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/complaints`
            );

        if (!response) {
            return;
        }

        if (
            handleUnauthorized(
                response
            )
        ) {
            return;
        }

        const data =
            await parseResponse(
                response
            );

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load complaints."
            );
        }

        allComplaints =
            Array.isArray(
                data.complaints
            )
                ? data.complaints
                : [];

        const urlStatus =
            getStatusFromURL();

        if (
            statusFilterExists() &&
            urlStatus
        ) {

            const select =
                document.getElementById(
                    "statusFilter"
                );

            const option =
                Array.from(
                    select.options
                ).find(
                    item =>
                        item.value ===
                        urlStatus
                );

            if (option) {
                select.value =
                    urlStatus;
            }
        }

        renderComplaintRows();

    } catch (error) {

        console.error(
            "Complaint list error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-loading"
                >
                    Unable to load complaints from the CivicTrack backend.
                </td>
            </tr>
        `;

        countElement.textContent =
            "0 complaints";
    }
}


function statusFilterExists() {

    return Boolean(
        document.getElementById(
            "statusFilter"
        )
    );
}


function setupComplaintQueue() {

    const tableBody =
        document.getElementById(
            "complaintsTableBody"
        );

    if (!tableBody) {
        return;
    }

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const searchInput =
        document.getElementById(
            "complaintSearch"
        );

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderComplaintRows
        );
    }

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderComplaintRows
        );
    }

    loadComplaints();
}


/* =========================================================
   DASHBOARD ANALYTICS
   ========================================================= */

function setDashboardValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );

    if (element) {
        element.textContent =
            value;
    }
}


/*
 * UPDATED DASHBOARD
 *
 * Uses the backend dashboard endpoint:
 *
 * GET /api/analytics/dashboard
 *
 * The backend now returns all 9 dashboard values:
 *
 * total_complaints
 * assigned_complaints
 * open_complaints
 * overdue_complaints
 * high_risk_complaints
 * active_rescue_cases
 * resolved_complaints
 * reopened_complaints
 * verified_complaints
 */

async function loadDashboard() {

    const totalElement =
        document.getElementById(
            "totalComplaints"
        );

    if (!totalElement) {
        return;
    }

    const token =
        getAuthToken();

    if (!token) {
        return;
    }

    try {

        /* ---------------------------------------------
           OFFICER DASHBOARD
           --------------------------------------------- */

        const dashboardResponse =
            await authenticatedFetch(
                `${API_BASE_URL}/analytics/dashboard`
            );

        if (!dashboardResponse) {
            return;
        }

        if (
            handleUnauthorized(
                dashboardResponse
            )
        ) {
            return;
        }

        const dashboardData =
            await parseResponse(
                dashboardResponse
            );

        if (
            !dashboardResponse.ok ||
            !dashboardData.dashboard
        ) {

            throw new Error(
                dashboardData.message ||
                "Unable to load Officer dashboard."
            );
        }

        const dashboard =
            dashboardData.dashboard;


        /* ---------------------------------------------
           DASHBOARD COUNTS
           --------------------------------------------- */

        setDashboardValue(
            "totalComplaints",
            dashboard.total_complaints ?? 0
        );

        setDashboardValue(
            "assignedComplaints",
            dashboard.assigned_complaints ?? 0
        );

        setDashboardValue(
            "openComplaints",
            dashboard.open_complaints ?? 0
        );

        setDashboardValue(
            "overdueComplaints",
            dashboard.overdue_complaints ?? 0
        );

        setDashboardValue(
            "highRiskComplaints",
            dashboard.high_risk_complaints ?? 0
        );

        setDashboardValue(
            "rescueComplaints",
            dashboard.active_rescue_cases ?? 0
        );

        setDashboardValue(
            "resolvedComplaints",
            dashboard.resolved_complaints ?? 0
        );

        setDashboardValue(
            "reopenedComplaints",
            dashboard.reopened_complaints ?? 0
        );

        setDashboardValue(
            "verifiedComplaints",
            dashboard.verified_complaints ?? 0
        );

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        setDashboardValue(
            "totalComplaints",
            "Unavailable"
        );

        setDashboardValue(
            "assignedComplaints",
            "Unavailable"
        );

        setDashboardValue(
            "openComplaints",
            "Unavailable"
        );

        setDashboardValue(
            "overdueComplaints",
            "Unavailable"
        );

        setDashboardValue(
            "highRiskComplaints",
            "Unavailable"
        );

        setDashboardValue(
            "rescueComplaints",
            "Unavailable"
        );

        setDashboardValue(
            "resolvedComplaints",
            "Unavailable"
        );

        setDashboardValue(
            "reopenedComplaints",
            "Unavailable"
        );

        setDashboardValue(
            "verifiedComplaints",
            "Unavailable"
        );
    }
}


/* =========================================================
   COMPLAINT DETAILS
   ========================================================= */

function setDetailValue(
    id,
    value,
    fallback = "Not available"
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    if (
        value !== undefined &&
        value !== null &&
        value !== ""
    ) {

        element.textContent =
            value;

    } else {

        element.textContent =
            fallback;
    }
}


function setStatusBadge(
    id,
    status
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        formatStatus(status);

    element.className =
        "status-badge";


    if (
        status === "resolved" ||
        status === "verified"
    ) {

        element.classList.add(
            "success"
        );
    }


    if (
        status === "reopened"
    ) {

        element.classList.add(
            "danger"
        );
    }
}


async function loadComplaintDetails() {

    const complaintId =
        getComplaintId();

    const complaintIdElement =
        document.getElementById(
            "complaintId"
        );

    if (!complaintIdElement) {
        return;
    }

    if (!complaintId) {

        setDetailValue(
            "complaintId",
            "Invalid complaint ID"
        );

        setDetailValue(
            "complaintDescription",
            "A valid complaint ID is required."
        );

        return;
    }


    const token =
        getAuthToken();

    if (!token) {

        window.location.href =
            "index.html";

        return;
    }


    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/complaints/${complaintId}`
            );

        if (!response) {
            return;
        }

        if (
            handleUnauthorized(
                response
            )
        ) {
            return;
        }

        const data =
            await parseResponse(
                response
            );

        if (
            !response.ok ||
            !data.complaint
        ) {

            throw new Error(
                data.message ||
                "Unable to load complaint details."
            );
        }

        const complaint =
            data.complaint;


        setDetailValue(
            "complaintId",
            complaint.id
        );

        setDetailValue(
            "complaintCategory",
            complaint.category
        );

        setDetailValue(
            "complaintDate",
            complaint.created_at ||
                complaint.reported_at
        );

        setDetailValue(
            "complaintLocation",
            complaint.location
        );

        setDetailValue(
            "complaintDescription",
            complaint.description
        );

        setDetailValue(
            "citizenName",
            complaint.citizen_name
        );

        setDetailValue(
            "citizenContact",
            complaint.citizen_email
        );

        setStatusBadge(
            "complaintStatus",
            complaint.status
        );


        setDetailValue(
            "assignedDepartment",
            "Not available"
        );

        setDetailValue(
            "assignedOfficer",
            "Not available"
        );


        const verificationStatus =
            document.getElementById(
                "verificationStatus"
            );

        if (verificationStatus) {

            if (
                complaint.status ===
                "resolved"
            ) {

                verificationStatus.textContent =
                    "Resolution ready for verification";

            } else {

                verificationStatus.textContent =
                    formatStatus(
                        complaint.status
                    );
            }
        }


        /* ---------------------------------------------
           LOAD RISK INTELLIGENCE
           --------------------------------------------- */

        await loadRiskPrediction(
            complaintId
        );

        await loadRiskExplanation(
            complaintId
        );

    } catch (error) {

        console.error(
            "Complaint details error:",
            error
        );

        setDetailValue(
            "complaintId",
            complaintId
        );

        setDetailValue(
            "complaintCategory",
            "Unavailable"
        );

        setDetailValue(
            "complaintLocation",
            "Unavailable"
        );

        setDetailValue(
            "complaintDescription",
            "Unable to load complaint details."
        );

        setDetailValue(
            "citizenName",
            "Unavailable"
        );

        setDetailValue(
            "citizenContact",
            "Unavailable"
        );

        setStatusBadge(
            "complaintStatus",
            "unknown"
        );
    }
}


/* =========================================================
   RISK PREDICTION API
   GET /api/intelligence/:id/risk
   ========================================================= */

async function loadRiskPrediction(
    complaintId
) {

    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/intelligence/${complaintId}/risk`
            );

        if (!response) {
            return;
        }

        if (
            handleUnauthorized(
                response
            )
        ) {
            return;
        }

        const data =
            await parseResponse(
                response
            );

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load risk prediction."
            );
        }


        setDetailValue(
            "riskScore",
            data.risk_score
        );

        setDetailValue(
            "riskAge",
            data.age_hours !== undefined
                ? `${data.age_hours} hours`
                : null
        );

        setDetailValue(
            "riskInactiveHours",
            data.inactive_hours !== undefined
                ? `${data.inactive_hours} hours`
                : null
        );

        setDetailValue(
            "riskCategory",
            data.category
        );

        setDetailValue(
            "riskHistoryCount",
            data.history_count
        );

        setDetailValue(
            "riskNearbyComplaints",
            data.nearby_category_complaints
        );

        setDetailValue(
            "riskPredictionMessage",
            data.prediction
        );


        const riskLevel =
            document.getElementById(
                "riskLevel"
            );

        if (riskLevel) {

            riskLevel.textContent =
                formatStatus(
                    data.risk_level
                );

            riskLevel.className =
                "status-badge";


            if (
                data.risk_level ===
                "high"
            ) {

                riskLevel.classList.add(
                    "danger"
                );

            } else if (
                data.risk_level ===
                "medium"
            ) {

                riskLevel.classList.add(
                    "warning"
                );

            } else if (
                data.risk_level ===
                "low"
            ) {

                riskLevel.classList.add(
                    "success"
                );
            }
        }

    } catch (error) {

        console.error(
            "Risk prediction error:",
            error
        );

        setDetailValue(
            "riskScore",
            "Unavailable"
        );

        setDetailValue(
            "riskAge",
            "Unavailable"
        );

        setDetailValue(
            "riskInactiveHours",
            "Unavailable"
        );

        setDetailValue(
            "riskCategory",
            "Unavailable"
        );

        setDetailValue(
            "riskHistoryCount",
            "Unavailable"
        );

        setDetailValue(
            "riskNearbyComplaints",
            "Unavailable"
        );

        setDetailValue(
            "riskPredictionMessage",
            "Unable to load risk prediction."
        );

        setDetailValue(
            "riskLevel",
            "Unavailable"
        );
    }
}


/* =========================================================
   RISK EXPLANATION API
   GET /api/intelligence/:id/risk/explanation
   ========================================================= */

async function loadRiskExplanation(
    complaintId
) {

    const container =
        document.getElementById(
            "riskFactors"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await authenticatedFetch(
                `${API_BASE_URL}/intelligence/${complaintId}/risk/explanation`
            );

        if (!response) {
            return;
        }

        if (
            handleUnauthorized(
                response
            )
        ) {
            return;
        }

        const data =
            await parseResponse(
                response
            );

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load risk explanation."
            );
        }


        container.innerHTML = "";


        if (
            !Array.isArray(
                data.factors
            ) ||
            data.factors.length === 0
        ) {

            const message =
                document.createElement(
                    "p"
                );

            message.className =
                "loading-text";

            message.textContent =
                "No specific risk factors were identified.";

            container.appendChild(
                message
            );

            return;
        }


        const list =
            document.createElement(
                "ul"
            );

        data.factors.forEach(
            factor => {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    factor;

                list.appendChild(
                    item
                );
            }
        );

        container.appendChild(
            list
        );

    } catch (error) {

        console.error(
            "Risk explanation error:",
            error
        );

        container.innerHTML = "";

        const message =
            document.createElement(
                "p"
            );

        message.className =
            "loading-text";

        message.textContent =
            "Unable to load risk explanation.";

        container.appendChild(
            message
        );
    }
}


/* =========================================================
   RESCUE API
   ========================================================= */

function setupRescueButton() {

    const button =
        document.getElementById(
            "rescueButton"
        );

    if (!button) {
        return;
    }

    const message =
        document.getElementById(
            "rescueMessage"
        );


    button.addEventListener(
        "click",
        async () => {

            const complaintId =
                getComplaintId();

            if (!complaintId) {

                showMessage(
                    message,
                    "A valid complaint ID is required.",
                    "message-error"
                );

                return;
            }

            button.disabled =
                true;

            button.textContent =
                "Triggering Rescue...";


            try {

                const response =
                    await authenticatedFetch(
                        `${API_BASE_URL}/complaints/${complaintId}/rescue`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    reason:
                                        "Emergency assistance required",
                                    priority:
                                        "high"
                                })
                        }
                    );


                if (!response) {
                    return;
                }


                if (
                    handleUnauthorized(
                        response
                    )
                ) {
                    return;
                }


                const data =
                    await parseResponse(
                        response
                    );


                if (
                    response.ok &&
                    data.success
                ) {

                    showMessage(
                        message,
                        data.message ||
                            "Rescue request created successfully.",
                        "message-success"
                    );

                    return;
                }


                showMessage(
                    message,
                    data.message ||
                        "Unable to create rescue request.",
                    "message-error"
                );

            } catch (error) {

                console.error(
                    "Rescue error:",
                    error
                );

                showMessage(
                    message,
                    "Unable to connect to the CivicTrack backend.",
                    "message-error"
                );

            } finally {

                button.disabled =
                    false;

                button.textContent =
                    "Trigger Rescue";
            }
        }
    );
}


/* =========================================================
   PROOF UPLOAD
   POST /api/evidence/:id/proof
   ========================================================= */

function setupProofUpload() {

    const button =
        document.getElementById(
            "uploadProofButton"
        );

    if (!button) {
        return;
    }

    const fileInput =
        document.getElementById(
            "proofFile"
        );

    const message =
        document.getElementById(
            "proofMessage"
        );


    button.addEventListener(
        "click",
        async () => {

            const complaintId =
                getComplaintId();

            if (!complaintId) {

                showMessage(
                    message,
                    "A valid complaint ID is required.",
                    "message-error"
                );

                return;
            }


            if (
                !fileInput ||
                !fileInput.files[0]
            ) {

                showMessage(
                    message,
                    "Please choose a proof image first.",
                    "message-warning"
                );

                return;
            }


            const formData =
                new FormData();

            formData.append(
                "proof",
                fileInput.files[0]
            );


            button.disabled =
                true;

            button.textContent =
                "Uploading Proof...";


            try {

                const response =
                    await authenticatedFetch(
                        `${API_BASE_URL}/evidence/${complaintId}/proof`,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                if (!response) {
                    return;
                }


                if (
                    handleUnauthorized(
                        response
                    )
                ) {
                    return;
                }


                const data =
                    await parseResponse(
                        response
                    );


                if (
                    response.ok &&
                    data.success
                ) {

                    showMessage(
                        message,
                        data.message ||
                            "Proof uploaded successfully.",
                        "message-success"
                    );

                    fileInput.value =
                        "";

                    return;
                }


                showMessage(
                    message,
                    data.message ||
                        "Unable to upload proof.",
                    "message-error"
                );

            } catch (error) {

                console.error(
                    "Proof upload error:",
                    error
                );

                showMessage(
                    message,
                    "Unable to connect to the CivicTrack backend.",
                    "message-error"
                );

            } finally {

                button.disabled =
                    false;

                button.textContent =
                    "Upload Proof of Progress";
            }
        }
    );
}


/* =========================================================
   RESOLVE COMPLAINT
   ========================================================= */

function setupResolveButton() {

    const button =
        document.getElementById(
            "markResolvedButton"
        );

    if (!button) {
        return;
    }

    const noteInput =
        document.getElementById(
            "resolutionNote"
        );

    const message =
        document.getElementById(
            "resolutionMessage"
        );


    button.addEventListener(
        "click",
        async () => {

            const complaintId =
                getComplaintId();

            if (!complaintId) {

                showMessage(
                    message,
                    "A valid complaint ID is required.",
                    "message-error"
                );

                return;
            }


            const note =
                noteInput
                    ? noteInput.value.trim()
                    : "";


            button.disabled =
                true;

            button.textContent =
                "Marking as Resolved...";


            try {

                const response =
                    await authenticatedFetch(
                        `${API_BASE_URL}/complaints/${complaintId}/status`,
                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    status:
                                        "resolved",

                                    note:
                                        note ||
                                        "Complaint resolved."
                                })
                        }
                    );


                if (!response) {
                    return;
                }


                if (
                    handleUnauthorized(
                        response
                    )
                ) {
                    return;
                }


                const data =
                    await parseResponse(
                        response
                    );


                if (response.ok) {

                    showMessage(
                        message,
                        data.message ||
                            "Complaint marked as resolved.",
                        "message-success"
                    );

                    setStatusBadge(
                        "complaintStatus",
                        "resolved"
                    );

                    return;
                }


                showMessage(
                    message,
                    data.message ||
                        "Unable to update complaint.",
                    "message-error"
                );

            } catch (error) {

                console.error(
                    "Resolve error:",
                    error
                );

                showMessage(
                    message,
                    "Unable to connect to the CivicTrack backend.",
                    "message-error"
                );

            } finally {

                button.disabled =
                    false;

                button.textContent =
                    "Mark Complaint as Resolved";
            }
        }
    );
}


/* =========================================================
   VERIFICATION
   ========================================================= */

function setupVerification() {

    const verifyButton =
        document.getElementById(
            "verifyResolutionButton"
        );

    const reopenButton =
        document.getElementById(
            "reopenComplaintButton"
        );

    if (
        !verifyButton &&
        !reopenButton
    ) {
        return;
    }

    const message =
        document.getElementById(
            "verificationMessage"
        );


    async function sendVerification(
        status
    ) {

        const complaintId =
            getComplaintId();

        if (!complaintId) {

            showMessage(
                message,
                "A valid complaint ID is required.",
                "message-error"
            );

            return;
        }


        if (verifyButton) {
            verifyButton.disabled =
                true;
        }

        if (reopenButton) {
            reopenButton.disabled =
                true;
        }


        try {

            const response =
                await authenticatedFetch(
                    `${API_BASE_URL}/complaints/${complaintId}/verification`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                status
                            })
                    }
                );


            if (!response) {
                return;
            }


            if (
                handleUnauthorized(
                    response
                )
            ) {
                return;
            }


            const data =
                await parseResponse(
                    response
                );


            if (response.ok) {

                showMessage(
                    message,
                    data.message ||
                        (
                            status ===
                            "verified"
                                ? "Resolution verified successfully."
                                : "Complaint reopened successfully."
                        ),
                    status ===
                        "verified"
                        ? "message-success"
                        : "message-error"
                );


                setStatusBadge(
                    "complaintStatus",
                    status
                );


                const verificationStatus =
                    document.getElementById(
                        "verificationStatus"
                    );

                if (
                    verificationStatus
                ) {

                    verificationStatus.textContent =
                        formatStatus(
                            status
                        );

                    verificationStatus.className =
                        "status-badge";
                }

                return;
            }


            showMessage(
                message,
                data.message ||
                    "Unable to process verification.",
                "message-error"
            );

        } catch (error) {

            console.error(
                "Verification error:",
                error
            );

            showMessage(
                message,
                "Unable to connect to the CivicTrack backend.",
                "message-error"
            );

        } finally {

            if (verifyButton) {

                verifyButton.disabled =
                    false;

                verifyButton.textContent =
                    "Verify Resolution";
            }

            if (reopenButton) {

                reopenButton.disabled =
                    false;

                reopenButton.textContent =
                    "Reopen Complaint";
            }
        }
    }


    if (verifyButton) {

        verifyButton.addEventListener(
            "click",
            () => {

                sendVerification(
                    "verified"
                );
            }
        );
    }


    if (reopenButton) {

        reopenButton.addEventListener(
            "click",
            () => {

                sendVerification(
                    "reopened"
                );
            }
        );
    }
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupLogin();

        setupLogout();

        setupComplaintQueue();

        loadDashboard();

        loadComplaintDetails();

        setupRescueButton();

        setupProofUpload();

        setupResolveButton();

        setupVerification();
    }
);