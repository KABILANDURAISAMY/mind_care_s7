import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Banner from "../../components/Banner.jsx";
import Modal from "../../components/Modal.jsx";
import { getAppointments, cancelAppointment } from "../../services/studentService.js";

const STATUS_STYLES = {
  Booked: "bg-sage-light/40 text-sage-dark",
  Completed: "bg-dusk-light/30 text-dusk-dark",
  Cancelled: "bg-red-50 text-red-600",
  Missed: "bg-amber-50 text-amber-700",
};

const CANCELLATION_WINDOW_MINUTES = 20;

// Mirrors the backend's rule so the button disables itself proactively —
// the backend re-validates independently and is the real source of truth.
const canStillCancel = (appt) => {
  if (appt.status !== "Booked") return false;
  const [y, m, d] = appt.date.split("-").map(Number);
  const [h, min] = appt.time.split(":").map(Number);
  const apptTime = new Date(y, m - 1, d, h, min);
  const deadline = new Date(apptTime.getTime() - CANCELLATION_WINDOW_MINUTES * 60 * 1000);
  return new Date() < deadline;
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState(null);
  const [filter, setFilter] = useState("upcoming");
  const [target, setTarget] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = () => getAppointments().then(setAppointments).catch(() => setAppointments([]));
  useEffect(() => { load(); }, []);

  const handleCancel = async () => {
    setCancelling(true);
    setError("");
    try {
      await cancelAppointment(target._id, "Cancelled by student");
      setSuccess("Appointment cancelled. The slot is now open for other students.");
      setTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel this appointment.");
      setTarget(null);
    } finally {
      setCancelling(false);
    }
  };

  const filtered = (appointments || []).filter((a) =>
    filter === "upcoming" ? a.status === "Booked" : filter === "past" ? a.status !== "Booked" : true
  );

  return (
    <DashboardLayout title="My appointments" subtitle="View, track, and cancel your counselling sessions.">
      {success && <Banner type="success" onClose={() => setSuccess("")}>{success}</Banner>}
      {error && <Banner type="error" onClose={() => setError("")}>{error}</Banner>}

      <div className="mb-6 flex gap-2">
        {["upcoming", "past", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 font-body text-sm font-medium capitalize transition ${
              filter === f ? "bg-pine text-mist" : "bg-white text-ink/60 hover:bg-pine/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {appointments === null ? (
        <Loader label="Loading your appointments" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No appointments here"
          description="Ready to talk to someone? Find a counsellor and pick a time that works."
          action={<Link to="/student/counsellors" className="btn-primary !py-2 !px-4 text-sm">Find a counsellor</Link>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div key={a._id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-base font-semibold text-pine">{a.counsellorId?.name || "Counsellor"}</p>
                <p className="mt-0.5 font-body text-sm text-ink/60">{a.date} at {a.time} · {a.issue}</p>
                {a.details && <p className="mt-1 font-body text-xs text-ink/45">{a.details}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 font-body text-xs font-semibold ${STATUS_STYLES[a.status]}`}>
                  {a.status}
                </span>
                {canStillCancel(a) && (
                  <button
                    onClick={() => setTarget(a)}
                    className="font-body text-sm font-semibold text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!target} onClose={() => setTarget(null)} title="Cancel this appointment?">
        <p className="font-body text-sm text-ink/70">
          Your slot with <strong>{target?.counsellorId?.name}</strong> on{" "}
          <strong>{target?.date} at {target?.time}</strong> will be released for other students. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setTarget(null)} className="btn-ghost">Keep appointment</button>
          <button onClick={handleCancel} disabled={cancelling} className="btn-primary !bg-red-600 hover:!bg-red-500 disabled:opacity-60">
            {cancelling ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default MyAppointments;
