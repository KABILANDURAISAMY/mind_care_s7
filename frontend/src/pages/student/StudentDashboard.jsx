import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import FeedbackModal from "../../components/FeedbackModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAppointments, getAssessmentHistory, getPendingFeedback } from "../../services/studentService.js";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(null);
  const [wellness, setWellness] = useState(null);
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const loadData = () => {
    Promise.all([getAppointments(), getAssessmentHistory(), getPendingFeedback()])
      .then(([appts, wellnessData, pending]) => {
        setAppointments(appts);
        setWellness(wellnessData);
        setPendingFeedback(pending);
        if (pending && pending.length > 0) {
          setShowFeedbackModal(true);
        }
      })
      .catch(() => {
        setAppointments([]);
        setWellness({ todayScore: null, weeklyAverage: null, trend: "Not enough data" });
        setPendingFeedback([]);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const upcoming = (appointments || []).filter((a) => a.status === "Booked").slice(0, 3);
  const counsellorCancelled = (appointments || []).filter(
    (a) => a.status === "Cancelled" && a.cancelledBy === "counsellor"
  );

  return (
    <DashboardLayout title={`Welcome, ${user?.name?.split(" ")[0] || "Student"}`} subtitle={`${user?.profile?.department || ""} · Roll No. ${user?.profile?.rollNumber || ""}`}>
      {/* Feedback Modal */}
      {showFeedbackModal && pendingFeedback.length > 0 && (
        <FeedbackModal
          appointment={pendingFeedback[0]}
          onClose={() => setShowFeedbackModal(false)}
          onSubmitSuccess={() => {
            loadData();
          }}
        />
      )}

      {appointments === null ? (
        <Loader label="Loading your dashboard" />
      ) : (
        <div className="space-y-6">
          {/* Apology & Alternate Booking Banner for Counsellor Cancellations */}
          {counsellorCancelled.length > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl text-amber-800">
                  😔
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-amber-900">
                    We are deeply sorry! An appointment was cancelled by your counsellor.
                  </h3>
                  <div className="mt-2 space-y-2">
                    {counsellorCancelled.slice(0, 2).map((cAppt) => (
                      <p key={cAppt._id} className="font-body text-sm text-amber-800">
                        • Session on <strong>{cAppt.date}</strong> at <strong>{cAppt.time}</strong> with{" "}
                        <strong>{cAppt.counsellorId?.name || "Counsellor"}</strong> was cancelled. Note:{" "}
                        <em className="italic">"{cAppt.cancellationReason || "Scheduling conflict"}"</em>
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link to="/student/counsellors" className="btn-primary !py-2 !px-4 text-sm !bg-amber-800 hover:!bg-amber-900">
                      📅 Book Alternate Session Now
                    </Link>
                    <span className="font-body text-xs text-amber-700">
                      Alternate slots are open for booking right now.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Wellness summary */}
            <div className="card lg:col-span-1">
              <p className="font-body text-sm text-ink/60">Today's wellness score</p>
              <p className="mt-1 font-display text-5xl font-semibold text-sunrise-dark">
                {wellness?.todayScore ?? "—"}
                <span className="ml-1 font-body text-lg text-ink/40">/100</span>
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-body text-ink/60">Weekly average</span>
                <span className="font-body font-semibold text-pine">{wellness?.weeklyAverage ?? "—"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="font-body text-ink/60">Trend</span>
                <span className="font-body font-semibold text-sage-dark">{wellness?.trend ?? "—"}</span>
              </div>
              {wellness?.todayScore == null && (
                <Link to="/student/wellness-checkin" className="btn-primary mt-5 w-full !py-2.5 text-sm">
                  Do today's check-in
                </Link>
              )}
            </div>

            {/* Upcoming appointments */}
            <div className="card lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-pine">Upcoming appointments</h2>
                <Link to="/student/appointments" className="font-body text-sm font-semibold text-dusk-dark">View all →</Link>
              </div>

              {upcoming.length === 0 ? (
                <EmptyState
                  title="Nothing booked yet"
                  description="Browse counsellors and pick a slot that works for you."
                  action={<Link to="/student/counsellors" className="btn-secondary !py-2 !px-4 text-sm">Find a counsellor</Link>}
                />
              ) : (
                <div className="space-y-3">
                  {upcoming.map((a) => (
                    <div key={a._id} className="flex items-center justify-between rounded-xl border border-pine/10 bg-mist px-4 py-3">
                      <div>
                        <p className="font-body text-sm font-semibold text-pine">{a.counsellorId?.name || "Counsellor"}</p>
                        <p className="font-body text-xs text-ink/60">{a.date} at {a.time} · {a.issue}</p>
                      </div>
                      <span className="rounded-full bg-sage-light/40 px-3 py-1 font-body text-xs font-semibold text-sage-dark">
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
