import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAppointments, getAssessmentHistory } from "../../services/studentService.js";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(null);
  const [wellness, setWellness] = useState(null);

  useEffect(() => {
    Promise.all([getAppointments(), getAssessmentHistory()])
      .then(([appts, wellnessData]) => {
        setAppointments(appts);
        setWellness(wellnessData);
      })
      .catch(() => {
        setAppointments([]);
        setWellness({ todayScore: null, weeklyAverage: null, trend: "Not enough data" });
      });
  }, []);

  const upcoming = (appointments || []).filter((a) => a.status === "Booked").slice(0, 3);

  return (
    <DashboardLayout title={`Welcome, ${user?.name?.split(" ")[0] || "Student"}`} subtitle={`${user?.profile?.department || ""} · Roll No. ${user?.profile?.rollNumber || ""}`}>
      {appointments === null ? (
        <Loader label="Loading your dashboard" />
      ) : (
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
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
