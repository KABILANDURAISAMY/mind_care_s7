import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Banner from "../../components/Banner.jsx";
import { getAppointments, updateAppointmentStatus } from "../../services/counsellorService.js";

const STATUS_STYLES = {
  Booked: "bg-sage-light/40 text-sage-dark",
  Completed: "bg-dusk-light/30 text-dusk-dark",
  Cancelled: "bg-red-50 text-red-600",
  Missed: "bg-amber-50 text-amber-700",
};

const Appointments = () => {
  const [appointments, setAppointments] = useState(null);
  const [filter, setFilter] = useState("Booked");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => getAppointments().then(setAppointments).catch(() => setAppointments([]));
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    setError("");
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update this appointment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = (appointments || []).filter((a) => filter === "All" || a.status === filter);

  return (
    <DashboardLayout title="Appointments" subtitle="All student bookings, filterable by status.">
      {error && <Banner type="error" onClose={() => setError("")}>{error}</Banner>}

      <div className="mb-6 flex flex-wrap gap-2">
        {["Booked", "Completed", "Cancelled", "Missed", "All"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 font-body text-sm font-medium transition ${
              filter === f ? "bg-pine text-mist" : "bg-white text-ink/60 hover:bg-pine/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {appointments === null ? (
        <Loader label="Loading appointments" />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nothing here" description="No appointments match this filter." />
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-pine/10 text-ink/50">
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Roll No</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Issue</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a._id} className="border-b border-pine/5 last:border-0 hover:bg-mist/60">
                  <td className="px-5 py-3">
                    <Link to={`/counsellor/students/${a.studentId}`} className="font-semibold text-pine hover:underline">
                      {a.studentName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/70">{a.department}</td>
                  <td className="px-5 py-3 text-ink/70">{a.rollNumber}</td>
                  <td className="px-5 py-3 text-ink/70">{a.date}</td>
                  <td className="px-5 py-3 text-ink/70">{a.time}</td>
                  <td className="px-5 py-3 text-ink/70">{a.issue}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {a.status === "Booked" && (
                      <div className="flex gap-2">
                        <button
                          disabled={updatingId === a._id}
                          onClick={() => handleStatusChange(a._id, "Completed")}
                          className="font-semibold text-sage-dark hover:underline disabled:opacity-50"
                        >
                          Mark done
                        </button>
                        <button
                          disabled={updatingId === a._id}
                          onClick={() => handleStatusChange(a._id, "Missed")}
                          className="font-semibold text-amber-600 hover:underline disabled:opacity-50"
                        >
                          Mark missed
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Appointments;
