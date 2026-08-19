# MindCare — Student Mental Wellness & Counselling Platform

A full-stack web application for university students and counsellors to schedule confidential appointments and track daily wellness through a self-report check-in system.

## 📋 Overview

**MindCare** bridges the gap between students and campus mental health services. Students can:
- Browse available counsellors and book real-time appointment slots
- Cancel up to 20 minutes before their session
- Complete a 10-question daily wellness self-check
- Watch their wellness trend over time (private to them and their counsellor)

Counsellors can:
- Set their own availability in minutes
- See student context (reason, history, wellness trend) before each session
- Mark appointments as completed or missed
- View aggregated wellness trends across their students

## 🏗️ Architecture

```
mindcare-mental-health-platform/
├── frontend/           # React 18 + Vite + Tailwind (port 5173)
├── backend/            # Express.js + Mongoose (port 5000)
└── database/           # MongoDB setup + seeding
```

### Design Philosophy

- **No double-booking**: Enforced at the database level via unique compound indexes
- **Real-time availability**: Only genuinely open slots are shown; booked slots disappear instantly
- **Privacy**: Wellness data is self-reported, private, and never shared beyond a student's own counsellor
- **Role-based access**: Students see only their own data; counsellors see only their bookings and students

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Setup

#### 1. Clone / Extract

```bash
cd mindcare-mental-health-platform
```

#### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI to your MongoDB connection string
npm install
npm run seed    # Populate demo data (safe to re-run)
npm run dev     # Starts on http://localhost:5000
```

**Demo credentials** (after seeding):
- **Student**: `arun.kumar@college.edu` / `Passw0rd!`
- **Counsellor**: `dr.priya@college.edu` / `Passw0rd!`

#### 3. Frontend

```bash
cd ../frontend
cp .env.example .env
# .env should point to your backend: VITE_API_URL=http://localhost:5000/api
npm install
npm run dev     # Starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 📁 Folder Structure

