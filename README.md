# CivicTrack — Civic complaint tracking and follow-through platform for Mysuru

> HackMysuru 1.0 · Phase 1 · Civic Governance & Clean Mysuru
> Team Tech Yuva (`HM26-D6BD`)

| 📎 Submission links          | 📋 Templates                                 | 🏗️ Architecture                               | 🛡️ Hard constraints                         | ⚙️ Setup                         | 🤖 AI usage      | ⚠️ Limitations                               |
| ---------------------------- | -------------------------------------------- | ---------------------------------------------- | -------------------------------------------- | -------------------------------- | ---------------- | -------------------------------------------- |
| [resource.md](./resource.md) | [resource-templates/](./resource-templates/) | [docs/architecture.md](./docs/architecture.md) | [docs/constraints.md](./docs/constraints.md) | [docs/setup.md](./docs/setup.md) | [ai.md](./ai.md) | [docs/limitations.md](./docs/limitations.md) |

<!--
This README is the overview. Detailed content lives in the linked files so each stays short.
Keep the section ORDER below. Reviewers look for each section in the same place in every repo.
-->

## 1. Problem Understanding

**Chosen sub-problem:** **Follow-through**

* **The gap we saw:** In Mysuru, a citizen may report issues such as overflowing garbage, blocked drains, potholes, or damaged streetlights, but the complaint can become difficult to follow after it is submitted. Citizens may not know whether their complaint has been reviewed, assigned to the responsible officer, acted upon, or resolved. Officers also need better visibility into complaints that are becoming overdue or inactive across the city.

* **Why it matters:** For Mysuru residents, delayed follow-through on everyday civic issues can affect neighbourhood cleanliness, road safety, drainage, and the overall quality of public spaces. When citizens cannot see what is happening after they report an issue, they may lose confidence in the complaint process or submit the same issue repeatedly.

* **Why we chose this over the others:** We chose follow-through because the challenge is not only getting a civic complaint into the system; it is ensuring that the complaint continues moving after submission. CivicTrack is designed around the Mysuru civic complaint journey, connecting validation, duplicate checking, risk scoring, officer assignment, status history, evidence, notifications, and resolution.

* **What "solved" looks like for us:** A civic complaint from a Mysuru resident should have a clear, trackable journey from submission to resolution. Citizens should be able to see meaningful progress, while officers should be able to identify complaints that may require attention and take action before they are forgotten.

## 2. Target Users & Mysuru Context

| User                          | Their situation                                                                                                                                                                                                                                              | What they need from us                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Mysuru resident**           | Reports issues such as overflowing garbage, potholes, blocked drains, or damaged streetlights. Residents may not always know which civic authority or department is responsible, particularly around areas where municipal and panchayat jurisdictions meet. | **Report once, track the complaint, see its status and assignment, and know when action is taken.**                    |
| **Mysuru civic officer**      | Handles multiple complaints within the relevant civic administration and needs visibility into complaints that are pending, inactive, overdue, or requiring attention.                                                                                       | **View, prioritize, assign, update, and resolve complaints with a clear status history.**                              |
| **Field / sanitation worker** | Works on assigned civic issues and needs clear information about the reported problem and the action expected in the field.                                                                                                                                  | **See assigned work, understand the complaint, update progress, and support resolution with evidence where required.** |

**Local context we designed for:** Mysuru has an urban civic administration centered on the **Mysuru City Corporation (MCC)**, while areas around the city can involve neighbouring local-government and panchayat jurisdictions. This creates a practical context where residents may not always know which authority or department should handle a particular civic issue. CivicTrack focuses on the **follow-through problem** by keeping the complaint, assignment, status history, evidence, and resolution journey visible in one workflow. The platform is designed for common Mysuru civic issues such as garbage accumulation, potholes, blocked drains, and damaged streetlights, with straightforward web-based access for citizens and civic staff.

## 3. Solution Overview

CivicTrack gives Mysuru residents one place to report civic problems such as garbage accumulation, potholes, blocked drains, and damaged streetlights and then follow what happens to their complaint. After a complaint is submitted, the system validates it, checks for possible duplicates, and uses a rule-based risk score to highlight complaints that may need attention. Civic officers can view, prioritize, assign, update, and resolve complaints while the system keeps a record of status changes, evidence, and activity. Citizens can then track the complaint journey from submission through action and resolution.

**Core flow:**

