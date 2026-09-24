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
 
 
/* ========================================================= 
   COMPLAINT ID 
   ========================================================= */ 
 
function getComplaintId() { 
 
    // First try normal query parameter: 
    // complaint-details.html?id=12 
 
    const params = 
        new URLSearchParams( 
            window.location.search 
        ); 
 
    const queryId = 
        params.get("id"); 
 
    if ( 
        queryId && 
        /^\d+$/.test(queryId) 
    ) { 
 
        const numericId = 
            Number(queryId); 
 
        if ( 
            Number.isInteger( 
                numericId 
            ) && 
            numericId > 0 
        ) { 
 
            return numericId; 
        } 
    } 
 
 
    // Fallback: 
    // complaint-details.html#id=12 
 
    const hash = 
        window.location.hash; 
 
    if ( 
        hash.includes("id=") 
    ) { 
 
        const hashId = 
            hash 
                .split("id=")[1] 
                .split("&")[0]; 
 
        if ( 
            /^\d+$/.test(hashId) 
        ) { 
 
            const numericId = 
                Number(hashId); 
 
            if ( 
                Number.isInteger( 
                    numericId 
                ) && 
                numericId > 0 
            ) { 
 
                return numericId; 
            } 
        } 
    } 
 
    return null; 
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
 
    /* 
     * IMPORTANT: 
     * Use hash instead of query parameter. 
     * Some local static servers redirect 
     * complaint-details.html and remove ?id=12. 
     */ 
 
    window.location.href = 
        `complaint-details.html#id=${encodeURIComponent( 
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
 
    countElement.textContent = 
        filtered.length; 
 
 
    if (!filtered.length) { 
 
        tableBody.innerHTML = 
            ` 
            <tr> 
                <td colspan="100%"> 
                    No complaints found. 
                </td> 
            </tr> 
            `; 
 
        return; 
    } 
 
 
    filtered.forEach( 
        complaint => { 
 
            const row = 
                document.createElement( 
                    "tr" 
                ); 
 
            const status = 
                String( 
                    complaint.status || 
                        "" 
                ).toLowerCase(); 
 
            const priority = 
                String( 
                    complaint.priority || 
                        "" 
                ).toLowerCase(); 
 
            row.innerHTML = 
                ` 
                <td> 
                    #${complaint.id} 
                </td> 
 
                <td> 
                    ${escapeHtml( 
                        complaint.title || 
                        complaint.subject || 
                        "Untitled complaint" 
                    )} 
                </td> 
 
                <td> 
                    ${escapeHtml( 
                        complaint.category || 
                        "General" 
                    )} 
                </td> 
 
                <td> 
                    <span class="status-badge ${status}"> 
                        ${formatStatus(status)} 
                    </span> 
                </td> 
 
                <td> 
                    ${escapeHtml( 
                        complaint.priority || 
                        "Normal" 
                    )} 
                </td> 
 
                <td> 
                    ${formatDate( 
                        complaint.created_at || 
                        complaint.createdAt 
                    )} 
                </td> 
 
                <td> 
                    <button 
                        type="button" 
                        class="view-details-button" 
                        onclick="openComplaintDetails(${Number( 
                            complaint.id 
                        )})" 
                    > 
                        View Details 
                    </button> 
                </td> 
                `; 
 
            tableBody.appendChild( 
                row 
            ); 
        } 
    ); 
} 
 
 
function escapeHtml(value) { 
 
    return String(value) 
        .replace(/&/g, "&amp;") 
        .replace(/</g, "&lt;") 
        .replace(/>/g, "&gt;") 
        .replace(/"/g, "&quot;") 
        .replace(/'/g, "&#039;"); 
} 
 
 
function formatDate(value) { 
 
    if (!value) { 
        return "—"; 
    } 
 
    const date = 
        new Date(value); 
 
    if ( 
        Number.isNaN( 
            date.getTime() 
        ) 
    ) { 
 
        return String(value); 
    } 
 
    return date.toLocaleString(); 
} 
 
 
/* ========================================================= 
   LOAD COMPLAINTS 
   ========================================================= */ 
 
async function loadComplaints() { 
 
    const tableBody = 
        document.getElementById( 
            "complaintsTableBody" 
        ); 
 
    if (!tableBody) { 
        return; 
    } 
 
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
 
    try { 
 
        const data = 
            await parseResponse( 
                response 
            ); 
 
        if (!response.ok) { 
 
            console.error( 
                "Unable to load complaints:", 
                data 
            ); 
 
            tableBody.innerHTML = 
                ` 
                <tr> 
                    <td colspan="100%"> 
                        Unable to load complaints. 
                    </td> 
                </tr> 
                `; 
 
            return; 
        } 
 
 
        if ( 
            Array.isArray(data) 
        ) { 
 
            allComplaints = 
                data; 
 
        } else if ( 
            Array.isArray( 
                data.complaints 
            ) 
        ) { 
 
            allComplaints = 
                data.complaints; 
 
        } else if ( 
            Array.isArray( 
                data.data 
            ) 
        ) { 
 
            allComplaints = 
                data.data; 
 
        } else { 
 
            allComplaints = 
                []; 
        } 
 
 
        renderComplaintRows(); 
 
    } catch (error) { 
 
        console.error( 
            "Complaint loading error:", 
            error 
        ); 
 
        tableBody.innerHTML = 
            ` 
            <tr> 
                <td colspan="100%"> 
                    Unable to connect to the CivicTrack backend. 
                </td> 
            </tr> 
            `; 
    } 
} 
 
 
/* ========================================================= 
   COMPLAINT FILTERS 
   ========================================================= */ 
 
function setupComplaintFilters() { 
 
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
 
        const urlStatus = 
            getStatusFromURL(); 
 
        if (urlStatus) { 
 
            statusFilter.value = 
                urlStatus; 
        } 
    } 
 
 
    if (searchInput) { 
 
        searchInput.addEventListener( 
            "input", 
            renderComplaintRows 
        ); 
    } 
} 
 
 
/* ========================================================= 
   COMPLAINT QUEUE 
   ========================================================= */ 
 
function setupComplaintQueue() { 
 
    const tableBody = 
        document.getElementById( 
            "complaintsTableBody" 
        ); 
 
    if (!tableBody) { 
        return; 
    } 
 
    setupComplaintFilters(); 
 
    loadComplaints(); 
} 
 
 
/* ========================================================= 
   DASHBOARD 
   ========================================================= */ 
 
async function loadDashboard() {
    try {
        const response = await authenticatedFetch(
            `${API_BASE_URL}/analytics/dashboard`
        );

        if (!response) {
            console.error("Dashboard: no response");
            return;
        }

        if (handleUnauthorized(response)) {
            return;
        }

        const data = await response.json();

        console.log("Dashboard data:", data);

        const stats = data.dashboard || {};

        updateDashboardValue(
            ["totalComplaints"],
            stats.total_complaints ?? 0
        );

        updateDashboardValue(
            ["assignedComplaints"],
            stats.assigned_complaints ?? 0
        );

        updateDashboardValue(
            ["openComplaints"],
            stats.open_complaints ?? 0
        );

        updateDashboardValue(
            ["overdueComplaints"],
            stats.overdue_complaints ?? 0
        );

        updateDashboardValue(
            ["highRiskComplaints"],
            stats.high_risk_complaints ?? 0
        );

        updateDashboardValue(
            ["rescueComplaints"],
            stats.active_rescue_cases ?? 0
        );

        updateDashboardValue(
            ["resolvedComplaints"],
            stats.resolved_complaints ?? 0
        );

        updateDashboardValue(
            ["reopenedComplaints"],
            stats.reopened_complaints ?? 0
        );

        updateDashboardValue(
            ["verifiedComplaints"],
            stats.verified_complaints ?? 0
        );

    } catch (error) {
        console.error("Dashboard loading error:", error);
    }
}
function updateDashboardValue( 
    ids, 
    value 
) { 
 
    if (!Array.isArray(ids)) { 
        return; 
    } 
 
    ids.forEach( 
        id => { 
 
            const element = 
                document.getElementById( 
                    id 
                ); 
 
            if (element) { 
 
                element.textContent = 
                    value ?? 
                    0; 
            } 
        } 
    ); 
} 
 
 
/* ========================================================= 
   COMPLAINT DETAILS 
   ========================================================= */ 
 
async function loadComplaintDetails() { 
 
 
    const complaintId = 
        getComplaintId(); 
 
 
    if (!complaintId) { 
 
        console.error( 
            "No valid complaint ID found in URL." 
        ); 
 
        showDetailsError( 
            "No valid complaint ID was provided." 
        ); 
 
        return; 
    } 
 
 
    const loadingElements = 
        document.querySelectorAll( 
            ".loading" 
        ); 
 
 
    loadingElements.forEach( 
        element => { 
 
            element.textContent = 
                "Loading..."; 
        } 
    ); 
 
 
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
 
 
        if (!response.ok) { 
 
            console.error( 
                "Complaint details error:", 
                data 
            ); 
 
            showDetailsError( 
                data.message || 
                "Unable to load complaint details." 
            ); 
 
            return; 
        } 
 
 
        const complaint = 
            data.complaint || 
            data.data || 
            data; 

            populateComplaintDetails(complaint);
 
 
        /* 
         * Load risk intelligence after 
         * the main complaint data. 
         */ 
 
        await loadRiskPrediction( 
            complaintId 
        ); 
 
        await loadRiskExplanation( 
            complaintId 
        ); 
 
 
    } catch (error) { 
 
        console.error( 
            "Complaint details loading error:", 
            error 
        ); 
 
        showDetailsError( 
            "Unable to connect to the CivicTrack backend." 
        ); 
    } 
} 
 
 
/* ========================================================= 
   POPULATE COMPLAINT DETAILS 
   ========================================================= */ 
 
function populateComplaintDetails( 
    complaint 
) { 
 
    if (!complaint) { 
        return; 
    } 
 
 
    setElementText( 
        [ 
            "complaintId", 
            "detailComplaintId"
            
        ], 
        complaint.id 
            ? `#${complaint.id}` 
            : "—" 
    ); 
 
 
    setElementText( 
        [ 
            "complaintTitle", 
            "detailComplaintTitle" 
        ], 
        complaint.title || 
        complaint.subject || 
        "Untitled complaint" 
    ); 
 
 
    setElementText( 
        [ 
            "complaintDescription", 
            "detailComplaintDescription" 
        ], 
        complaint.description || 
        complaint.details || 
        "No description available." 
    ); 
 
 
    setElementText( 
        [ 
            "complaintCategory", 
            "detailComplaintCategory" 
        ], 
        complaint.category || 
        "—" 
    ); 
 
 
    setElementText( 
        [ 
            "complaintPriority", 
            "detailComplaintPriority" 
        ], 
        complaint.priority || 
        "Normal" 
    ); 
 
 
    setElementText( 
        [ 
            "complaintStatus", 
            "detailComplaintStatus" 
        ], 
        formatStatus( 
            complaint.status 
        ) 
    ); 
 
 
    setStatusBadge( 
        "complaintStatus", 
        complaint.status 
    ); 
 
 
    setElementText( 
        [ 
            "complaintLocation", 
            "detailComplaintLocation" 
        ], 
        complaint.location || 
        complaint.address || 
        "—" 
    ); 
 
 
    setElementText( 
        [ 
            "complaintCreatedAt", 
            "detailComplaintCreatedAt" 
        ], 
        formatDate( 
            complaint.created_at || 
            complaint.createdAt 
        ) 
    ); 
 
 
    setElementText( 
        [ 
            "complaintUpdatedAt", 
            "detailComplaintUpdatedAt" 
        ], 
        formatDate( 
            complaint.updated_at || 
            complaint.updatedAt 
        ) 
    ); 
 
 
    setElementText( 
        [ 
            "citizenName", 
            "complaintCitizenName" 
        ], 
        complaint.citizen_name || 
        complaint.citizenName || 
        complaint.user_name || 
        "—" 
    ); 
 
 
    setElementText( 
        [ 
            "citizenEmail", 
            "complaintCitizenEmail" ,
             "citizenContact"
        ], 
        complaint.citizen_email || 
        complaint.citizenEmail || 
        complaint.user_email || 
        "—" 
    ); 
 
 
    setElementText( 
        [ 
            "citizenPhone", 
            "complaintCitizenPhone" 
        ], 
        complaint.citizen_phone || 
        complaint.citizenPhone || 
        complaint.user_phone || 
        "—" 
    ); 
 
 
    setElementText( 
        [ 
            "assignedOfficer", 
            "complaintAssignedOfficer" 
        ], 
        complaint.assigned_officer_name || 
        complaint.assignedOfficerName || 
        complaint.officer_name || 
        "Unassigned" 
    ); 
 
 
    setElementText( 
        [ 
            "department", 
            "complaintDepartment" 
        ], 
        complaint.department_name || 
        complaint.departmentName || 
        complaint.department || 
        "—" 
    ); 
 
 
    /* 
     * Optional image/evidence field. 
     */ 

    const evidenceContainer =
    document.getElementById("citizenEvidence");

