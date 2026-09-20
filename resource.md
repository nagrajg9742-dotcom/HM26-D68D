# CivicTrack — Resource Hub

## 1. Project

**Project Name:** CivicTrack

**Project Type:** Civic complaint follow-through and monitoring system

**Purpose:** Track civic complaints after submission, monitor their progress, identify complaints that may be at risk of being forgotten, and help responsible staff take action.

---

## 2. Repository

**GitHub Repository:**

https://github.com/nagrajg9742-dotcom/HM26-D68D.git

The repository contains the application source code and project documentation.

---

## 3. Documentation

### Architecture

[Architecture Documentation](docs/architecture.md)

Contains:

- System architecture
- Components
- Technology stack
- Database structure
- API overview

### Constraints

[Constraints Documentation](docs/constraints.md)

Contains the project's approach to handling the required hard constraints.

### Limitations

[Limitations Documentation](docs/limitations.md)

Contains known limitations, edge cases, and future improvements.

### Setup

[Setup Documentation](docs/setup.md)

Contains:

- Installation instructions
- Environment configuration
- Database setup
- Backend startup
- Testing instructions
- Offline testing procedure

### AI Usage

[AI Usage Disclosure](ai.md)

Documents how AI tools were used during development and how the team reviewed and tested the resulting work.

---

## 4. Project Overview

CivicTrack follows a complaint after it is submitted instead of treating complaint submission as the end of the process.

The system supports:

- Citizen complaint submission
- Complaint validation
- Possible duplicate detection
- Complaint status tracking
- Status history
- Officer assignment
- Priority and risk information
- SLA-related monitoring
- Evidence handling
- Notifications
- Verification and escalation-related workflows

---

## 5. Core API

Backend API base URL during local development:

```text
http://localhost:5000/api

Main API groups include:

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
6. Source Code

The main application source code is located under:

src/

Backend:

src/backend/

Database schema:

src/database/schema.sql
7. Important Git Commits

The following commits represent important development milestones:

Commit	Description
ddbe38c	Add database schema
6a59f87	Improve risk explanation
0e0392e	Enhance complaint risk prediction
1a8d0d1	Add complaint validation and duplicate detection

These hashes provide traceability for important implementation changes.

8. Demo and Submission Resources

The final demonstration video, if applicable, should be provided through the official submission location.

The video should not be committed to the Git repository as a binary file.

Any final external links should be added here once they are finalized.

9. Resource Verification

Important project resources should remain accessible from the repository.

Before final submission, verify:

 GitHub repository is accessible.
 README.md is present.
 All documentation files are present.
 Architecture documentation is updated.
 Setup instructions work on a clean environment.
 AI usage disclosure is present.
 Database schema is included.
 No .env file or private credentials are committed.
 Final demo/video link is added when available.
 Final resource links and hashes are checked before submission.
10. Security

Do not publish:

Database passwords
JWT secrets
Authentication tokens
Private credentials
Personal passwords
The .env file must remain local and must not be committed to GitHub.