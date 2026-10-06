import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Banner from "../../components/Banner.jsx";
import CounsellorFeedbackModal from "../../components/CounsellorFeedbackModal.jsx";
import { getCounsellors } from "../../services/studentService.js";

const Counsellors = () => {
  const [counsellors, setCounsellors] = useState(null);
  const [selectedCounsellorForFeedback, setSelectedCounsellorForFeedback] = useState(null);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getCounsellors().then(setCounsellors).catch(() => setCounsellors([]));
  }, []);

  return (
    <DashboardLayout title="Counsellors" subtitle="Browse specializations, view availability, or leave feedback for any counsellor.">
      {success && <Banner type="success" onClose={() => setSuccess("")}>{success}</Banner>}

      {selectedCounsellorForFeedback && (
        <CounsellorFeedbackModal
          counsellor={selectedCounsellorForFeedback}
          onClose={() => setSelectedCounsellorForFeedback(null)}
          onSubmitSuccess={() => {
            setSuccess("Thank you! Your rating and feedback have been submitted successfully.");
            setSelectedCounsellorForFeedback(null);
          }}
        />
      )}

      {counsellors === null ? (
        <Loader label="Loading counsellors" />
      ) : counsellors.length === 0 ? (
        <EmptyState title="No counsellors available right now" description="Please check back later." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {counsellors.map((c) => (
            <div key={c._id} className="card flex flex-col justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pine font-display text-lg font-semibold text-mist">
                  {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <h3 className="font-display text-lg font-semibold text-pine">{c.title ? `${c.title} ${c.name}` : c.name}</h3>
                <p className="mt-0.5 font-body text-sm font-medium text-sage-dark">{c.specialization}</p>

                <dl className="mt-4 space-y-1.5 font-body text-sm text-ink/65">
                  <div className="flex justify-between"><dt>Qualification</dt><dd className="text-right text-ink/80">{c.qualification}</dd></div>
                  <div className="flex justify-between"><dt>Experience</dt><dd className="text-right text-ink/80">{c.experience} yrs</dd></div>
                </dl>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/student/book-appointment?counsellorId=${c._id}`)}
                  className="btn-primary w-full !py-2.5 text-sm"
                >
                  View availability
                </button>
                <button
                  onClick={() => setSelectedCounsellorForFeedback(c)}
                  className="rounded-xl border border-pine/20 bg-white py-2 text-xs font-semibold text-pine hover:bg-mist transition"
                >
                  ★ Leave Counsellor Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Counsellors;
