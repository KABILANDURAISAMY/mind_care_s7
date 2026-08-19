import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatCard from "../../components/StatCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDashboardSummary, getAppointments } from "../../services/counsellorService.js";

const CounsellorDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(() => setSummary({}));
    getAppointments().then(setAppointments).catch(() => setAppointments([]));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todaysBookings = (appointments || []).filter((a) => a.date === today && a.status === "Booked");

  return (
    <DashboardLayout title={`Welcome, ${user?.name?.split(" ")[0] || "Counsellor"}`} subtitle={user?.profile?.specialization}>
      {summary === null ? (
        <Loader label="Loading your dashboard" />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Today's appointments" value={summary.todayAppointments ?? 0} accent="sunrise" />
            <StatCard label="Upcoming" value={summary.upcomingAppointments ?? 0} accent="pine" />
            <StatCard label="Completed" value={summary.completedSessions ?? 0} accent="sage" />
            <StatCard label="Cancelled" value={summary.cancelledSessions ?? 0} accent="dusk" />
            <StatCard label="Total students" value={summary.totalStudents ?? 0} accent="pine" />
          </div>

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
        </>
      )}
    </DashboardLayout>
  );
};

export default CounsellorDashboard;
