import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Banner from "../../components/Banner.jsx";
import Modal from "../../components/Modal.jsx";
import { getAppointments, updateAppointmentStatus, cancelCounsellorAppointment, updateMeetingLink } from "../../services/counsellorService.js";

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
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Cancellation modal state
  const [cancellationTarget, setCancellationTarget] = useState(null);
  const [apologyReason, setApologyReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Meeting Link modal state
  const [meetingLinkTarget, setMeetingLinkTarget] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [updatingLink, setUpdatingLink] = useState(false);

  const load = () => getAppointments().then(setAppointments).catch(() => setAppointments([]));
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    setError("");
    setSuccess("");
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      setSuccess(`Appointment status updated to ${status}.`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update this appointment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCounsellorCancel = async (e) => {
    e.preventDefault();
    if (!cancellationTarget) return;
    setCancelling(true);
    setError("");
    setSuccess("");
    try {
      await cancelCounsellorAppointment(cancellationTarget._id, apologyReason);
      setSuccess("Appointment cancelled successfully. The student has been sent an apology notification and alternate booking option.");
      setCancellationTarget(null);
      setApologyReason("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel this appointment.");
    } finally {
      setCancelling(false);
    }
  };

  const handleUpdateLink = async (e) => {
    e.preventDefault();
    if (!meetingLinkTarget) return;
    setUpdatingLink(true);
    setError("");
    setSuccess("");
    try {
      await updateMeetingLink(meetingLinkTarget._id, meetingLink);
      setSuccess("Meeting link updated successfully.");
      setMeetingLinkTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update meeting link.");
    } finally {
      setUpdatingLink(false);
    }
  };

  const filtered = (appointments || []).filter((a) => filter === "All" || a.status === filter);

  return (
    <DashboardLayout title="Appointments" subtitle="All student bookings, filterable by status.">
      {success && <Banner type="success" onClose={() => setSuccess("")}>{success}</Banner>}
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
                <th className="px-5 py-3 font-medium">Type/Link</th>
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
                  <td className="px-5 py-3 text-ink/70">
                    <div>{a.appointmentType || "Offline"}</div>
                    {a.appointmentType === "Online" && (
                      <div className="mt-1">
                        {a.meetingLink ? (
                          <a href={a.meetingLink} target="_blank" rel="noreferrer" className="text-sunrise text-xs underline block truncate max-w-[150px]">{a.meetingLink}</a>
                        ) : (
                          <span className="text-xs text-ink/40">No link set</span>
                        )}
                        <button 
                          onClick={() => {
                            setMeetingLinkTarget(a);
                            setMeetingLink(a.meetingLink || "");
                          }}
                          className="text-xs text-sage-dark hover:underline block mt-1"
                        >
                          {a.meetingLink ? "Edit Link" : "Add Link"}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {a.status === "Booked" && (
                      <div className="flex items-center gap-3">
                        <button
                          disabled={updatingId === a._id}
                          onClick={() => handleStatusChange(a._id, "Completed")}
                          className="font-semibold text-sage-dark hover:underline disabled:opacity-50"
                        >
                          Done
                        </button>
                        <button
                          disabled={updatingId === a._id}
                          onClick={() => handleStatusChange(a._id, "Missed")}
                          className="font-semibold text-amber-600 hover:underline disabled:opacity-50"
                        >
                          Missed
                        </button>
                        <button
                          disabled={updatingId === a._id}
                          onClick={() => {
                            setCancellationTarget(a);
                            setApologyReason("Unavoidable schedule conflict. Sincere apologies for the inconvenience.");
                          }}
                          className="font-semibold text-red-600 hover:underline disabled:opacity-50"
                        >
                          Cancel
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

      {/* Cancellation Modal for Counsellor */}
      <Modal open={!!cancellationTarget} onClose={() => setCancellationTarget(null)} title="Cancel Student Appointment">
        {cancellationTarget && (
          <form onSubmit={handleCounsellorCancel} className="space-y-4">
            <p className="font-body text-sm text-ink/70">
              You are about to cancel the session with <strong className="text-pine">{cancellationTarget.studentName}</strong> on{" "}
              <strong>{cancellationTarget.date}</strong> at <strong>{cancellationTarget.time}</strong>.
            </p>
            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200">
              <p className="font-body text-xs text-amber-900 font-semibold">
                ℹ️ Student Notification & Apology
              </p>
              <p className="mt-1 font-body text-xs text-amber-800">
                The student will receive an automatic email and dashboard alert with your apology message and an option to book an alternate session.
              </p>
            </div>

            <div>
              <label className="label-field">Apology Note / Cancellation Reason</label>
              <textarea
                value={apologyReason}
                onChange={(e) => setApologyReason(e.target.value)}
                className="input-field min-h-[90px] resize-none"
                placeholder="Explain the reason and include a brief note to the student..."
                rows={3}
                required
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCancellationTarget(null)} className="btn-ghost text-sm">
                Keep session
              </button>
              <button
                type="submit"
                disabled={cancelling}
                className="btn-primary !bg-red-600 hover:!bg-red-500 text-sm disabled:opacity-60"
              >
                {cancelling ? "Cancelling…" : "Confirm Cancellation"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Meeting Link Modal */}
      <Modal open={!!meetingLinkTarget} onClose={() => setMeetingLinkTarget(null)} title="Update Meeting Link">
        {meetingLinkTarget && (
          <form onSubmit={handleUpdateLink} className="space-y-4">
            <p className="font-body text-sm text-ink/70">
              Set the online meeting link for your session with <strong className="text-pine">{meetingLinkTarget.studentName}</strong> on <strong>{meetingLinkTarget.date}</strong>.
            </p>
            <div>
              <label className="label-field">Meeting URL (Google Meet, Zoom, etc.)</label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="input-field"
                placeholder="https://meet.google.com/..."
                required
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setMeetingLinkTarget(null)} className="btn-ghost text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingLink}
                className="btn-primary text-sm disabled:opacity-60"
              >
                {updatingLink ? "Saving…" : "Save Link"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Appointments;
