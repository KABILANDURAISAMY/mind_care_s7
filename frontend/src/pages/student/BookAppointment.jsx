import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Banner from "../../components/Banner.jsx";
import { getCounsellors, getAvailability, bookAppointment } from "../../services/studentService.js";

const ISSUE_OPTIONS = [
  "Academic Stress",
  "Exam Anxiety",
  "Anger Management",
  "Relationship Issues",
  "Lack of Motivation",
  "Sleep Problems",
  "Concentration Problems",
  "Personal Issues",
  "Other",
];

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const preselectedCounsellor = searchParams.get("counsellorId") || "";

  const [counsellors, setCounsellors] = useState([]);
  const [counsellorId, setCounsellorId] = useState(preselectedCounsellor);
  const [slots, setSlots] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [issue, setIssue] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getCounsellors().then(setCounsellors).catch(() => setCounsellors([]));
  }, []);

  useEffect(() => {
    setSlots(null);
    setSelectedSlot(null);
    getAvailability(counsellorId ? { counsellorId } : {})
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [counsellorId]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedSlot) {
      setError("Please choose an available slot first.");
      return;
    }
    if (!issue) {
      setError("Please tell us the reason for your visit.");
      return;
    }

    setSubmitting(true);
    try {
      await bookAppointment({ availabilityId: selectedSlot._id, issue, details });
      setSuccess("Appointment booked! Redirecting to your appointments…");
      setTimeout(() => navigate("/student/appointments"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not complete the booking. Please try another slot.");
      // The slot may have just been taken — refresh the list.
      getAvailability(counsellorId ? { counsellorId } : {}).then(setSlots).catch(() => {});
      setSelectedSlot(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Book an appointment" subtitle="Only genuinely open slots are shown — booked slots disappear in real time.">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Slot picker */}
        <div className="lg:col-span-3">
          <div className="card">
            <label className="label-field">Counsellor</label>
            <select value={counsellorId} onChange={(e) => setCounsellorId(e.target.value)} className="input-field">
              <option value="">All counsellors</option>
              {counsellors.map((c) => (
                <option key={c._id} value={c._id}>{c.name} — {c.specialization}</option>
              ))}
            </select>

            <p className="label-field mt-5">Available slots</p>
            {slots === null ? (
              <Loader label="Loading availability" />
            ) : slots.length === 0 ? (
              <EmptyState title="No open slots" description="Try a different counsellor, or check back soon." />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {slots.map((s) => {
                  const active = selectedSlot?._id === s._id;
                  return (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`rounded-xl border-2 px-3 py-3 text-left font-body text-sm transition ${
                        active ? "border-sunrise bg-sunrise/10" : "border-pine/10 bg-mist hover:border-sage"
                      }`}
                    >
                      <p className="font-semibold text-pine">{s.date}</p>
                      <p className="text-ink/60">{s.startTime}</p>
                      {!counsellorId && <p className="mt-1 truncate text-xs text-sage-dark">{s.counsellorId?.name}</p>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Booking form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleBook} className="card sticky top-24">
            <h2 className="mb-4 font-display text-lg font-semibold text-pine">Appointment details</h2>

            {error && <Banner type="error">{error}</Banner>}
            {success && <Banner type="success">{success}</Banner>}

            {selectedSlot ? (
              <div className="mb-4 rounded-xl border border-sunrise/40 bg-sunrise/10 px-4 py-3 font-body text-sm">
                <p className="font-semibold text-pine">{selectedSlot.counsellorId?.name || "Selected counsellor"}</p>
                <p className="text-ink/60">{selectedSlot.date} at {selectedSlot.startTime}</p>
              </div>
            ) : (
              <p className="mb-4 font-body text-sm text-ink/50">Select a slot on the left to continue.</p>
            )}

            <label className="label-field">Reason for visit</label>
            <select value={issue} onChange={(e) => setIssue(e.target.value)} className="input-field">
              <option value="">Select a reason</option>
              {ISSUE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>

            <label className="label-field mt-4">Additional details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Anything you'd like your counsellor to know beforehand…"
            />

            <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full !py-3 disabled:opacity-60">
              {submitting ? "Booking…" : "Confirm appointment"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
