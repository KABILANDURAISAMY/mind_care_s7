import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

const getCategoryAndRecommendation = (percentage) => {
  if (percentage >= 80) {
    return {
      category: "Excellent Wellness",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      recommendation: "You're in a great mental space! Keep maintaining your positive daily routines, sleep habits, and social connections.",
    };
  }
  if (percentage >= 60) {
    return {
      category: "Good Wellness",
      color: "text-pine bg-mist border-pine/10",
      recommendation: "You are doing well overall. Remember to take short breaks when studying and stay hydrated.",
    };
  }
  if (percentage >= 40) {
    return {
      category: "Moderate Wellness",
      color: "text-amber-800 bg-amber-50 border-amber-200",
      recommendation: "You may be experiencing some mild stress or fatigue. Consider trying a quick breathing exercise or light walk.",
    };
  }
  if (percentage >= 30) {
    return {
      category: "Needs Attention",
      color: "text-orange-800 bg-orange-50 border-orange-200",
      recommendation: "Your score indicates moderate stress or discomfort. Talking to a counsellor or trusted friend could help lighten your load.",
    };
  }
  return {
    category: "Low Wellness Score (< 30%)",
    color: "text-red-800 bg-red-50 border-red-200",
    recommendation: "Your wellness score is below 30%. An alert has been generated for your counsellor so they can offer support. Feel free to book a session anytime.",
  };
};

const WellnessCheckin = () => {
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
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
      const resData = await submitAssessment(responses);
      setResult(resData.assessment);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  const outcome = result ? getCategoryAndRecommendation(result.percentage) : null;

  return (
    <DashboardLayout
      title="Daily wellness check-in"
      subtitle="10 quick questions. This is a self-check, not a diagnosis — your answers help you and your counsellor spot patterns over time."
    >
      {questions === null ? (
        <Loader label="Loading today's check-in" />
      ) : result ? (
        <div className="max-w-2xl space-y-6">
          <div className="card text-center space-y-4">
            <p className="font-display text-2xl font-semibold text-pine">Check-in Complete ✦</p>
            <p className="font-body text-xs text-ink/50 uppercase tracking-wide">Assessment Date: {result.date}</p>

            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="rounded-2xl bg-mist p-4">
                <span className="font-body text-xs font-medium text-ink/50 block mb-1">Total Score</span>
                <span className="font-display text-3xl font-bold text-pine">{result.totalScore} <span className="text-sm font-normal text-ink/40">/ 50</span></span>
              </div>
              <div className="rounded-2xl bg-mist p-4">
                <span className="font-body text-xs font-medium text-ink/50 block mb-1">Percentage Score</span>
                <span className="font-display text-3xl font-bold text-sunrise-dark">{result.percentage}%</span>
              </div>
            </div>

            <div className={`rounded-xl border p-4 text-left ${outcome.color}`}>
              <p className="font-display text-base font-semibold">{outcome.category}</p>
              <p className="mt-1 font-body text-sm opacity-90">{outcome.recommendation}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link to="/student/wellness-history" className="btn-primary !py-2.5 !px-5 text-sm">
                View Wellness History
              </Link>
              <Link to="/student/counsellors" className="rounded-xl border border-pine/20 bg-white px-5 py-2.5 font-body text-sm font-semibold text-pine hover:bg-mist transition">
                Talk to a Counsellor
              </Link>
            </div>
          </div>
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
