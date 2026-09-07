import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatCard from "../../components/StatCard.jsx";
import WellnessScoreChart from "../../components/WellnessScoreChart.jsx";
import { getAssessmentHistory } from "../../services/studentService.js";

const WellnessHistory = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAssessmentHistory().then(setData).catch(() => setData({ history: [] }));
  }, []);

  return (
    <DashboardLayout
      title="Wellness history"
      subtitle="A private, self-reported trend — for reflection, not diagnosis."
    >
      {data === null ? (
        <Loader label="Loading your history" />
      ) : data.history.length === 0 ? (
        <EmptyState title="No check-ins yet" description="Complete your first daily wellness check-in to start tracking your trend." />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Today's score" value={data.todayScore ?? "—"} accent="sunrise" />
            <StatCard label="Weekly average" value={data.weeklyAverage ?? "—"} accent="sage" />
            <StatCard label="Trend" value={data.trend} accent="dusk" />
          </div>

          <div className="card mb-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-pine">Score over time</h2>
            <WellnessScoreChart data={data.history} />
          </div>

          <div className="card overflow-x-auto">
            <h2 className="mb-4 font-display text-lg font-semibold text-pine">Check-in log</h2>
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-pine/10 text-ink/50">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((h) => (
                  <tr key={h._id} className="border-b border-pine/5 last:border-0">
                    <td className="py-2.5 text-ink/80">{h.date}</td>
                    <td className="py-2.5 text-ink/80">{h.totalScore} / 50</td>
                    <td className="py-2.5 font-semibold text-pine">{h.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default WellnessHistory;
