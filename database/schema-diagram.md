# MindCare — Data Model

Six collections, all connected back to a single `users` collection that
handles authentication for both roles.

```text
                              ┌───────────────┐
                              │     users      │
                              │───────────────│
                              │ _id            │
                              │ name           │
                              │ email (unique) │
                              │ password (hash)│
                              │ role           │  "student" | "counsellor"
                              │ createdAt      │
                              └───────┬────────┘
                     ┌────────────────┴─────────────────┐
                     │                                    │
             ┌───────▼────────┐                 ┌─────────▼─────────┐
             │    students     │                 │    counsellors     │
             │────────────────│                 │───────────────────│
             │ _id             │                 │ _id                │
             │ userId (FK)     │                 │ userId (FK)        │
             │ name            │                 │ name               │
             │ email           │                 │ email              │
             │ rollNumber (uq) │                 │ qualification      │
             │ department      │                 │ specialization     │
             │ year            │                 │ experience         │
             │ phone           │                 │ phone              │
             └───────┬─────────┘                 └─────────┬──────────┘
                     │                                       │
                     │                              ┌────────▼─────────┐
                     │                              │   availability    │
                     │                              │───────────────────│
                     │                              │ _id                │
                     │                              │ counsellorId (FK)  │
                     │                              │ date, startTime,   │
                     │                              │ endTime            │
                     │                              │ status: available/ │
                     │                              │         booked     │
                     │                              └────────┬──────────┘
                     │                                       │
                     │              ┌────────────────────────▼──────────┐
                     └─────────────►│           appointments             │
                                    │────────────────────────────────────│
                                    │ _id                                 │
                                    │ studentId (FK)                      │
                                    │ counsellorId (FK)                   │
                                    │ availabilityId (FK)                 │
                                    │ studentName / department / rollNo   │  (snapshot)
                                    │ date, time                          │
                                    │ issue, details                      │
                                    │ status: Booked/Completed/           │
                                    │         Cancelled/Missed            │
                                    │ cancelledAt, cancellationReason     │
                                    └─────────────────────────────────────┘

             ┌──────────────────────┐
             │      assessments       │◄── studentId (FK) ── students
             │────────────────────────│
             │ _id                     │
             │ studentId               │
             │ date (1 per day, unique with studentId)
             │ responses[10]  (1-5 each)
             │ totalScore  (0-50)
             │ percentage  (0-100)
             └─────────────────────────┘
```

## Relationship summary

- One `user` → exactly one `student` **or** one `counsellor` profile (never both).
- One `counsellor` → many `availability` slots.
- One `availability` slot → at most one *active* `appointment` (enforced by a
  unique index, see `createIndexes.js`).
- One `student` → many `appointments` and many `assessments` (at most one
  assessment per calendar day).
- A counsellor reaches a student's full history only through the
  `appointments` and `assessments` collections filtered by `studentId` —
  there is no direct counsellor ↔ student link, which keeps the model
  simple and avoids duplicating relationship state.