### Frontend

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx          # Public homepage
│   │   ├── student/
│   │   │   ├── StudentLogin/Register
│   │   │   ├── StudentDashboard
│   │   │   ├── Counsellors.jsx      # Browse & filter counsellors
│   │   │   ├── BookAppointment.jsx  # Slot picker + form
│   │   │   ├── MyAppointments.jsx   # View & cancel (20-min rule)
│   │   │   ├── WellnessCheckin.jsx  # 10-question daily form
│   │   │   ├── WellnessHistory.jsx  # Trend chart + log
│   │   │   └── StudentProfile.jsx
│   │   └── counsellor/
│   │       ├── CounsellorLogin/Register
│   │       ├── CounsellorDashboard  # Stats + today's schedule
│   │       ├── Appointments.jsx     # Manage status (Completed/Missed)
│   │       ├── Students.jsx         # List of students (searchable)
│   │       ├── StudentDetail.jsx    # Wellness trend + history
│   │       ├── Availability.jsx     # Add/remove slots
│   │       └── CounsellorProfile.jsx
│   ├── components/
│   │   ├── ProtectedRoute.jsx       # Role-based route guard
│   │   ├── Sidebar.jsx              # Authenticated nav
│   │   ├── DashboardLayout.jsx      # Shared page wrapper
│   │   ├── WellnessScoreChart.jsx   # Recharts line graph
│   │   ├── Loader.jsx, Banner.jsx, Modal.jsx, EmptyState.jsx, StatCard.jsx
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx          # JWT + user state
│   ├── services/
│   │   ├── api.js                   # Axios instance + interceptors
│   │   ├── authService.js
│   │   ├── studentService.js
│   │   └── counsellorService.js
│   ├── App.jsx                      # Route definitions
│   └── main.jsx, index.css
├── index.html
├── vite.config.js
├── tailwind.config.js               # Design tokens (pine, sage, sunrise, etc.)
├── postcss.config.js
└── package.json
```

### Backend

```
backend/
├── server.js                        # Express entry point
├── config/
│   └── db.js                        # MongoDB connection
├── models/
│   ├── User.js                      # Auth base (email, role)
│   ├── Student.js                   # Student profile
│   ├── Counsellor.js                # Counsellor profile
│   ├── Availability.js              # Bookable slots
│   ├── Appointment.js               # Booked sessions (with snapshot fields)
│   └── Assessment.js                # Daily wellness scores
├── middleware/
│   ├── authMiddleware.js            # JWT verify
│   ├── roleMiddleware.js            # Role-based access
│   └── errorMiddleware.js           # Central error handler
├── controllers/
│   ├── authController.js            # Register/login (both roles)
│   ├── studentController.js         # Counsellor listing, booking, wellness
│   └── counsellorController.js      # Dashboard, availability, student history
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   └── counsellorRoutes.js
├── services/
│   └── emailService.js              # Nodemailer (optional, no-op if not configured)
├── utils/
│   ├── generateToken.js
│   ├── validators.js
│   └── wellnessQuestions.js         # The 10-question bank
├── package.json
├── .env.example
└── .gitignore
```

### Database

```
database/
├── README.md                        # Setup & index explanation
├── schema-diagram.md                # ER diagram + relationship guide
├── createIndexes.js                 # Rebuild the two critical uniqueness rules
└── seed.js                          # Demo data generator
```

---

## 🔐 Authentication & Authorization

- **JWT tokens** stored in `localStorage`, attached to every API request via Bearer token
- **Role-based access** enforced at both frontend (route guards) and backend (middleware)
- **Password hashing** with bcryptjs (SALT_ROUNDS=10)
- **Automatic logout** on token expiry (401 response triggers redirect to home)

## 🎯 Core Business Rules

### No Double-Booking (Spec Sections 10, 28–30)

Two database-level unique indexes prevent the same counsellor from having two active appointments at the same date/time:

1. **Availability**: `{ counsellorId, date, startTime }` — can't create two identical slots
2. **Appointments**: `{ counsellorId, date, time }` with a partial filter for `status: ["Booked", "Completed"]` — only one active booking per slot

When a student books:
1. Frontend reserves the UI slot with an optimistic update
2. Backend atomically claims the slot by checking `status = available` before updating to `booked`
3. Appointment creation then fails if two simultaneous requests raced — the loser's UI detects the conflict and refreshes the list

### Cancellation Window (Spec Section 13)

Students can cancel **only if there's at least 20 minutes** before the appointment start time. This is validated:
- **Frontend**: disables the cancel button proactively (UX feedback)
- **Backend**: re-validates independently (true source of truth)
- **Slot release**: The `availability` slot flips back to `available` so another student can book it

### Wellness Scoring (Spec Sections 21–27)

- **10 questions** answered on a 1–5 scale each session
- **Positive-framed questions** (sleep, energy, motivation): raw answer value
- **Negative-framed questions** (anger, stress, loneliness): inverted (6 - raw value) so high frequency still lowers score
- **Total score**: sum of all 10 adjusted answers (0–50 range)
- **Percentage**: `(totalScore / 50) × 100` (0–100%)
- **One per day**: enforced with `{ studentId, date }` unique index; re-submitting same day fails gracefully
- **Trend detection**: "Improving" if last score > previous by >3%, "Declining" if <-3%, else "Stable"
- **Privacy**: accessible only to the student themselves + their own counsellor (via student history views)

---

## 🎨 Design System

Built with **Tailwind CSS** and a custom color palette inspired by campus life at dusk:

| Token      | Color      | Use                              |
|------------|------------|----------------------------------|
| `pine`     | `#1F3D3B`  | Headers, dark surfaces, primary  |
| `sage`     | `#7FA895`  | Calm secondary accent            |
| `mist`     | `#F2F4EF`  | Warm-cool off-white background  |
| `sunrise`  | `#D9A441`  | CTA buttons, active states       |
| `dusk`     | `#6E8FA3`  | Links, info badges               |
| `ink`      | `#1B2620`  | Body text                        |

**Typography:**
- Display: Fraunces (serif) — headings
- Body: Karla (sans-serif) — copy
- Mono: IBM Plex Mono — code

**Signature animations:**
- Breathing rhythm on hero (dual concentric circles)
- Fade-in on page loads
- Smooth transitions on interactive elements

---

## 📡 API Overview

All endpoints require a Bearer token except `/api/auth/*` and `/api/health`.

### Auth

- `POST /api/auth/student/register`
- `POST /api/auth/student/login`
- `POST /api/auth/counsellor/register`
- `POST /api/auth/counsellor/login`

### Student

- `GET /api/student/profile`
- `GET /api/student/counsellors` — all counsellors
- `GET /api/student/availability?counsellorId=&date=` — only "available" status, future slots only
- `POST /api/student/book` — atomic slot reservation + appointment creation
- `GET /api/student/appointments` — this student's bookings
- `PUT /api/student/cancel/:id` — 20-minute rule enforced
- `GET /api/student/assessment/questions` — the 10-question bank
- `POST /api/student/assessment` — submit daily responses
- `GET /api/student/assessment-history` — last 90 days, trend, weekly average

