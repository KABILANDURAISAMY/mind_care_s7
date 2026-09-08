import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatCard from "../../components/StatCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getProfile,
  getDashboardSummary,
  getAppointments,
  getCounsellorFeedbacks,
  getCounsellorNotifications,
  dismissCounsellorNotification,
} from "../../services/counsellorService.js";
import ChatModule from "../../components/ChatModule.jsx";
import { useSocket } from "../../context/SocketContext.jsx";

const CounsellorDashboard = () => {
  const { user, updateUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | chat
  const { globalUnreadCount } = useSocket();

  const loadNotifications = () => {
    getCounsellorNotifications().then(setNotifications).catch(() => setNotifications([]));
  };

  useEffect(() => {
    getProfile().then(updateUser).catch(() => {});
    getDashboardSummary().then(setSummary).catch(() => setSummary({}));
    getAppointments().then(setAppointments).catch(() => setAppointments([]));
    getCounsellorFeedbacks().then(setFeedbackData).catch(() => setFeedbackData({ feedbacks: [], totalFeedbacks: 0, averageRating: 0, ratingCounts: {} }));
    loadNotifications();
  }, []);

  const handleDismissNotification = async (id) => {
    setNotifications((prev) => (prev || []).filter((n) => n._id !== id));
    try {
      await dismissCounsellorNotification(id);
    } catch (err) {
      console.error("Could not dismiss notification", err);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todaysBookings = (appointments || []).filter((a) => a.date === today && a.status === "Booked");

  const profile = user?.profile || {};
  const rawName = profile.name || user?.name || "Counsellor";
  const title = profile.title ? `${profile.title} ` : "";
  const counsellorName = `${title}${rawName}`;

  return (
    <DashboardLayout title={`Welcome, ${counsellorName}`} subtitle={user?.profile?.specialization}>
      {summary === null ? (
        <Loader label="Loading your dashboard" />
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b pb-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`font-semibold px-4 py-2 ${activeTab === "dashboard" ? "border-b-2 border-pine text-pine" : "text-gray-500"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`font-semibold px-4 py-2 flex items-center gap-2 ${activeTab === "chat" ? "border-b-2 border-pine text-pine" : "text-gray-500"}`}
            >
              Chat
              {globalUnreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{globalUnreadCount}</span>
              )}
            </button>
          </div>

          {activeTab === "chat" && <ChatModule />}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Critical Check-In Alerts (< 20 Score) */}
          {notifications.length > 0 && (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n._id} className="rounded-2xl border border-red-300 bg-red-50 p-5 shadow-soft">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl text-red-700">
                      🚨
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-semibold text-red-900">
                          Critical Student Wellness Alert (Check-In Score &lt; 20)
                        </h3>
                        <button
                          onClick={() => handleDismissNotification(n._id)}
                          className="font-body text-xs font-semibold text-red-800 hover:text-red-900 hover:underline bg-red-100 px-3 py-1 rounded-lg"
                        >
                          Got it / Dismiss
                        </button>
                      </div>
                      <p className="mt-1 font-body text-sm text-red-800">
                        {n.message}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        {n.studentId?._id && (
                          <Link
                            to={`/counsellor/student/${n.studentId._id}`}
                            className="btn-primary !py-1.5 !px-3 text-xs !bg-red-800 hover:!bg-red-900"
                          >
                            👤 View Student Profile
                          </Link>
                        )}
                        <span className="font-body text-xs text-red-700 font-medium">
                          Immediate counsellor follow-up recommended.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Today's appointments" value={summary.todayAppointments ?? 0} accent="sunrise" />
            <StatCard label="Upcoming" value={summary.upcomingAppointments ?? 0} accent="pine" />
            <StatCard label="Completed" value={summary.completedSessions ?? 0} accent="sage" />
            <StatCard label="Cancelled" value={summary.cancelledSessions ?? 0} accent="dusk" />
            <StatCard label="Total students" value={summary.totalStudents ?? 0} accent="pine" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Schedule */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-pine">Today's schedule</h2>
                <Link to="/counsellor/appointments" className="font-body text-sm font-semibold text-dusk-dark">View all →</Link>
              </div>

              {todaysBookings.length === 0 ? (
                <EmptyState title="Nothing scheduled today" description="Enjoy the breathing room, or open up more availability." />
              ) : (
                <div className="space-y-3">
                  {todaysBookings.map((a) => (
                    <div key={a._id} className="flex items-center justify-between rounded-xl border border-pine/10 bg-mist px-4 py-3">
                      <div>
                        <p className="font-body text-sm font-semibold text-pine">{a.studentName}</p>
                        <p className="font-body text-xs text-ink/60">{a.department} · {a.rollNumber} · {a.issue}</p>
                      </div>
                      <span className="rounded-full bg-sunrise/20 px-3 py-1 font-body text-xs font-semibold text-sunrise-dark">
                        {a.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Feedback & Ratings Analysis */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-pine">Student Feedback & Ratings</h2>
                <span className="rounded-full bg-sunrise/20 px-3 py-1 font-body text-xs font-semibold text-sunrise-dark">
                  ⭐ {feedbackData?.averageRating || "0.0"} / 5.0 ({feedbackData?.totalFeedbacks || 0} reviews)
                </span>
              </div>

              {!feedbackData || feedbackData.feedbacks.length === 0 ? (
                <EmptyState title="No student feedback yet" description="Feedback forms will automatically appear after completed sessions." />
              ) : (
                <div className="space-y-4">
                  {/* Rating Breakdown */}
                  <div className="rounded-xl bg-mist p-3 space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = feedbackData.ratingCounts?.[stars] || 0;
                      const percentage = feedbackData.totalFeedbacks ? Math.round((count / feedbackData.totalFeedbacks) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2 font-body text-xs text-ink/70">
                          <span className="w-12">{stars} ★</span>
                          <div className="h-2 flex-1 rounded-full bg-pine/10 overflow-hidden">
                            <div className="h-full bg-sunrise rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="w-8 text-right font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recent Comments */}
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {feedbackData.feedbacks.map((fb) => (
                      <div key={fb._id} className="rounded-xl border border-pine/10 bg-white p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-xs font-semibold text-pine">
                            {fb.studentId?.name || "Student"} ({fb.studentId?.department || ""})
                          </span>
                          <span className="font-body text-xs text-sunrise font-bold">
                            {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                          </span>
                        </div>
                        {fb.comment ? (
                          <p className="font-body text-xs text-ink/80 italic">"{fb.comment}"</p>
                        ) : (
                          <p className="font-body text-xs text-ink/40 italic">No written comment provided.</p>
                        )}
                        <p className="font-body text-[10px] text-ink/40">
                          Session date: {fb.appointmentId?.date || "Completed session"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    )}
    </DashboardLayout>
  );
};

export default CounsellorDashboard;
