# CivicTrack — Architecture

## 1. Overview

CivicTrack is a civic complaint follow-through system designed to help citizens report civic issues and help officers track, prioritize, assign, and resolve those complaints.

The system follows a client-server architecture:

```text
┌─────────────────────┐
│       CITIZEN       │
│  Citizen Frontend   │
└──────────┬──────────┘
           │
           │ HTTP / REST API
           ▼
┌─────────────────────┐
│   EXPRESS BACKEND   │
│                     │
│ Authentication      │
│ Complaints          │
│ Assignments         │
│ Risk / Priority     │
│ SLA                 │
│ Evidence            │
│ Verification        │
│ Notifications       │
│ Analytics           │
└──────────┬──────────┘
           │
           │ SQL
           ▼
┌─────────────────────┐
│     POSTGRESQL      │
│      DATABASE       │
└─────────────────────┘

2. Technology Stack
Backend
Node.js
Express.js
JavaScript
REST APIs
JWT authentication
bcryptjs for password hashing
Multer for file uploads
CORS
dotenv
Database
PostgreSQL
Frontend

The frontend is a separate client application that communicates with the backend through REST APIs.

3. Backend Structure

The backend is organized into separate layers for routes, controllers, middleware, utilities, and server configuration.

src/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── database/
    └── schema.sql
server.js

server.js is the main entry point of the backend.

It:

Loads environment configuration.
Creates the Express application.
Enables JSON request handling.
Enables CORS.
Serves uploaded evidence files.
Registers API routes.
Starts the backend server.

The backend runs on port 5000 in the local development setup.

4. API Architecture

The backend exposes REST API endpoints under:

http://localhost:5000/api

The main API groups are:

/api/auth
/api/complaints
/api/analytics
/api/notifications
/api/evidence
/api/priority
/api/sla
/api/admin
/api/departments
/api/audit-logs
/api/intelligence

Additional complaint-related routes handle:

Status history
Rescue/escalation actions
Verification
Complaint assignment
5. Authentication and Authorization

CivicTrack uses JWT-based authentication.

The authentication flow is:

User
  │
  ▼
Login / Register
  │
  ▼
Auth API
  │
  ├── Password verification
  │
  └── JWT generation
  │
  ▼
Authenticated API Requests
  │
  ▼
JWT Middleware
  │
  ▼
Role-based access

Passwords are stored as hashes rather than plain-text passwords.

Different user roles are supported, including:

Citizen
Officer
Admin

Protected endpoints require a valid authentication token.

Role-based checks are used where an operation should only be performed by an authorized type of user.

6. Complaint Flow

The main complaint flow is:

Citizen
   │
   ▼
Submit Complaint
   │
   ▼
Required-field validation
   │
   ▼
Location validation
   │
   ▼
Content validation
   │
   ▼
Duplicate check
   │
   ▼
Save complaint
   │
   ▼
Create initial status history
   │
   ▼
Officer processing
   │
   ▼
Assignment / Status updates
   │
   ▼
Evidence / Verification
   │
   ▼
Resolution

The backend does not blindly save every complaint.

Before saving a complaint, the backend checks important input conditions.

Input validation

The complaint API validates:

Required complaint fields
Latitude
Longitude
Numeric coordinate values
Latitude range
Longitude range

Latitude must be between -90 and 90.

Longitude must be between -180 and 180.

Content validation

A basic rule-based inappropriate-language filter checks the complaint title and description.

If blocked terms are detected, the complaint is rejected.

This is a rule-based validation mechanism and is not claimed to be an AI model.

Duplicate detection

The backend checks for possible duplicate complaints using factors including:

Same citizen
Same category
Similar title
Nearby coordinates
Recent creation time

The current duplicate window is based on complaints created within 24 hours and coordinates within a small geographic range.

When a possible duplicate is detected, the API returns the existing complaint ID instead of creating another complaint.

This is intentionally treated as a possible duplicate, because rule-based duplicate detection can produce false positives or miss some duplicates.

7. Complaint Access

Citizens and staff have different access patterns.

Citizens

Citizens can access their own complaints.

Officers and Admins

Officers and administrators can access complaints needed for operational processing.

This separation prevents ordinary citizens from accessing other citizens' complaint records through the normal complaint APIs.

8. Complaint Status and History

When a complaint is created, its initial status is recorded.

When the status changes, the backend:

Updates the complaint status.
Records the new status in status history.
Creates the relevant notification where applicable.

This provides a historical record of the complaint's progress.

Conceptually:

Complaint
   │
   ├── Created
   │
   ├── Assigned
   │
   ├── In Progress
   │
   ├── Resolved
   │
   └── Verified / Closed

The exact status transitions depend on the implemented API and workflow.

9. Assignment System

Complaints can be assigned to officers for follow-through.

The assignment system maintains information about which officer is responsible for a complaint.

This allows the officer workflow to move from:

Unassigned complaint
        │
        ▼
Assigned officer
        │
        ▼
Officer action
        │
        ▼
Status update
        │
        ▼
Resolution

Assignment records are stored separately from the complaint so that assignment information can be tracked independently.

10. Risk and Priority Logic

CivicTrack includes backend intelligence for complaint risk and priority.

The purpose is to identify complaints that may require additional attention instead of only looking at complaints after they become overdue.

The current risk logic is rule-based/heuristic, not a machine-learning model.

Factors can include information such as:

Complaint age
Current status
Inactivity
Priority-related information
Other complaint history signals

The system can provide an explanation for the calculated risk rather than returning only an unexplained number.

The design goal is:

Complaint
    │
    ▼
Risk / Priority Analysis
    │
    ├── Lower attention required
    │
    └── Higher attention required
             │
             ▼
       Officer follow-through

This makes the risk result more understandable to users.

11. SLA and Overdue Handling

The backend contains SLA-related functionality for identifying complaints that require attention based on time-related conditions.

The purpose is to support follow-through by identifying complaints that remain unresolved or inactive beyond their expected handling period.

This supports the project's central goal:

CivicTrack doesn't just collect complaints. It follows them until action is taken.

12. Evidence Handling

CivicTrack supports evidence associated with complaints.

The backend uses file-upload handling for evidence and exposes evidence-related API endpoints.

The general flow is:

Officer / Authorized User
        │
        ▼
Upload Evidence
        │
        ▼
Backend
        │
        ▼
Evidence Storage
        │
        ▼
Complaint Evidence Record

Uploaded files are stored through the backend upload mechanism, while the database maintains the associated evidence records.

13. Verification

CivicTrack includes a complaint verification workflow.

The purpose is to allow authorized users to process verification-related actions after complaint handling.

The backend checks the complaint and the relevant verification state before accepting verification responses.

This prevents an officer from performing a verification action when the required verification workflow is not available.

14. Notifications

The backend includes notification functionality.

Notifications can be generated when important complaint events occur, such as status changes.

The notification system allows the application to inform users about relevant changes without requiring them to repeatedly inspect the complaint manually.

15. Analytics

An analytics API is included in the backend.

Analytics can be used to provide operational information about complaints and their status.

The architecture keeps analytics functionality separate from the main complaint controller logic so that reporting and operational APIs can evolve independently.

16. Database Architecture

CivicTrack uses PostgreSQL as its persistent data store.

The database schema includes tables for major application entities, including:

users
complaints
complaint_status_history
complaint_assignments
departments
escalations
evidence
notifications
verification_requests
audit_logs

The relationships can be represented conceptually as:

                 ┌──────────────┐
                 │    USERS     │
                 └──────┬───────┘
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
       ┌────────────┐       ┌──────────────┐
       │ COMPLAINTS │       │ NOTIFICATIONS│
       └─────┬──────┘       └──────────────┘
             │
      ┌──────┼──────────┬─────────────┐
      │      │          │             │
      ▼      ▼          ▼             ▼
  STATUS  ASSIGNMENT  EVIDENCE   VERIFICATION
 HISTORY

The database schema is maintained in:

src/database/schema.sql
17. API Request Flow

A typical protected request follows this sequence:

Frontend
   │
   │ HTTP Request
   ▼
Express Route
   │
   ▼
Authentication Middleware
   │
   ▼
Authorization / Role Check
   │
   ▼
Controller
   │
   ├── Validate input
   ├── Apply business rules
   └── Query/update database
   │
   ▼
PostgreSQL
   │
   ▼
Controller Response
   │
   ▼
JSON Response
   │
   ▼
Frontend

This separation keeps HTTP routing, authentication, business logic, and database operations organized.

18. Security Considerations

The backend uses several basic security mechanisms:

Password hashing
JWT authentication
Role-based authorization
Protected API endpoints
Environment variables for configuration and secrets
Input validation
Restricted complaint access
File-upload handling
Audit-related database records

Secrets such as database passwords and JWT secrets are kept outside the committed source code through environment configuration.

The .env file is not intended to be committed to the public repository.

19. Offline Architecture

Offline complaint handling is primarily a frontend responsibility.

The intended flow is:

Citizen
   │
   ▼
Frontend
   │
   ├── Internet available
   │       │
   │       ▼
   │    Backend API
   │
   └── Internet unavailable
           │
           ▼
      Local Queue
           │
           ▼
      Connection Restored
           │
           ▼
       Backend API

The backend continues to expose the normal complaint creation API.

When connectivity is restored, queued frontend requests can be sent to the backend.

20. Current Architecture Summary

CivicTrack follows a modular client-server architecture:

┌──────────────────────────────────────────┐
│              CIVICTRACK                  │
│                                          │
│  ┌──────────────┐                        │
│  │   FRONTEND   │                        │
│  └──────┬───────┘                        │
│         │ REST API                       │
│         ▼                                │
│  ┌───────────────────────────────┐       │
│  │       EXPRESS BACKEND         │       │
│  │                               │       │
│  │ Auth                          │       │
│  │ Complaints                    │       │
│  │ Assignments                   │       │
│  │ Risk / Priority               │       │
│  │ SLA                           │       │
│  │ Evidence                      │       │
│  │ Verification                  │       │
│  │ Notifications                 │       │
│  │ Analytics                     │       │
│  └──────────────┬────────────────┘       │
│                 │ SQL                    │
│                 ▼                        │
│  ┌───────────────────────────────┐       │
│  │          POSTGRESQL           │       │
│  │                               │       │
│  │ Users                         │       │
│  │ Complaints                    │       │
│  │ Assignments                   │       │
│  │ Status History                │       │
│  │ Evidence                      │       │
│  │ Notifications                 │       │
│  │ Verification                  │       │
│  │ Audit Logs                    │       │
│  └───────────────────────────────┘       │
└──────────────────────────────────────────┘

The architecture is designed around one main principle:

Collect the complaint, validate it, process it, track its progress, and maintain a record of the actions taken.