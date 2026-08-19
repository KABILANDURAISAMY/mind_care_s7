# MindCare Database

This app uses **MongoDB** with **Mongoose** as the ODM. There is no separate
database server code to run — the schemas live in `backend/models/` since
Mongoose schemas are the single source of truth for both validation and
structure. This folder holds everything else that's specifically
*about the data*: how it's shaped, how to seed it, and how to index it.

## Contents

| File                 | Purpose                                                          |
|-----------------------|-------------------------------------------------------------------|
| `schema-diagram.md`   | Entity-relationship overview of all 6 collections                |
| `createIndexes.js`    | Explicitly (re)builds all indexes, including the two that enforce the app's core business rules |
| `seed.js`             | Populates a fresh database with demo counsellors, students, availability, and one sample appointment so the app is immediately explorable |

## Setup

1. Install MongoDB locally, or create a free cluster on MongoDB Atlas.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`.
3. From the `backend/` folder, run:

   ```bash
   npm install
   npm run seed      # populates demo data (safe to re-run; it clears first)
   npm run dev        # starts the API on http://localhost:5000
   ```

## Why two uniqueness rules matter most

The entire "no double-booking" guarantee (spec sections 10, 28, 29, 30) is
enforced at the database layer, not just in application code, via two
compound unique indexes:

* **`availability`**: `{ counsellorId, date, startTime }` — a counsellor can
  never have two identical slots on the same day.
* **`appointments`**: `{ counsellorId, date, time }`, unique only among
  documents with `status` in `["Booked", "Completed"]` — a counsellor's
  slot can only ever have one *active* appointment against it. Because the
  filter excludes `Cancelled`/`Missed`, the slot becomes bookable again the
  instant a booking is cancelled, while the historical record is preserved
  for audit purposes.

See `createIndexes.js` for the exact index definitions and
`schema-diagram.md` for how all six collections relate to each other.
