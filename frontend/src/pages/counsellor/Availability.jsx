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
    setError("");
    try {
      await removeAvailability(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove this slot.");
    }
  };

  const upcoming = (slots || []).filter((s) => s.status === "available");
  const booked = (slots || []).filter((s) => s.status === "booked");

  return (
    <DashboardLayout title="Availability" subtitle="Open new slots for students to book, or remove ones you no longer need.">
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleAdd} className="card lg:col-span-1">
          <h2 className="mb-4 font-display text-lg font-semibold text-pine">Add a slot</h2>
          {error && <Banner type="error">{error}</Banner>}
          {success && <Banner type="success">{success}</Banner>}

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
                      Remove
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {booked.map((s) => (
                  <div key={s._id} className="rounded-xl border border-sage/30 bg-sage-light/20 px-3 py-3">
                    <p className="font-body text-sm font-semibold text-pine">{s.date}</p>
                    <p className="font-body text-xs text-ink/60">{s.startTime} – {s.endTime}</p>
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
