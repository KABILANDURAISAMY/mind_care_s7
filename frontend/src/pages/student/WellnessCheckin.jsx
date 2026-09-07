import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import Banner from "../../components/Banner.jsx";
import { getAssessmentQuestions, submitAssessment } from "../../services/studentService.js";

const NEGATIVE_SCALE = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Always" },
];

const POSITIVE_SCALE = [
  { value: 1, label: "Very Low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Good" },
  { value: 5, label: "Very Good" },
];

const WellnessCheckin = () => {
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAssessmentQuestions().then(setQuestions).catch(() => setQuestions([]));
  }, []);

  const handleAnswer = (questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }));

  const allAnswered = questions && questions.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    setError("");
    if (!allAnswered) {
      setError("Please answer every question before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const responses = questions.map((q) => answers[q.id]);
      await submitAssessment(responses);
      setDone(true);
      setTimeout(() => navigate("/student/wellness-history"), 1600);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Daily wellness check-in"
      subtitle="10 quick questions. This is a self-check, not a diagnosis — your answers help you and your counsellor spot patterns over time."
    >
      {questions === null ? (
        <Loader label="Loading today's check-in" />
      ) : done ? (
        <div className="card text-center">
          <p className="font-display text-2xl font-semibold text-pine">Thanks for checking in ✦</p>
          <p className="mt-2 font-body text-ink/60">Taking you to your wellness history…</p>
        </div>
      ) : (
        <div className="max-w-2xl">
          {error && <Banner type="error">{error}</Banner>}

          <div className="space-y-5">
            {questions.map((q, i) => {
              const scale = q.positive ? POSITIVE_SCALE : NEGATIVE_SCALE;
              return (
                <div key={q.id} className="card">
                  <p className="font-body text-sm font-medium text-ink/50">Question {i + 1} of {questions.length}</p>
                  <p className="mt-1 font-display text-lg font-semibold text-pine">{q.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {scale.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAnswer(q.id, opt.value)}
                        className={`rounded-full border-2 px-4 py-2 font-body text-sm font-medium transition ${
                          answers[q.id] === opt.value
                            ? "border-sunrise bg-sunrise text-pine-dark"
                            : "border-pine/15 bg-white text-ink/70 hover:border-sage"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary mt-6 w-full !py-3 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit check-in"}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WellnessCheckin;
