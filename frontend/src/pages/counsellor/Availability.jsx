import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Banner from "../../components/Banner.jsx";
import { addAvailability, listAvailability, removeAvailability } from "../../services/counsellorService.js";

const Availability = () => {
  const [slots, setSlots] = useState(null);
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => listAvailability().then(setSlots).catch(() => setSlots([]));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await addAvailability(form);
      setSuccess("Slot added.");
      setForm({ date: "", startTime: "", endTime: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add this slot.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this slot?")) {
      return;
    }
    setError("");
    setSuccess("");
    // Optimistically remove from UI for instant response
    setSlots((prev) => (prev || []).filter((s) => s._id !== id));
    try {
      await removeAvailability(id);
      setSuccess("Slot removed successfully.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove this slot.");
      load();
    }
  };

  const upcoming = (slots || []).filter((s) => s.status === "available");
  const booked = (slots || []).filter((s) => s.status === "booked");

  return (
    <DashboardLayout title="Availability" subtitle="Open new slots for students to book, or remove ones you no longer need.">
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleAdd} className="card lg:col-span-1">
          <h2 className="mb-4 font-display text-lg font-semibold text-pine">Add a slot</h2>
          {error && <Banner type="error" onClose={() => setError("")}>{error}</Banner>}
          {success && <Banner type="success" onClose={() => setSuccess("")}>{success}</Banner>}

          <label className="label-field">Date</label>
          <input type="date" name="date" required value={form.date} onChange={handleChange} className="input-field" />

          <label className="label-field mt-4">Start time</label>
          <input type="time" name="startTime" required value={form.startTime} onChange={handleChange} className="input-field" />

          <label className="label-field mt-4">End time</label>
          <input type="time" name="endTime" required value={form.endTime} onChange={handleChange} className="input-field" />

          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full !py-2.5 text-sm disabled:opacity-60">
            {submitting ? "Adding…" : "Add slot"}
          </button>
        </form>

        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-pine">Open slots ({upcoming.length})</h2>
            {slots === null ? (
              <Loader label="Loading" />
            ) : upcoming.length === 0 ? (
              <EmptyState title="No open slots" description="Add one using the form on the left." />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {upcoming.map((s) => (
                  <div key={s._id} className="flex flex-col gap-1 rounded-xl border border-pine/10 bg-mist px-3 py-3">
                    <p className="font-body text-sm font-semibold text-pine">{s.date}</p>
                    <p className="font-body text-xs text-ink/60">{s.startTime} – {s.endTime}</p>
                    <button onClick={() => handleRemove(s._id)} className="mt-1 self-start font-body text-xs font-semibold text-red-600 hover:underline">
                      Remove Slot
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-pine">Booked slots ({booked.length})</h2>
            {booked.length === 0 ? (
              <p className="font-body text-sm text-ink/50">Nothing booked yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {booked.map((s) => (
                  <div key={s._id} className="rounded-xl border border-sage/40 bg-sage-light/20 p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-semibold text-pine">{s.date}</p>
                      <span className="rounded-full bg-sage/30 px-2.5 py-0.5 font-body text-[10px] font-bold text-sage-dark uppercase">
                        Booked
                      </span>
                    </div>
                    <p className="font-body text-xs text-ink/70 font-medium">{s.startTime} – {s.endTime}</p>
                    
                    {s.bookingDetails ? (
                      <div className="mt-2 pt-2 border-t border-sage/20 font-body text-xs text-ink/80 space-y-0.5">
                        <p className="font-semibold text-pine">👤 {s.bookingDetails.studentName}</p>
                        <p className="text-ink/60">🎓 {s.bookingDetails.department} · Roll: {s.bookingDetails.rollNumber}</p>
                        <p className="text-ink/70 italic">📌 "{s.bookingDetails.issue}"</p>
                      </div>
                    ) : (
                      <p className="mt-1 font-body text-xs text-ink/50 italic">Booked by student</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Availability;
