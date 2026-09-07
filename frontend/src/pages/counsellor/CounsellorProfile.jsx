import React from "react";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const FIELDS = [
  ["Full name", "name"],
  ["Email", "email"],
  ["Qualification", "qualification"],
  ["Specialization", "specialization"],
  ["Experience", "experience"],
  ["Phone", "phone"],
];

const CounsellorProfile = () => {
  const { user } = useAuth();
  const profile = user?.profile || {};

  return (
    <DashboardLayout title="Profile" subtitle="Your account details.">
      <div className="card max-w-xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pine font-display text-xl font-semibold text-mist">
            {profile.name?.[0] || "C"}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-pine">{profile.name}</p>
            <p className="font-body text-sm text-ink/60">Counsellor</p>
          </div>
        </div>

        <dl className="divide-y divide-pine/10">
          {FIELDS.map(([label, key]) => (
            <div key={key} className="flex items-center justify-between py-3">
              <dt className="font-body text-sm text-ink/60">{label}</dt>
              <dd className="font-body text-sm font-medium text-pine">
                {key === "experience" ? `${profile[key] ?? "—"} yrs` : profile[key] || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </DashboardLayout>
  );
};

export default CounsellorProfile;
