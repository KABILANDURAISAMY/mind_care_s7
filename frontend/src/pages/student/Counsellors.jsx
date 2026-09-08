import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { getCounsellors } from "../../services/studentService.js";

const Counsellors = () => {
  const [counsellors, setCounsellors] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCounsellors().then(setCounsellors).catch(() => setCounsellors([]));
  }, []);

  return (
    <DashboardLayout title="Counsellors" subtitle="Browse specializations and book a slot that works for you.">
      {counsellors === null ? (
        <Loader label="Loading counsellors" />
      ) : counsellors.length === 0 ? (
        <EmptyState title="No counsellors available right now" description="Please check back later." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {counsellors.map((c) => (
            <div key={c._id} className="card flex flex-col">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pine font-display text-lg font-semibold text-mist">
                {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <h3 className="font-display text-lg font-semibold text-pine">{c.title ? `${c.title} ${c.name}` : c.name}</h3>
              <p className="mt-0.5 font-body text-sm font-medium text-sage-dark">{c.specialization}</p>

              <dl className="mt-4 space-y-1.5 font-body text-sm text-ink/65">
                <div className="flex justify-between"><dt>Qualification</dt><dd className="text-right text-ink/80">{c.qualification}</dd></div>
                <div className="flex justify-between"><dt>Experience</dt><dd className="text-right text-ink/80">{c.experience} yrs</dd></div>
              </dl>

              <button
                onClick={() => navigate(`/student/book-appointment?counsellorId=${c._id}`)}
                className="btn-primary mt-6 w-full !py-2.5 text-sm"
              >
                View availability
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Counsellors;
