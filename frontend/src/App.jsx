import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Student pages
import StudentLogin from "./pages/student/StudentLogin.jsx";
import StudentRegister from "./pages/student/StudentRegister.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import Counsellors from "./pages/student/Counsellors.jsx";
import BookAppointment from "./pages/student/BookAppointment.jsx";
import MyAppointments from "./pages/student/MyAppointments.jsx";
import WellnessCheckin from "./pages/student/WellnessCheckin.jsx";
import WellnessHistory from "./pages/student/WellnessHistory.jsx";
import QAWellnessInfo from "./pages/student/QAWellnessInfo.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";

// Counsellor pages
import CounsellorLogin from "./pages/counsellor/CounsellorLogin.jsx";
import CounsellorRegister from "./pages/counsellor/CounsellorRegister.jsx";
import CounsellorDashboard from "./pages/counsellor/CounsellorDashboard.jsx";
import Appointments from "./pages/counsellor/Appointments.jsx";
import Students from "./pages/counsellor/Students.jsx";
import StudentDetail from "./pages/counsellor/StudentDetail.jsx";
import Availability from "./pages/counsellor/Availability.jsx";
import CounsellorProfile from "./pages/counsellor/CounsellorProfile.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Student auth */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />

      {/* Student app (protected) */}
      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/counsellors" element={<ProtectedRoute role="student"><Counsellors /></ProtectedRoute>} />
      <Route path="/student/book-appointment" element={<ProtectedRoute role="student"><BookAppointment /></ProtectedRoute>} />
      <Route path="/student/appointments" element={<ProtectedRoute role="student"><MyAppointments /></ProtectedRoute>} />
      <Route path="/student/wellness-checkin" element={<ProtectedRoute role="student"><WellnessCheckin /></ProtectedRoute>} />
      <Route path="/student/wellness-history" element={<ProtectedRoute role="student"><WellnessHistory /></ProtectedRoute>} />
      <Route path="/student/qa-wellness-info" element={<ProtectedRoute role="student"><QAWellnessInfo /></ProtectedRoute>} />
      <Route path="/student/qa-assistant" element={<ProtectedRoute role="student"><QAWellnessInfo /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

      {/* Counsellor auth */}
      <Route path="/counsellor/login" element={<CounsellorLogin />} />
      <Route path="/counsellor/register" element={<CounsellorRegister />} />

      {/* Counsellor app (protected) */}
      <Route path="/counsellor/dashboard" element={<ProtectedRoute role="counsellor"><CounsellorDashboard /></ProtectedRoute>} />
      <Route path="/counsellor/appointments" element={<ProtectedRoute role="counsellor"><Appointments /></ProtectedRoute>} />
      <Route path="/counsellor/students" element={<ProtectedRoute role="counsellor"><Students /></ProtectedRoute>} />
      <Route path="/counsellor/students/:id" element={<ProtectedRoute role="counsellor"><StudentDetail /></ProtectedRoute>} />
      <Route path="/counsellor/availability" element={<ProtectedRoute role="counsellor"><Availability /></ProtectedRoute>} />
      <Route path="/counsellor/profile" element={<ProtectedRoute role="counsellor"><CounsellorProfile /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