### Counsellor

- `GET /api/counsellor/profile`
- `GET /api/counsellor/dashboard` — summary stats (today's, upcoming, completed, cancelled, total students)
- `POST /api/counsellor/availability` — create a slot
- `GET /api/counsellor/availability` — list own slots
- `DELETE /api/counsellor/availability/:id` — remove unused slot
- `GET /api/counsellor/appointments` — all bookings (any status)
- `PUT /api/counsellor/appointments/:id/status` — mark Completed/Missed/Cancelled
- `GET /api/counsellor/students` — list of distinct students with bookings
- `GET /api/counsellor/student/:id` — profile + metadata
- `GET /api/counsellor/student/:id/history` — appointment history
- `GET /api/counsellor/student/:id/assessments` — wellness trend + 90-day log

---

## 📧 Email Notifications

Integrated with **Nodemailer** (optional). If SMTP credentials are not configured in `.env`, the app silently no-ops on email sends — all core features (booking, cancellation, etc.) continue working in local development.

**When configured**, notifications are sent for:
- Appointment confirmed (to student)
- New booking alert (to counsellor)
- Cancellation notice (to cancelling party's counterpart)

---

## 🧪 Testing the App

### As a Student

1. Register at `http://localhost:5173/student/register` or use demo: `arun.kumar@college.edu` / `Passw0rd!`
2. Dashboard → view stats + upcoming appointments
3. Counsellors → browse by specialization
4. Book Appointment → pick a slot and reason
5. My Appointments → cancel (if within 20 minutes)
6. Wellness Check-in → answer 10 questions
7. Wellness History → see your trend chart

### As a Counsellor

1. Register at `http://localhost:5173/counsellor/register` or use demo: `dr.priya@college.edu` / `Passw0rd!`
2. Dashboard → view stats + today's schedule
3. Availability → add new time slots
4. Appointments → mark sessions as Completed/Missed
5. Students → search and view any student who's booked with you
6. Student Detail → see their wellness history + appointment log

---

## 🔧 Deployment

### Backend (Node/Express)

1. Set `NODE_ENV=production` in `.env`
2. Configure production `MONGO_URI` (e.g., MongoDB Atlas)
3. Deploy to Heroku, Railway, Render, AWS, etc.:
   ```bash
   npm run build
   npm start
   ```

### Frontend (React/Vite)

1. Build static files:
   ```bash
   npm run build
   ```
2. Deploy `dist/` folder to Vercel, Netlify, AWS S3, etc.
3. Update `VITE_API_URL` to point to production backend

### Database

Use **MongoDB Atlas** (free tier: 512 MB storage) or self-hosted MongoDB.

---

## 📝 Key Implementation Notes

- **Atomic operations**: Availability slot state + Appointment creation wrapped in try-catch with rollback
- **Real-time feedback**: Booked slots vanish instantly; no lag or double-booking edge cases
- **Graceful degradation**: Email service optional; wellness assessment validation catches all malformed inputs
- **Accessibility**: Keyboard focus indicators, ARIA labels, reduced-motion media query
- **Security**: Passwords bcrypt-hashed, JWTs server-signed, role checks on every protected endpoint
- **Code organization**: Separation of concerns (models, controllers, services, middleware, utils)

---

## 🎓 Educational Value

This codebase demonstrates:

✅ Full-stack authentication (JWT + roles)
✅ Complex business logic (double-booking prevention, cancellation rules, wellness scoring)
✅ Real-time constraints (availability + appointment uniqueness at DB level)
✅ Modern React patterns (hooks, context, service layers, protected routes)
✅ Responsive, accessible UI (Tailwind + semantic HTML + animations)
✅ Professional git workflow (meaningful commit messages, .gitignore, environment separation)
✅ Database design (compound indexes, partial filters, denormalization for audit trails)
✅ API design (REST conventions, consistent error handling, middleware pipeline)

---

## 📄 License

This is a demonstration project. Use freely for learning and educational purposes.

---

## 🙋 Support

For questions or issues:
1. Check the database `README.md` for setup help
2. Verify `.env` files are configured correctly
3. Review console logs (frontend browser devtools, backend terminal)
4. Ensure MongoDB is running and accessible

**Happy coding!** 🎉
