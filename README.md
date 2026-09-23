# CivicTrack

CivicTrack is a civic complaint tracking and follow-through platform designed for Mysuru. It helps citizens report civic issues and helps officers track, prioritize, act on, and resolve complaints.

## 1. Problem Understanding & Sub-problem

### Problem

Civic complaints can remain unresolved for long periods after they are reported. Citizens may not know whether anyone has acted on their complaint, while officers need better visibility into complaints that are becoming overdue or at risk of being forgotten.

### Selected Sub-problem

**Follow-through**

CivicTrack tracks complaints after they are filed, including their status, activity, assignment, and history.

The system also uses a rule-based risk score to identify complaints that may require attention before they are forgotten.

---

## 2. Target Users & Mysuru Context

### Target Users

* **Citizens** — report civic issues and track complaint progress.
* **Officers** — view, manage, assign, update, and resolve complaints.
* **Administrators** — manage users, departments, assignments, and system-level information.

### Mysuru Context

The platform is designed for civic issues that can occur across Mysuru, including:

* Garbage-related problems
* Broken streetlights
* Potholes
* Blocked drains
* Other civic complaints

The system is designed with city-scale usage in mind, including periods of increased complaint activity.

---

## 3. Solution Overview & Core Journey

CivicTrack follows a simple complaint journey:

**Citizen → Complaint → Validation → Risk Checking → Officer Action → Status Tracking → Resolution**

### Core Flow

1. A citizen submits a complaint.
2. The backend validates the complaint information.
3. The system checks for possible duplicate complaints.
4. Invalid locations and inappropriate complaint text are rejected.
5. The complaint is stored in PostgreSQL.
6. A rule-based risk score helps identify complaints that may require attention.
7. Officers can view and manage complaints.
8. Complaint status changes are recorded in status history.
9. Evidence and notifications can support the follow-through process.
10. The citizen can track the complaint until resolution.

CivicTrack does not just collect complaints. **It follows them until action is taken.**

---

## 4. Architecture

CivicTrack uses a frontend → REST API → Express backend → PostgreSQL architecture.

### Main Components

* Citizen and officer frontend
* REST API
* Express.js backend
* Authentication and role-based access
* Complaint management
* Assignment management
* Risk scoring
* SLA tracking
* Evidence management
* Notifications
* PostgreSQL database

The detailed architecture, components, data model, and APIs are documented here:

**[View Architecture Documentation](docs/architecture.md)**

---

## 5. Tech Stack & AI Usage

### Technology Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Authentication:** JWT
* **Password Security:** bcryptjs
* **File Uploads:** Multer
* **API:** REST API
* **Version Control:** Git and GitHub

### AI Usage

AI tools were used during development for assistance with understanding, debugging, documentation, and improving implementation.

The current complaint risk mechanism is **rule-based**, not a machine-learning model. The rules are designed to make the risk decision explainable and testable.

Detailed AI usage disclosure:

**[View AI Usage Disclosure](ai.md)**

---

## 6. Decision Log Summary

Key technical decisions include:

* Node.js + Express.js for the backend REST API.
* PostgreSQL for structured civic complaint data.
* Rule-based risk scoring for explainable complaint risk detection.
* Duplicate complaint detection using category, title, location, and time.
* Input validation for invalid locations and inappropriate text.
* JWT authentication and role-based access control.
* Complaint status history for tracking follow-through.
* Evidence and notifications to support complaint management.
* Modular backend structure for easier maintenance and future scaling.

**[View the Complete Decision Log](resource-templates/decision-log.md)**

---

## 7. Setup & Run

### Backend Setup

Clone the repository and install the backend dependencies:

```bash
cd src/backend
npm install

## 8. Known Limitations & Roadmap

### Current Limitations

* The risk system is rule-based rather than trained machine learning.
* Duplicate detection can sometimes identify similar complaints as possible duplicates.
* Location validation checks valid latitude and longitude ranges but does not currently enforce a precise Mysuru city boundary.
* Offline synchronization depends on the frontend implementation and successful reconnection.
* Large-scale deployment would require additional infrastructure and performance optimization.

### Future Roadmap

* Improve risk prediction using historical complaint data.
* Add stronger location/geofencing support.
* Improve duplicate detection.
* Add more advanced analytics and dashboards.
* Add background processing for notifications and SLA monitoring.
* Improve scalability for large numbers of simultaneous users.
* Add multilingual citizen support.

For more details:

**[View Limitations & Roadmap](docs/limitations.md)**

---

## Project Documentation

| Document                                           | Description                                           |
| -------------------------------------------------- | ----------------------------------------------------- |
| [Architecture](docs/architecture.md)               | System architecture, components, data model, and APIs |
| [Constraints](docs/constraints.md)                 | Approach to the required hard constraints             |
| [Limitations](docs/limitations.md)                 | Known limitations and future roadmap                  |
| [Setup](docs/setup.md)                             | Local setup, environment variables, and testing       |
| [AI Usage](ai.md)                                  | AI-assisted development and runtime AI disclosure     |
| [Decision Log](resource-templates/decision-log.md) | Important technical decisions and trade-offs          |
| [Resource](resource.md)                            | Central project links and submission resources        |

## Repository

GitHub repository:

https://github.com/nagrajg9742-dotcom/HM26-D68D.git

## Security
CivicTrack keeps sensitive configuration outside the repository using environment variables.

- Database credentials are stored in `.env`.
- JWT secrets are stored in `.env`.
- `.env` is excluded through `.gitignore`.
- Secrets and database passwords must not be committed to GitHub.