if (evidenceContainer) {
    renderEvidence(
        evidenceContainer,
        complaint.evidence || []
    );
}

const timelineContainer =
    document.getElementById("complaintTimeline");

if (timelineContainer) {
    renderStatusHistory(
        complaint.status_history ||
        complaint.statusHistory ||
        []
    );
}
}
/* ========================================================= 
   ELEMENT HELPERS 
   ========================================================= */ 
 
function setElementText( 
    ids, 
    value 
) { 
 
    if (!Array.isArray(ids)) { 
        ids = [ids]; 
    } 
 
 
    ids.forEach( 
        id => { 
 
            const element = 
                document.getElementById( 
                    id 
                ); 
 
            if (element) { 
 
                element.textContent = 
                    value ?? 
                    "—"; 
            } 
        } 
    ); 
} 
 
 
function setStatusBadge( 
    id, 
    status 
) { 
 
    const element = 
        document.getElementById( 
            id 
        ); 
 
    if (!element) { 
        return; 
    } 
 
 
    element.textContent = 
        formatStatus( 
            status 
        ); 
 
 
    element.className = 
        "status-badge"; 
 
 
    if (status) { 
 
        element.classList.add( 
            String(status) 
                .toLowerCase() 
                .replace(/\s+/g, "-") 
        ); 
    } 
} 
 
 
function showDetailsError( 
    message 
) { 
 
    const containers = 
        document.querySelectorAll( 
            ".complaint-details, #complaintDetails" 
        ); 
 
 
    containers.forEach( 
        container => { 
 
            const errorElement = 
                document.createElement( 
                    "div" 
                ); 
 
            errorElement.className = 
                "message-error"; 
 
            errorElement.textContent = 
                message; 
 
            /* 
             * Do not completely erase 
             * the page. Add the message. 
             */ 
 
            container.prepend( 
                errorElement 
            ); 
        } 
    ); 
} 
 
 
/* ========================================================= 
   EVIDENCE 
   ========================================================= */ 
 
