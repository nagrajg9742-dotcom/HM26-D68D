# CivicTrack — Decision Log

This document records the important technical and product decisions made while developing CivicTrack.

---

## Decision #1 — Database Selection

**Date:** 20-09-2026

**Area:** Database

### Problem / Context

We needed a database to store users, complaints, assignments and status history.

### Options Considered

1. PostgreSQL
2. MySQL
3. MongoDB

### Decision

Use PostgreSQL.

### Reason

Our project contains structured and related data.

### Status

Implemented

---

## Decision #2 — Backend Technology

**Date:** 20-09-2026

**Area:** Backend

### Problem / Context

We needed a backend technology to build REST APIs and handle authentication, complaints, assignments and other server-side operations.

### Options Considered

1. Node.js with Express.js
2. Python with Flask
3. Java with Spring Boot

### Decision

Use Node.js with Express.js.

### Reason

Express.js provides a simple REST API structure and is suitable for rapid development during the hackathon.

### Status

Implemented

---

## Decision #3 — Complaint Validation

**Date:** 20-09-2026

**Area:** Backend

### Problem / Context

Invalid or inappropriate complaint information could enter the system if there were no validation checks.

### Options Considered

1. Validate complaints before storing them
2. Store complaints first and validate later

### Decision

Validate complaint information before storing it.

### Reason

This helps prevent invalid locations, missing information, inappropriate text and possible duplicate complaints from entering the system.

### Status

Implemented

---

## Decision #4 — Duplicate Complaint Detection

**Date:** 20-09-2026

**Area:** Backend

### Problem / Context

Multiple citizens may report the same civic issue within a short period.

### Options Considered

1. Allow every complaint without checking
2. Detect possible duplicate complaints
3. Automatically delete duplicate complaints

### Decision

Detect and flag possible duplicate complaints.

### Reason

This helps reduce repeated reports while keeping the original complaint available for tracking.

### Trade-offs

A similar but different complaint may sometimes be identified as a possible duplicate.

### Status

Implemented

---

## Decision #5 — Risk Scoring

**Date:** 20-09-2026

**Area:** Backend / AI

### Problem / Context

Some complaints may remain inactive or unresolved for too long and could be forgotten.

### Options Considered

1. Manual monitoring
2. Rule-based risk scoring
3. Machine-learning model

### Decision

Use a rule-based risk scoring system.

### Reason

A rule-based approach is easier to explain, test and demonstrate during the hackathon.

### Trade-offs

The system is more explainable, but it is less flexible than a trained machine-learning model.

### Status

Implemented

---

## Decision #6 — Complaint Status History

**Date:** 20-09-2026

**Area:** Backend / Database

### Problem / Context

Citizens and officers need to know how a complaint progresses from reporting to resolution.

### Options Considered

1. Store only the current complaint status
2. Store every status change in a history

### Decision

Store complaint status history.

### Reason

It provides a clear record of the complaint's journey and improves traceability.

### Status

Implemented

---

## Decision #7 — Authentication and Role-Based Access

**Date:** 20-09-2026

**Area:** Security / Backend

### Problem / Context

Citizens, officers and administrators need different permissions.

### Options Considered

1. Same permissions for all users
2. Authentication with role-based access

### Decision

Use JWT authentication and role-based access control.

### Reason

Different user roles should only be allowed to perform actions appropriate to their role.

### Status

Implemented

---

## Decision #8 — Evidence and Notifications

**Date:** 20-09-2026

**Area:** Backend

### Problem / Context

Officers may need supporting evidence when handling complaints, and users need updates about complaint activity.

### Options Considered

1. Handle complaints without evidence or notifications
2. Support evidence uploads and notifications

### Decision

Support evidence uploads and notifications.

### Reason

These features improve complaint verification, communication and follo