1. **Citizen submits a civic complaint** with the issue details and location.
2. **CivicTrack validates the complaint**, checks for possible duplicates, and calculates a rule-based risk score.
3. **Civic officer reviews and manages the complaint** by prioritizing, assigning, updating its status, and taking action toward resolution.
4. **Citizen sees the complaint progress** through status updates, activity/history, and the final resolution.

**Screenshots:** Screenshots of the citizen complaint submission, officer dashboard, and complaint details/risk intelligence views will be added under `docs/images/` before final submission. Each image will be kept below 1 MB.

## 4. Architecture

**Architecture flow:**
**Citizen / Officer Web Frontend → REST API → Node.js + Express Backend → PostgreSQL Database**

The frontend sends authenticated requests to the REST API. The Express backend handles authentication, validation, complaint management, assignment, risk scoring, SLA tracking, evidence, notifications, and status history, and stores the application data in PostgreSQL. The backend then returns the relevant complaint and workflow information to the citizen or officer frontend.

➡️ Diagram, components, data model and APIs: **[docs/architecture.md](./docs/architecture.md)**

## 5. Tech Stack & AI Usage

**Stack:** HTML, CSS, JavaScript · Node.js · Express.js · PostgreSQL · JWT · bcryptjs · Multer · REST API

* **HTML, CSS & JavaScript:** Provide a lightweight web interface for citizens and officers to submit, view, track, and manage complaints.
* **Node.js + Express.js:** Provide the REST backend needed to handle complaint workflows, authentication, validation, assignments, status updates, risk scoring, and other civic operations.
* **PostgreSQL:** Stores structured complaint, user, assignment, status history, evidence, notification, and related civic data reliably.
* **JWT + bcryptjs:** Support authenticated access and secure password handling for citizen, officer, and administrative roles.
* **Multer:** Supports evidence and file uploads associated with complaints.
* **REST API:** Connects the citizen/officer frontend with the backend and provides a modular interface for CivicTrack's different services.

Full architecture and technology rationale: **[docs/architecture.md](./docs/architecture.md)**

**AI tools used in development:** ChatGPT was used for development assistance, debugging, code understanding, documentation, and implementation support.

**AI inside the product:** No machine-learning model is currently used. CivicTrack uses a **rule-based risk scoring mechanism** to identify complaints that may require attention. The rules are explainable and testable.

➡️ Full disclosure: **[ai.md](./ai.md)**

## 6. Decision Log (Summary)

* **Chose:** Rule-based risk scoring and a PostgreSQL-backed REST architecture, **over:** starting with a machine-learning risk model or a more complex architecture.
* **Because:** The chosen approach keeps complaint follow-through explainable, testable, and practical for the Phase 1 CivicTrack prototype.
* **First thing to break at city scale:** Database load and backend performance as complaint volume, concurrent users, evidence uploads, notifications, and analytics increase.

➡️ Full decision log: **[resource.md](./resource.md)** · Template: **[resource-templates/decision-log.md](./resource-templates/decision-log.md)**

## 7. Setup & Run

```bash
git clone https://github.com/nagrajg9742-dotcom/HM26-D68D.git
cd HM26-D68D
cd src/backend
npm install
node server.js
```

The officer frontend can be served separately from `frontend/officer`:

```bash
cd frontend/officer
npx http-server . -p 3000
```

The backend runs on `http://localhost:5000` and the officer frontend runs on `http://127.0.0.1:3000`.

➡️ Prerequisites, environment variables, seed data and offline testing: **[docs/setup.md](./docs/setup.md)**

## 8. Known Limitations

* **Rule-based risk scoring:** The current risk mechanism is rule-based rather than a trained machine-learning model, so its predictions are limited by the rules and available complaint information.

* **Duplicate and location detection:** Duplicate detection may identify similar complaints as possible duplicates, while location validation checks coordinate validity but does not currently enforce a precise Mysuru city boundary.

* **Scale and offline limitations:** Large-scale deployment would require additional infrastructure and performance optimization, while offline synchronization depends on successful reconnection and the frontend implementation.

➡️ Full list, edge cases and scaling roadmap: **[docs/limitations.md](./docs/limitations.md)**

---

## Team

| Name     | Role             |
| -------- | ---------------- |
| Member 1 | Citizen Frontend |
| Member 2 | Backend          |
| Member 3 | Officer Frontend |

## License

`None`. You retain full ownership of your code.