function renderEvidence( 
    container, 
    evidence 
) { 
 
    container.innerHTML = ""; 
 
 
    if ( 
        !Array.isArray(evidence) 
    ) { 
 
        evidence = 
            [evidence]; 
    } 
 
 
    if (!evidence.length) { 
 
        container.textContent = 
            "No evidence uploaded."; 
 
        return; 
    } 
 
 
    evidence.forEach( 
        item => { 
 
            const wrapper = 
                document.createElement( 
                    "div" 
                ); 
 
            wrapper.className = 
                "evidence-item"; 
 
 
            const url = 
                typeof item === 
                    "string" 
                    ? item 
                    : item.url || 
                      item.file_url || 
                      item.fileUrl; 
 
 
            const name = 
                typeof item === 
                    "string" 
                    ? "Evidence" 
                    : item.filename || 
                      item.file_name || 
                      item.name || 
                      "Evidence"; 
 
 
            if (url) { 
 
                wrapper.innerHTML = 
                    ` 
                    <a 
                        href="${escapeHtml(url)}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                    > 
                        ${escapeHtml(name)} 
                    </a> 
                    `; 
 
            } else { 
 
                wrapper.textContent = 
                    name; 
            } 
 
 
            container.appendChild( 
                wrapper 
            ); 
        } 
    ); 
} 
 
 
/* ========================================================= 
   STATUS HISTORY 
   ========================================================= */ 
 
