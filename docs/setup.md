# CivicTrack — Setup Guide

## 1. Overview

This document explains how to run the CivicTrack backend locally.

The backend uses:

- Node.js
- Express.js
- PostgreSQL

The frontend communicates with the backend through REST APIs.

---

## 2. Prerequisites

Install the following before running the project:

- Node.js
- npm
- PostgreSQL
- Git

Verify Node.js:

```powershell
node --version

Verify npm:

npm --version

Verify Git:

git --version

3. Clone the Repository

Clone the project repository:

git clone <REPOSITORY_URL>

Move into the project directory:

cd <PROJECT_FOLDER>

The repository should contain the project source code and documentation.

4. Backend Installation

Move into the backend directory:

cd src\backend

Install the Node.js dependencies:

npm install

The backend dependencies include:

express
pg
bcryptjs
jsonwebtoken
multer
cors
dotenv
5. PostgreSQL Database

Create a PostgreSQL database for CivicTrack.

The database schema is provided in:

src/database/schema.sql

Run the schema against the CivicTrack database using PostgreSQL tools.

The database contains tables for entities including:

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
6. Environment Configuration

The backend uses environment variables for database configuration and application secrets.

Create a .env file in the project root.

Example structure:

PORT=5000

DB_HOST=localhost
DB_PORT=<POSTGRES_PORT>
DB_NAME=civictrack
DB_USER=<POSTGRES_USER>
DB_PASSWORD=<POSTGRES_PASSWORD>

JWT_SECRET=<YOUR_JWT_SECRET>

Do not commit the .env file to the repository.

Do not place real passwords, tokens, or private secrets inside source files.

The exact PostgreSQL port may differ between development machines.

7. Backend Configuration

The backend loads the root .env file through the server configuration.

The database connection uses:

DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD

The application server uses:

PORT
8. Start the Backend

From:

src\backend

run:

node server.js

A successful startup should display a message similar to:

CivicTrack backend running on port 5000

The backend API is then available at:

http://localhost:5000/api
9. Test the Backend

A protected endpoint can be tested from a browser or API client.

For example:

http://localhost:5000/api/complaints

If authentication is required and no token is supplied, the backend should reject the request.

This confirms that the protected API is running.

10. Authentication

Users can register and log in through the authentication API.

The main authentication endpoint group is:

/api/auth

Authenticated requests use a JWT token.

The request header format is:

Authorization: Bearer <TOKEN>

Do not commit or share real authentication tokens.

11. Complaint API

The complaint API is available under:

/api/complaints

The complaint creation flow performs backend validation before saving a complaint.

Validation includes:

Required fields
Numeric latitude
Numeric longitude
Latitude range
Longitude range
Basic inappropriate-language filtering
Possible duplicate detection

A valid complaint is then stored in PostgreSQL and its initial status history is recorded.

12. Backend Features

The backend provides API groups for:

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

Complaint-related functionality also includes:

Status history
Assignments
Rescue/escalation actions
Verification
13. Uploads

Evidence uploads are handled by the backend.

Uploaded files are stored in the backend upload directory during local development:

src/backend/uploads/

The uploads directory should not be used for committing large binary files to the repository.

14. Offline Testing

Offline complaint queuing is primarily handled by the frontend.

The intended test flow is:

1. Open the citizen application.
2. Log in.
3. Open the complaint/report page.
4. Enable browser offline mode.
5. Submit a complaint.
6. Confirm that the complaint is queued locally.
7. Restore the internet connection.
8. Confirm that the queued complaint is synchronized with the backend.
Chrome DevTools Offline Test

Open Chrome DevTools:

F12

Then:

Network
   ↓
Throttling
   ↓
Offline

Submit the complaint while offline.

Restore the connection by selecting:

No throttling

The frontend can then synchronize the queued complaint with:

POST /api/complaints
15. Local Development Ports

The default CivicTrack backend port is:

5000

The PostgreSQL port is configured through:

DB_PORT

Do not assume that every developer machine uses the same PostgreSQL port.

16. Common Problems
Database connection error

Check:

DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD

Also confirm that the PostgreSQL service is running.

Port 5000 already in use

Stop the process currently using port 5000 or configure another application port through the environment configuration.

Authentication failure

Check that:

The user exists in the local database.
The correct password is being used.
The user has the expected role.
A new login token is obtained after changing account information.
Database schema missing

Confirm that:

src/database/schema.sql

has been applied to the intended CivicTrack PostgreSQL database.

17. Security Notes

Never commit:

.env
Database passwords
JWT secrets
Authentication tokens
Private credentials

The repository should contain configuration examples rather than real secrets.

18. Quick Start

For a developer who already has PostgreSQL configured:

cd <PROJECT_FOLDER>
cd src\backend
npm install
node server.js

Then open:

http://localhost:5000/api

The frontend can communicate with the backend using:

http://localhost:5000/api
19. Project Structure

The relevant project structure is:

HM26-D68D/
├── docs/
│   ├── architecture.md
│   ├── constraints.md
│   ├── limitations.md
│   └── setup.md
│
├── resource-templates/
│
└── src/
    ├── backend/
    │   ├── controllers/
    │   ├── routes/
    │   ├── middleware/
    │   ├── utils/
    │   ├── uploads/
    │   └── server.js
    │
    └── database/
        └── schema.sql
20. Final Verification

Before submitting or demonstrating the project, verify:

 PostgreSQL is running.
 Database exists.
 Database schema has been applied.
 Environment variables are configured locally.
 npm install completes successfully.
 Backend starts successfully.
 Authentication works.
 Complaint creation works.
 Complaint validation works.
 Duplicate detection works.
 Status updates work.
 Evidence functionality works.
 Offline queue and synchronization are tested on the frontend.
 No secrets are committed to Git.