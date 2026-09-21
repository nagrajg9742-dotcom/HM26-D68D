const complaintsMessage = document.getElementById("complaintsMessage");
const complaintsList = document.getElementById("complaintsList");

const token = localStorage.getItem("token");


// Check if user is logged in
if (!token) {

    complaintsMessage.textContent =
        "Please login to view your complaints.";

} else {

    loadComplaints();
}


// Load complaints from backend
async function loadComplaints() {

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

            complaintsMessage.textContent =
                data.message || "Unable to load complaints.";

            return;
        }


        const complaints = data.complaints;


        if (!complaints || complaints.length === 0) {

            complaintsMessage.textContent =
                "You have not submitted any complaints yet.";

            return;
        }


        complaintsMessage.textContent = "";


        complaintsList.innerHTML = "";


        complaints.forEach(function (complaint) {

            const complaintCard =
                document.createElement("div");

            complaintCard.className = "complaint-item";


            complaintCard.innerHTML = `
    <h2>${complaint.title}</h2>

    <p>
        <strong>Complaint ID:</strong>
        ${complaint.id}
    </p>

    <p>
        <strong>Category:</strong>
        ${complaint.category}
    </p>

    <p>
        <strong>Description:</strong>
        ${complaint.description}
    </p>

    
    


                <p>
                    <strong>Category:</strong>
                    ${complaint.category}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${complaint.description}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${complaint.status}
                </p>

                <p>
                    <strong>Submitted:</strong>
                    ${new Date(complaint.created_at).toLocaleString()}
                </p>
            `;


            complaintsList.appendChild(complaintCard);

        });


    } catch (error) {

        console.error("Get complaints error:", error);

        complaintsMessage.textContent =
            "Unable to connect to the server.";
    }
}