function renderStatusHistory( 
    history 
) { 
 
    const container = 
        document.getElementById( 
             "complaintTimeline"
        ); 
 
 
    if (!container) { 
        return; 
    } 
 
 
    container.innerHTML = ""; 
 
 
    if ( 
        !Array.isArray(history) || 
        !history.length 
    ) { 
 
        container.textContent = 
            "No status history available."; 
 
        return; 
    } 
 
 
    history.forEach( 
        item => { 
 
            const entry = 
                document.createElement( 
                    "div" 
                ); 
 
            entry.className = 
                "timeline-item"; 
 
 
            const status = 
                item.status || 
                item.new_status || 
                item.newStatus || 
                "Unknown"; 
 
 
            const note = 
                item.note || 
                item.comment || 
                item.description || 
                ""; 
 
 
            const created = 
               
              item.changed_at ||
              item.created_at ||
              item.changedAt ||
              item.createdAt;
 
            entry.innerHTML = 
                ` 
                <div class="timeline-status"> 
                    ${escapeHtml( 
                        formatStatus(status) 
                    )} 
                </div> 
 
                <div class="timeline-date"> 
                    ${escapeHtml( 
                        formatDate(created) 
                    )} 
                </div> 
 
                ${ 
                    note 
                        ? ` 
                        <div class="timeline-note"> 
                            ${escapeHtml(note)} 
                        </div> 
                        ` 
                        : "" 
                } 
                `; 
 
 
            container.appendChild( 
                entry 
            ); 
        } 
    ); 
} 
 
 
/* ========================================================= 
   RISK PREDICTION 
   ========================================================= */ 
 
