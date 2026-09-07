# Development Guide

A walkthrough of the codebase architecture and how the pieces fit together.

## Project Structure at a Glance

```
mindcare-mental-health-platform/
├── README.md                   ← Start here
├── DEVELOPMENT.md              ← You are here
├── frontend/                   # React 18 (Vite) + Tailwind
├── backend/                    # Node.js (Express) + Mongoose
└── database/                   # MongoDB schemas + seed data
```

## Backend Architecture

### Layers

#### 1. Config (`config/db.js`)
Establishes MongoDB connection. Called once on server startup.

#### 2. Models (`models/`)
Six Mongoose schemas define data shape, validation, and indexes:
- **User**: Base auth record (email unique, role-based)
- **Student**: Profile linked to User via userId
- **Counsellor**: Profile linked to User via userId
- **Availability**: Bookable slots per counsellor (compound unique: `counsellorId + date + startTime`)
- **Appointment**: Booked sessions with snapshot fields (partial unique: `counsellorId + date + time` for active statuses only)
- **Assessment**: Daily wellness scores per student (compound unique: `studentId + date`)

**Key Index: Anti-Double-Booking**
```javascript
// appointments collection
db.collection("appointments").createIndex(
  { counsellorId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["Booked", "Completed"] } },
    name: "one_active_booking_per_slot"
  }
);
```
This is the **database-level guarantee** that two concurrent requests cannot both claim the same slot.

#### 3. Middleware (`middleware/`)
- **authMiddleware**: Verifies JWT, attaches `req.user`
- **roleMiddleware**: Restricts routes to specific roles (e.g., `requireRole("student")`)
- **errorMiddleware**: Central error handler — converts Mongoose validation errors, duplicate key errors, etc. to consistent HTTP responses

#### 4. Controllers (`controllers/`)

**authController.js**: Register and login for both roles
- Validates input (email, password strength, no duplicates)
- Hashes password with bcryptjs
- Creates both User record + role-specific profile (Student or Counsellor) in one transaction
- Returns JWT token + user object

