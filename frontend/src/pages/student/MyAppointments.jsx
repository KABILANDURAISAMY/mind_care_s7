import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Banner from "../../components/Banner.jsx";
import Modal from "../../components/Modal.jsx";
import FeedbackModal from "../../components/FeedbackModal.jsx";
import { getAppointments, cancelAppointment, getPendingFeedback, dismissCancellation } from "../../services/studentService.js";

const STATUS_STYLES = {
  Booked: "bg-sage-light/40 text-sage-dark",
  Completed: "bg-dusk-light/30 text-dusk-dark",
  Cancelled: "bg-red-50 text-red-600",
  Missed: "bg-amber-50 text-amber-700",
};

const CANCELLATION_WINDOW_MINUTES = 20;

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
  const [feedbackAppt, setFeedbackAppt] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    getAppointments().then(setAppointments).catch(() => setAppointments([]));
  };

  useEffect(() => {
    load();
    getPendingFeedback().then((pending) => {
      if (pending && pending.length > 0) {
        setFeedbackAppt(pending[0]);
      }
    }).catch(() => {});
  }, []);

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
    <DashboardLayout title="My appointments" subtitle="View, track, and manage your counselling sessions.">
      {success && <Banner type="success" onClose={() => setSuccess("")}>{success}</Banner>}
      {error && <Banner type="error" onClose={() => setError("")}>{error}</Banner>}

      {/* Feedback Modal */}
      {feedbackAppt && (
        <FeedbackModal
          appointment={feedbackAppt}
          onClose={() => setFeedbackAppt(null)}
          onSubmitSuccess={() => {
            setSuccess("Thank you! Your feedback has been sent to your counsellor.");
            setFeedbackAppt(null);
            load();
          }}
        />
      )}

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
            <div key={a._id} className="card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-base font-semibold text-pine">
                    {a.counsellorId?.title ? `${a.counsellorId.title} ${a.counsellorId.name}` : a.counsellorId?.name || "Counsellor"}
                  </p>
                  <p className="mt-0.5 font-body text-sm text-ink/60">{a.date} at {a.time} · {a.issue}</p>
                  {a.details && <p className="mt-1 font-body text-xs text-ink/45">{a.details}</p>}
                  <p className="mt-1 font-body text-xs font-medium text-pine">
                    Type: {a.appointmentType || "Offline"} 
                    {a.appointmentType === "Online" && a.meetingLink && (
                      <span className="ml-3">
                        <a href={a.meetingLink} target="_blank" rel="noreferrer" className="text-sunrise underline">Join Meeting</a>
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 font-body text-xs font-semibold ${STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                  {a.status === "Completed" && (
                    <button
                      onClick={() => setFeedbackAppt(a)}
                      className="rounded-lg bg-sunrise/20 px-3 py-1 font-body text-xs font-semibold text-sunrise-dark hover:bg-sunrise/30"
                    >
                      ★ Leave Feedback
                    </button>
                  )}
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

              {/* Counsellor Cancellation Apology & Alternate Booking */}
              {a.status === "Cancelled" && a.cancelledBy === "counsellor" && !a.cancellationReadByStudent && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xs font-semibold text-amber-900">
                      😔 Cancelled by Counsellor — We are sorry!
                    </p>
                    <button
                      onClick={async () => {
                        await dismissCancellation(a._id);
                        load();
                      }}
                      className="font-body text-[11px] font-semibold text-amber-900 hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                  {a.cancellationReason && (
                    <p className="mt-1 font-body text-xs text-amber-800">
                      Reason: <em>"{a.cancellationReason}"</em>
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <Link to="/student/counsellors" className="btn-primary !py-1.5 !px-3 text-xs !bg-amber-800 hover:!bg-amber-900">
                      📅 Book Alternate Session
                    </Link>
                  </div>
                </div>
              )}
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
