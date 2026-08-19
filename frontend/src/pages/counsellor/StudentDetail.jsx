import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import WellnessScoreChart from "../../components/WellnessScoreChart.jsx";
import { getStudentDetail, getStudentHistory, getStudentAssessments } from "../../services/counsellorService.js";

const STATUS_STYLES = {
  Booked: "bg-sage-light/40 text-sage-dark",
  Completed: "bg-dusk-light/30 text-dusk-dark",
  Cancelled: "bg-red-50 text-red-600",
  Missed: "bg-amber-50 text-amber-700",
};

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState(null);
  const [assessments, setAssessments] = useState(null);

  useEffect(() => {
    getStudentDetail(id).then(setStudent).catch(() => setStudent(null));
    getStudentHistory(id).then(setHistory).catch(() => setHistory([]));
    getStudentAssessments(id).then(setAssessments).catch(() => setAssessments({ assessments: [], trend: "—" }));
  }, [id]);

  if (!student) {
    return (
      <DashboardLayout title="Student details">
        <Loader label="Loading student" />
      </DashboardLayout>
    );
  }

  const latestAssessment = assessments?.assessments?.[0];

  return (
    <DashboardLayout title={student.name} subtitle={`${student.department} · Roll No. ${student.rollNumber} · ${student.year}`}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student info */}
        <div className="card lg:col-span-1">
          <h2 className="mb-4 font-display text-lg font-semibold text-pine">Student information</h2>
          <dl className="space-y-3 font-body text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Name</dt><dd className="font-medium text-pine">{student.name}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Roll number</dt><dd className="font-medium text-pine">{student.rollNumber}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Department</dt><dd className="font-medium text-pine">{student.department}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Year</dt><dd className="font-medium text-pine">{student.year}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Email</dt><dd className="max-w-[60%] truncate font-medium text-pine">{student.email}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Phone</dt><dd className="font-medium text-pine">{student.phone}</dd></div>
          </dl>

          {latestAssessment && (
            <div className="mt-6 rounded-xl border border-sunrise/30 bg-sunrise/10 p-4">
              <p className="font-body text-xs text-ink/60">Latest wellness score ({latestAssessment.date})</p>
              <p className="font-display text-3xl font-semibold text-sunrise-dark">{latestAssessment.percentage}<span className="text-base text-ink/40">/100</span></p>
              <p className="mt-1 font-body text-xs font-semibold text-sage-dark">Trend: {assessments.trend}</p>
            </div>
          )}
        </div>

        {/* Wellness trend + history */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-pine">Wellness trend</h2>
            <WellnessScoreChart data={assessments?.assessments || []} />
          </div>

          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-pine">Appointment history</h2>
            {history === null ? (
              <Loader label="Loading history" />
            ) : history.length === 0 ? (
              <EmptyState title="No appointments yet" />
            ) : (
              <div className="space-y-2">
                {history.map((a) => (
                  <div key={a._id} className="flex items-center justify-between rounded-xl border border-pine/10 bg-mist px-4 py-2.5">
                    <div>
                      <p className="font-body text-sm font-medium text-pine">{a.date} · {a.time}</p>
                      <p className="font-body text-xs text-ink/60">{a.issue}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[a.status]}`}>{a.status}</span>
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

export default StudentDetail;
