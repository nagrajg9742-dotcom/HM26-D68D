# CivicTrack — Limitations

## 1. Overview

CivicTrack is a working prototype designed to demonstrate civic complaint reporting, validation, follow-through, and officer-side processing.

The following limitations describe the current implementation and areas that can be improved for a larger real-world deployment.

---

## 2. Rule-Based Duplicate Detection

The current duplicate detection system uses predefined rules based on factors such as:

- Citizen
- Complaint category
- Similar title
- Nearby coordinates
- Recent creation time

This approach is simple and explainable, but it is not a full semantic duplicate-detection system.

### Possible limitations

- Two different complaints may be incorrectly identified as duplicates.
- Similar complaints with different wording may not always be detected.
- The current geographic threshold may not work equally well for every type of civic issue.

### Future improvement

A future version could use text similarity or embedding-based comparison along with geographic and time-based signals.

---

## 3. Rule-Based Risk Prediction

The current complaint risk logic is rule-based/heuristic.

It uses complaint-related signals such as:

- Age
- Status
- Inactivity
- Priority
- History

It is not currently a machine-learning prediction model.

### Possible limitations

The rules may not perfectly predict which complaints will be forgotten or delayed.

### Future improvement

With sufficient historical complaint data, the system could be extended with a trained prediction model and evaluated using historical outcomes.

---

## 4. Location Validation

The backend currently validates that latitude and longitude are valid numeric values and fall within their standard geographic ranges.

It does not currently enforce a strict Mysuru city boundary.

### Possible limitation

A user could technically provide valid coordinates outside the intended service area.

### Future improvement

A production deployment could use a Mysuru administrative boundary or geofencing service to verify whether the coordinates fall inside the supported service area.

---

## 5. Inappropriate Content Detection

The current complaint content filter uses a predefined list of blocked terms.

This provides a basic validation layer but does not understand the complete meaning or context of a sentence.

### Possible limitations

- Some inappropriate content may not be detected.
- Some legitimate text could potentially contain a blocked term.
- The system does not currently perform advanced natural-language moderation.

### Future improvement

A production system could use a more sophisticated moderation service or NLP-based classifier with appropriate safeguards.

---

## 6. Offline Synchronization

Offline complaint handling is primarily implemented on the frontend side.

The current architecture supports queuing a complaint locally and sending it to the backend after connectivity is restored.

### Possible limitations

- Browser storage can be cleared by the user.
- A device may be lost before synchronization.
- Multiple offline submissions may require additional conflict handling.
- The current prototype does not provide a distributed offline synchronization service.

### Future improvement

A production application could use more robust local storage, synchronization identifiers, retry policies, and conflict-resolution mechanisms.

---

## 7. Evidence Storage

The current backend supports evidence uploads through the application server.

### Possible limitations

For a large city deployment, storing many large files directly on the application server can increase storage and operational requirements.

### Future improvement

Object storage such as a cloud storage service could be used for large evidence files, while PostgreSQL stores the associated metadata and references.

---

## 8. Notification Scaling

The backend provides notification functionality for important complaint events.

### Possible limitation

A large deployment with many simultaneous status changes could generate a high number of notification operations.

### Future improvement

Background job queues could be introduced so notification processing does not slow down normal complaint API requests.

---

## 9. City-Scale Performance

The current project is a prototype and local development deployment.

It has not been load-tested against the full traffic of a large city.

### Possible limitations

- Large numbers of simultaneous requests may require additional infrastructure.
- Complex analytics queries may become expensive as data grows.
- Evidence storage requirements may increase significantly.
- Database queries may require additional optimization.

### Future improvement

A production deployment could use:

- Database indexing
- Query optimization
- Caching
- Background workers
- Load balancing
- Horizontal backend scaling
- Monitoring and alerting

---

## 10. Authentication and Account Management

The current system uses JWT authentication and role-based access.

### Possible limitations

A production civic platform may require additional identity and account-management features such as:

- Email verification
- Password reset
- Multi-factor authentication
- Account recovery
- Stronger session-management policies

These features can be added as the platform moves toward production deployment.

---

## 11. Current Prototype Scope

CivicTrack currently focuses on the core complaint lifecycle:

```text
Citizen Report
      │
      ▼
Validation
      │
      ▼
Complaint Storage
      │
      ▼
Assignment
      │
      ▼
Status Tracking
      │
      ▼
Evidence / Verification
      │
      ▼
Resolution

Some advanced city-level capabilities remain future improvements rather than current claims.

12. Future Roadmap

Possible future improvements include:

More advanced duplicate detection.
Data-driven risk prediction.
Mysuru-specific geofencing.
Advanced content moderation.
Stronger offline synchronization.
Cloud object storage for evidence.
Background notification processing.
Database optimization and indexing.
Production-scale monitoring.
Advanced authentication and account recovery.
13. Transparency Principle

The project intentionally documents these limitations so that the current prototype is not presented as having capabilities that have not been implemented.

The goal is to provide a clear path from the current prototype to a more robust city-scale civic platform.


