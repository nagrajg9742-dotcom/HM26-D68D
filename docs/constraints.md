# CivicTrack — Constraints

## 1. Overview

CivicTrack is designed for real-world civic complaint handling under practical city-level constraints.

The system focuses on five important constraints:

1. Offline / unreliable connectivity
2. Duplicate or low-quality complaints
3. Invalid or untrusted input
4. Complaint follow-through and accountability
5. City-scale usage and operational load

The following sections describe how CivicTrack addresses each constraint.

---

## 2. Constraint 1 — Unreliable or No Internet Connectivity

### Problem

Citizens may not always have a stable internet connection while reporting a civic issue.

A complaint should not necessarily be lost just because the network is temporarily unavailable.

### CivicTrack Approach

The offline queue is handled primarily by the frontend.

When the application is offline:

```text
Citizen
   │
   ▼
Frontend
   │
   ▼
Local Queue
   │
   │ Internet unavailable
   │
   ▼
Complaint remains stored locally

When connectivity is restored:

Internet Restored
       │
       ▼
Local Queue
       │
       ▼
Backend API
       │
       ▼
PostgreSQL

The backend continues to provide the normal complaint creation API so that queued complaints can be synchronized when connectivity returns.

Benefit

A temporary network failure does not have to result in a permanently lost complaint.

3. Constraint 2 — Duplicate Complaints
Problem

Multiple citizens may report the same civic issue.

For example, several people may report the same overflowing garbage location within a short period.

Without duplicate detection, this can create unnecessary duplicate records and increase the workload for officers.

CivicTrack Approach

The backend performs a possible-duplicate check before creating a complaint.

The current rule considers factors such as:

Same citizen
Same category
Similar title
Nearby coordinates
Recent creation time

The current duplicate detection window uses complaints created within 24 hours and a small geographic distance threshold.

If a possible duplicate is found, the backend returns:

Possible duplicate complaint detected

along with the existing complaint ID.

Important Limitation

This is rule-based duplicate detection.

It may:

Detect some complaints as duplicates when they are actually different.
Fail to detect some duplicates when the wording or location differs significantly.

Therefore, the system reports a possible duplicate rather than claiming that every detected match is definitely the same issue.

4. Constraint 3 — Invalid or Untrusted Input
Problem

Civic applications receive input directly from users.

Users may accidentally or intentionally submit:

Missing fields
Invalid coordinates
Impossible latitude or longitude values
Inappropriate text
Repeated complaints

Accepting invalid information can reduce data quality and affect downstream processing.

CivicTrack Approach

The backend validates complaint input before saving it.

The current checks include:

Required fields

Required complaint information must be provided.

Numeric coordinates

Latitude and longitude must be valid numeric values.

Latitude range

Latitude must be between:

-90 and 90
Longitude range

Longitude must be between:

-180 and 180
Inappropriate text

A rule-based content filter checks the complaint title and description for configured blocked terms.

If inappropriate language is detected, the complaint is rejected.

Duplicate validation

Possible duplicate complaints are checked before insertion.

Result

Only complaints that pass the implemented validation checks are inserted into the database.

5. Constraint 4 — Follow-Through and Accountability
Problem

A civic complaint system should not stop after collecting a complaint.

A complaint can remain unresolved or inactive if there is no mechanism to track what happened after submission.

CivicTrack Approach

CivicTrack maintains complaint progress through:

Complaint status
Status history
Officer assignments
Notifications
SLA-related handling
Evidence
Verification
Audit-related records

The workflow is:

Complaint Submitted
        │
        ▼
Validation
        │
        ▼
Complaint Stored
        │
        ▼
Officer Assignment
        │
        ▼
Status Updates
        │
        ▼
Evidence / Verification
        │
        ▼
Resolution

Status history provides a record of changes instead of keeping only the latest complaint status.

This helps officers and other authorized users understand the complaint's progress.

6. Constraint 5 — City-Scale Usage
Problem

A real city may have many wards, departments, citizens, officers, and complaints.

The system should therefore avoid depending on a single small set of manually maintained records.

CivicTrack Approach

The application uses:

PostgreSQL for persistent structured storage.
Separate database tables for different entities.
REST APIs for communication between clients and backend.
Modular Express routes and controllers.
Role-based access.
Separate assignment and status-history records.
Separate evidence and notification records.

The architecture separates:

Frontend
   ↓
REST API
   ↓
Backend Logic
   ↓
Database

This allows individual parts of the system to be improved or scaled independently.

Future Scaling Considerations

For larger city-wide deployments, the system can be extended with:

Database indexing and query optimization
Background jobs for notifications and heavy processing
Caching
Horizontal backend scaling
Load balancing
Object storage for large evidence files
Monitoring and logging infrastructure

These are scaling improvements rather than claims about the current local deployment.

7. Constraint Handling Summary
Constraint	CivicTrack Response
Unreliable connectivity	Frontend offline queue and later synchronization
Duplicate complaints	Rule-based possible duplicate detection
Invalid input	Required-field, coordinate, content, and duplicate validation
Lack of follow-through	Status history, assignments, SLA, notifications, evidence, and verification
City-scale usage	Modular REST backend and PostgreSQL data model with future scaling options
8. Design Principle

CivicTrack is designed around a simple principle:

A civic complaint should not disappear after it is submitted.

The system therefore focuses not only on complaint collection, but also on validation, assignment, tracking, follow-through, and maintaining a history of actions.


Then press:

**Ctrl + S**

### Important

This document deliberately **does not claim features that aren't implemented**. For example, it doesn't claim AI-based fake-photo detection or a city geofence, because those aren't currently part of your backend.