**studentController.js**: Student-facing operations
- `listCounsellors()`: Returns all counsellors sorted by name
- `getAvailability()`: Returns only future, "available" slots
- `bookAppointment()`: 
  1. Verify student exists
  2. Verify slot exists and is "available"
  3. Atomically claim slot (update status: available → booked only if it's still available)
  4. Create Appointment record with snapshot fields
  5. If creation fails, roll back slot claim
  6. Send confirmation emails
- `getAppointments()`: Fetch this student's bookings (paginated via populate)
- `cancelAppointment()`: 
  1. Verify belongs to this student
  2. Check 20-minute rule
  3. Mark as Cancelled + release slot
  4. Send cancellation notice
- `submitAssessment()`:
  1. Fetch student record
  2. Validate all 10 questions answered (1-5 each)
  3. Check no duplicate submission today
  4. Calculate score: positive Qs as-is, negative Qs inverted (6 - value)
  5. Store responses + totalScore + percentage

**counsellorController.js**: Counsellor-facing operations
- `getDashboardSummary()`: Returns stats (today's count, upcoming count, completed, cancelled, distinct students)
- `addAvailability()`: Create new slot (will fail if duplicate date/startTime)
- `listAvailability()`: Own slots
- `removeAvailability()`: Only if still "available" (not booked)
- `getAppointments()`: All bookings
- `updateAppointmentStatus()`: Mark Completed/Missed/Cancelled (and release slot if Cancelled)
- `listStudents()`: Distinct studentIds who've booked this counsellor
- `getStudentDetail()`: Profile + metadata
- `getStudentHistory()`: Appointments with this counsellor only
- `getStudentAssessments()`: Last 90 days + trend calculation

#### 5. Routes (`routes/`)
Three route files, each mounting controllers:
- `authRoutes.js`: POST /register, POST /login (both roles)
- `studentRoutes.js`: All `/api/student/*` endpoints (protected + roleMiddleware("student"))
- `counsellorRoutes.js`: All `/api/counsellor/*` endpoints (protected + roleMiddleware("counsellor"))

#### 6. Services (`services/`)
- **emailService.js**: Nodemailer wrapper. If SMTP not configured, silently no-ops.

#### 7. Utils (`utils/`)
- **generateToken.js**: Signs JWT with user id + role
- **validators.js**: Email regex, date/time format checks, datetime combiner
- **wellnessQuestions.js**: The 10-question bank + scale options (shared between backend seed and frontend form)

### Request Flow Example: Booking an Appointment

```
1. Frontend (StudentBookAppointment.jsx)
   POST /api/student/book { availabilityId, issue, details }
   
2. Backend routing
   routes/studentRoutes.js → protect → requireRole("student") → studentController.bookAppointment
   
3. Controller
   - Fetch student profile (verify exists)
   - Fetch availability slot (verify exists)
   - Verify slot.status === "available"
   - Atomically update: Availability.findOneAndUpdate({ _id, status: "available" }, { status: "booked" })
   - If update succeeded (returned slot), create Appointment
   - If update failed (returned null), reject 409 — slot was taken by another request
   - Send emails via emailService
   - Return created appointment
   
4. Frontend
   Gets 201 + appointment object
   Persists to local state, shows success banner
   Redirects to /student/appointments
```

### Database Indexes Overview

```javascript
// users
{ email: 1 } unique              // Fast login lookup

// students
{ userId: 1 } unique             // One profile per user
{ rollNumber: 1 } unique         // No duplicate enrollment

// counsellors
{ userId: 1 } unique             // One profile per user

// availability
{ counsellorId: 1, date: 1, startTime: 1 } unique
                                 // No duplicate slots

// appointments
{ counsellorId: 1, date: 1, time: 1 } unique, partial filter (status: ["Booked", "Completed"])
                                 // **The anti-double-booking rule**

// assessments
{ studentId: 1, date: 1 } unique // One check-in per day
```

---

## Frontend Architecture

### Layers

#### 1. Entry Point (`main.jsx`)
Mounts React app with Router + AuthProvider.

#### 2. Root Component (`App.jsx`)
All route definitions. Uses `<ProtectedRoute>` to guard authenticated pages.

#### 3. Context (`context/AuthContext.jsx`)
Global auth state:
- `user` — current logged-in user (id, name, email, role, profile)
- `login(token, userData)` — stores JWT in localStorage + updates state
- `logout()` — clears everything
- `isAuthenticated` — boolean flag

Every component can call `useAuth()` to access current user + auth methods.

#### 4. Services (`services/`)

**api.js**: Central Axios instance
- Automatically attaches JWT to every request (Bearer token)
- On 401 response, clears token + redirects to home (logout on expiry)

**authService.js**: `studentRegister()`, `studentLogin()`, `counsellorRegister()`, `counsellorLogin()`

**studentService.js**: Wrappers for all `/api/student/*` endpoints

**counsellorService.js**: Wrappers for all `/api/counsellor/*` endpoints

All return promises that resolve to `data` (error response body).

#### 5. Components (`components/`)

**ProtectedRoute.jsx**: Checks `useAuth()`. If not authenticated or wrong role, redirects to home. Otherwise renders children.

**Sidebar.jsx**: Persistent left nav for authenticated pages. Shows different links based on `user.role`.

**DashboardLayout.jsx**: Wrapper for all authenticated pages. Combines Sidebar + page layout.

**Navbar.jsx**: Top header on public pages (landing, login, register).

**Modal.jsx**: Reusable dialog (backdrop click closes, ✕ button closes).

**Banner.jsx**: Inline alert (error/success/info). Dismissible.

**EmptyState.jsx**: Centered message when data is absent (no appointments, no students, etc.).

**Loader.jsx**: Breathing-rhythm spinner + label.

**StatCard.jsx**: Small card showing a single metric (today's score, upcoming appointments, etc.).

**WellnessScoreChart.jsx**: Recharts line graph of wellness percentage over time.

#### 6. Pages (`pages/`)

**LandingPage.jsx**: Public homepage. Shows hero (with breathing animation), how-it-works flow, benefits for students/counsellors, footer.

**Student pages:**
- `StudentLogin.jsx` / `StudentRegister.jsx`: Auth forms
- `StudentDashboard.jsx`: Welcome, wellness card, upcoming appointments
- `Counsellors.jsx`: Grid of counsellor cards (searchable, filterable)
- `BookAppointment.jsx`: Slot picker (left) + form (right), real-time slot list refresh
- `MyAppointments.jsx`: Filterable table (upcoming/past/all), cancel button (20-min rule enforced)
- `WellnessCheckin.jsx`: Step-by-step 10-question form
- `WellnessHistory.jsx`: Stat cards + chart + table of all check-ins
- `StudentProfile.jsx`: Read-only profile details

**Counsellor pages:**
- `CounsellorLogin.jsx` / `CounsellorRegister.jsx`: Auth forms (dark-themed variant)
- `CounsellorDashboard.jsx`: Stats cards + today's schedule
- `Appointments.jsx`: Table of all bookings, filterable by status, bulk actions (mark done/missed)
- `Students.jsx`: Searchable list of students who've booked
- `StudentDetail.jsx`: Student info + wellness chart + appointment history
- `Availability.jsx`: Form to add slots + grid of open/booked slots
- `CounsellorProfile.jsx`: Read-only profile details

#### 7. Styling (`tailwind.config.js` + `index.css`)

**Design Tokens:**
- Colors: pine (primary), sage, mist (bg), sunrise (accent), dusk (secondary), ink (text)
- Typography: Fraunces (display), Karla (body), IBM Plex Mono (code)
- Shadows: soft, card
- Animations: breathe (hero), rise (page load), fade transitions

**Component Utilities:**
- `.btn-primary`, `.btn-secondary`, `.btn-ghost` — buttons
- `.card` — rounded, bordered container
- `.input-field`, `.label-field` — form styling
- `.label-field` — form labels

### Request Flow Example: Fetching Available Counsellors

```
1. Frontend (Counsellors.jsx)
   useEffect(() => {
     getCounsellors().then(setCounsellors)
   }, [])
   
2. Service layer (studentService.js)
   export const getCounsellors = () =>
     api.get("/student/counsellors").then(r => r.data)
   
3. API layer (api.js)
   - Attaches Authorization header (Bearer token from localStorage)
   - Sends GET to http://localhost:5000/api/student/counsellors
   
4. Backend routing
   routes/studentRoutes.js: GET /counsellors → protect → requireRole("student") → studentController.listCounsellors
   
5. Controller
   Counsellor.find().sort({ name: 1 })
   Returns array of counsellor objects
   
6. Frontend
   setAppointments() updates state
   Component re-renders with grid of counsellor cards
```

---

## Key Flows

### 1. Booking an Appointment

**Student perspective:**
1. Browse counsellors (list)
2. Click "View availability" on one
3. BookAppointment page loads, queries `/api/student/availability?counsellorId=X`
4. Slot list refreshes in real-time (React query polling or manual refresh)
5. Pick a slot → form appears
6. Enter issue + optional details
7. Click "Confirm appointment"
8. POST to `/api/student/book`
9. Backend: atomic slot claim + appointment creation
10. Success → redirect to My Appointments

**What prevents double-booking:**
- Backend atomic update (only succeeds if status still "available")
- Database unique index on (counsellorId, date, time, status)
- If two requests race, one succeeds, one gets 409 conflict
- Frontend detects conflict, refreshes slot list, shows error

### 2. Cancelling an Appointment

**Student perspective:**
1. My Appointments page
2. Find booked appointment
3. Check if cancel button is enabled (20 min rule)
4. Click "Cancel"
5. Modal confirms
6. PUT to `/api/student/cancel/:id`
7. Backend: verify 20-min rule, update status, release slot
8. Slot flips from "booked" → "available" (another student can book it now)
9. Success → appointment disappears from "upcoming", appears in "cancelled" filter

### 3. Submitting Wellness Check-in

**Student perspective:**
1. Dashboard or sidebar → "Wellness Check-in"
2. 10 questions appear (positive-framed + negative-framed mix)
3. Answer each on 1-5 scale
4. Submit button enabled only when all answered
5. POST to `/api/student/assessment`
6. Backend:
   - Validate 10 answers (1-5 each)
   - Check no duplicate today (unique index prevents it anyway)
   - Invert negative Qs (6 - value)
   - Sum all 10 → totalScore (0-50)
   - Calculate percentage (totalScore / 50 * 100)
   - Create Assessment record
7. Success → "Thanks for checking in" message → redirect to Wellness History

### 4. Viewing Student History (Counsellor Perspective)

**Counsellor perspective:**
1. Students page → search or browse
2. Click on a student
3. StudentDetail page loads
4. Queries:
   - `/api/counsellor/student/:id` (demographics)
   - `/api/counsellor/student/:id/history` (appointments with this counsellor)
   - `/api/counsellor/student/:id/assessments` (last 90 days wellness)
5. Shows:
   - Student info card
   - Wellness trend chart (Recharts line graph)
   - Appointment history table (date, time, issue, status)
   - Latest score card + trend badge
6. Counsellor can mark a Booked appointment as Completed/Missed via Appointments page

---

## Common Modifications

### Add a New Question to Wellness Check-in

1. Edit `backend/utils/wellnessQuestions.js` — add to `WELLNESS_QUESTIONS` array
2. Update the validation in `backend/controllers/studentController.js` (responses array length check)
3. Frontend will auto-detect the new count from `/api/student/assessment/questions`

### Change Cancellation Window

1. Edit `backend/controllers/studentController.js` → `CANCELLATION_WINDOW_MINUTES = 20` (change value)
2. Edit `frontend/src/pages/student/MyAppointments.jsx` → `CANCELLATION_WINDOW_MINUTES = 20` (same value for proactive UI)

### Add Email Notifications

1. Set SMTP credentials in `backend/.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=MindCare <noreply@mindcare.edu>
   ```
2. Restart backend — `npm run dev`
3. Emails now send automatically on booking, cancellation, etc.

### Deploy to Production

**Backend:**
1. Set `NODE_ENV=production`
2. Use production MongoDB URL (MongoDB Atlas)
3. Deploy to Railway, Render, Heroku, AWS:
   ```bash
   npm install
   npm start
   ```

**Frontend:**
1. Build static files: `npm run build`
2. Deploy `dist/` to Vercel, Netlify, or S3
3. Set `VITE_API_URL` to production backend URL

---

## Testing Checklist

- [ ] Student can register + login
- [ ] Counsellor can register + login
- [ ] Student can browse counsellors
- [ ] Student can book a slot (real-time availability shows correctly)
- [ ] Two students cannot book the same slot (race condition test)
- [ ] Student can cancel within 20 minutes
- [ ] Student cannot cancel after 20 minutes
- [ ] Student can submit daily wellness check-in (once per day)
- [ ] Wellness chart updates after new check-in
- [ ] Counsellor can create availability
- [ ] Counsellor can see booked appointments
- [ ] Counsellor can mark appointment Completed/Missed
- [ ] Counsellor can view student history + wellness trend
- [ ] JWT expiry triggers logout + redirect
- [ ] Rate limiting on login endpoint (max 20 attempts per 15 min)
- [ ] Email notifications send (if configured)

---

## Debugging Tips

### Backend

**MongoDB connection issues:**
```bash
# Test connection string
mongosh "mongodb://127.0.0.1:27017/mindcare"
```

**Mongoose validation errors:**
Check browser console + backend terminal for the specific field that failed validation.

**JWT errors:**
Ensure `JWT_SECRET` in `.env` is set and consistent.

### Frontend

**API calls failing:**
Check Network tab in DevTools → inspect request/response. Is the JWT attached? Is the backend running?

**State not updating:**
Ensure you're calling the service function (returns a promise) and updating state in `.then()`.

**Styling broken:**
Clear browser cache. Ensure Tailwind is building: check for `dist/` folder after `npm run build`.

---

**That's the gist! Happy developing.** 🎉