async function loadRiskPrediction(complaintId) {
    const response = await authenticatedFetch(
        `${API_BASE_URL}/intelligence/${complaintId}/risk`
    );

    if (!response) return;
    if (response.status === 404) return;
    if (handleUnauthorized(response)) return;

    try {
        const data = await response.json();

        if (!response.ok) {
            console.warn("Risk prediction unavailable:", data);
            return;
        }

        setElementText(["riskScore"], data.risk_score ?? "—");

        setElementText(
            ["riskLevel"],
            formatStatus(data.risk_level ?? "Unknown")
        );

        setElementText(
            ["riskAge"],
            data.age_hours ?? "—"
        );

        setElementText(
            ["riskInactiveHours"],
            data.inactive_hours ?? "—"
        );

        setElementText(
            ["riskCategory"],
            data.category ?? "—"
        );

        setElementText(
            ["riskHistoryCount"],
            data.history_count ?? "—"
        );

        setElementText(
            ["riskNearbyComplaints"],
            data.nearby_similar ?? "—"
        );

    } catch (error) {
        console.warn("Risk prediction parsing error:", error);
    }
}
 
 
/* ========================================================= 
   RISK EXPLANATION 
   ========================================================= */ 
 
async function loadRiskExplanation( 
    complaintId 
) { 
 
    const response = 
        await authenticatedFetch( 
          `${API_BASE_URL}/intelligence/${complaintId}/risk/explanation` 
        ); 
 
 
    if (!response) { 
        return; 
    } 
 
 
    if ( 
        response.status === 404 
    ) { 
        return; 
    } 
 
 
    if ( 
        handleUnauthorized( 
            response 
        ) 
    ) { 
        return; 
    } 
 
 
    try { 
 
        const data = 
            await parseResponse( 
                response 
            ); 
 
 
        if (!response.ok) { 
 
            console.warn( 
                "Risk explanation unavailable:", 
                data 
            ); 
 
            return; 
        } 
 
 
        const result = 
            data.explanation || 
            data.data || 
            data; 
 
 
        const explanation = 
            typeof result === 
                "string" 
                ? result 
                : result.text || 
                  result.message || 
                  result.explanation || 
                  result.reason || 
                  ""; 
 
 
        if (explanation) { 
 
            setElementText( 
                [ 
                    "riskPredictionMessage",
                    "riskExplanation", 
                    "complaintRiskExplanation" 
                ], 
                explanation 
            ); 
        } 
 
 
        const factors = 
            result.factors || 
            result.riskFactors || 
            result.risk_factors; 
 
 
        if ( 
            Array.isArray(factors) 
        ) { 
 
            renderRiskFactors( 
                factors 
            ); 
        } 
 
 
    } catch (error) { 
 
        console.warn( 
            "Risk explanation parsing error:", 
            error 
        ); 
    } 
} 
 
 
/* ========================================================= 
   RISK FACTORS 
   ========================================================= */ 
 
function renderRiskFactors( 
    factors 
) { 
 
    const container = 
        document.getElementById( 
            "riskFactors" 
        ); 
 
 
    if (!container) { 
        return; 
    } 
 
 
    container.innerHTML = ""; 
 
 
    factors.forEach( 
        factor => { 
 
            const item = 
                document.createElement( 
                    "li" 
                ); 
 
 
            if ( 
                typeof factor === 
                "string" 
            ) { 
 
                item.textContent = 
                    factor; 
 
            } else { 
 
                item.textContent = 
                    factor.name || 
                    factor.description || 
                    factor.factor || 
                    JSON.stringify( 
                        factor 
                    ); 
            } 
 
 
            container.appendChild( 
                item 
            ); 
        } 
    ); 
} 
 
 
/* ========================================================= 
   ASSIGN COMPLAINT 
   ========================================================= */ 
 
function setupAssignment() { 
 
    const button = 
        document.getElementById( 
            "assignComplaintButton" 
        ); 
 
 
    if (!button) { 
        return; 
    } 
 
 
    const officerInput = 
        document.getElementById( 
            "officerId" 
        ); 
 
 
    const message = 
        document.getElementById( 
            "assignmentMessage" 
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
 
 
            const officerId = 
                officerInput 
                    ? officerInput.value.trim() 
                    : ""; 
 
 
            if (!officerId) { 
 
                showMessage( 
                    message, 
                    "Please enter an officer ID.", 
                    "message-warning" 
                ); 
 
                return; 
            } 
 
 
            button.disabled = 
                true; 
 
            button.textContent = 
                "Assigning..."; 
 
 
            try { 
 
                const response = 
                    await authenticatedFetch( 
                        `${API_BASE_URL}/complaints/${complaintId}/assign`, 
                        { 
                            method: "PATCH", 
 
                            headers: { 
                                "Content-Type": 
                                    "application/json" 
                            }, 
 
                            body: 
                                JSON.stringify({ 
                                    officerId: 
                                        Number( 
                                            officerId 
                                        ) 
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
                            "Complaint assigned successfully.", 
                        "message-success" 
                    ); 
 
                } else { 
 
                    showMessage( 
                        message, 
                        data.message || 
                            "Unable to assign complaint.", 
                        "message-error" 
                    ); 
                } 
 
 
            } catch (error) { 
 
                console.error( 
                    "Assignment error:", 
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
                    "Assign Complaint"; 
            } 
        } 
    ); 
} 
 
 
/* ========================================================= 
   RESCUE 
   ========================================================= */ 
 
function setupRescueButton() { 
 
    const button = 
        document.getElementById( 
            "triggerRescueButton" 
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
                            } 
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
                            "Rescue workflow triggered successfully.", 
                        "message-success" 
                    ); 
 
                } else { 
 
                    showMessage( 
                        message, 
                        data.message || 
                            "Unable to trigger rescue workflow.", 
                        "message-error" 
                    ); 
                } 
 
 
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
   ========================================================= */ 
 
function setupProofUpload() { 
 
    const form = 
        document.getElementById( 
            "proofUploadForm" 
        ); 
 
 
    if (!form) { 
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
 
 
    const button = 
        form.querySelector( 
            "button[type='submit']" 
        ); 
 
 
    form.addEventListener( 
        "submit", 
        async event => { 
 
            event.preventDefault(); 
 
 
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
                !fileInput.files || 
                !fileInput.files.length 
            ) { 
 
                showMessage( 
                    message, 
                    "Please select a proof file.", 
                    "message-warning" 
                ); 
 
                return; 
            } 
 
 
            const formData = 
                new FormData(); 
 
 
            formData.append( 
                "complaintId", 
                complaintId 
            ); 
 
 
            formData.append( 
                "file", 
                fileInput.files[0] 
            ); 
 
 
            if (button) { 
 
                button.disabled = 
                    true; 
 
                button.textContent = 
                    "Uploading..."; 
            } 
 
 
            try { 
 
                const response = 
                    await authenticatedFetch( 
                        `${API_BASE_URL}/evidence`, 
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
 
 
                if (response.ok) { 
 
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
 
                if (button) { 
 
                    button.disabled = 
                        false; 
 
                    button.textContent = 
                        "Upload Proof of Progress"; 
                } 
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

        if (document.getElementById("totalComplaints")) {
           loadDashboard(); 
        }
        if (getComplaintId()) {
           loadComplaintDetails(); 
        }
        setupAssignment(); 
 
        setupRescueButton(); 
 
        setupProofUpload(); 
 
        setupResolveButton(); 
 
        setupVerification(); 
    } 
);                                     