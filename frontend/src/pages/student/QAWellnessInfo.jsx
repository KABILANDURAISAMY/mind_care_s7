import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import { getWellnessCategories, getWellnessQuestions } from "../../services/studentService.js";

const categoryIcons = {
  "Exam / Academic Stress": "📚",
  "Anxiety": "🍃",
  "Fear": "🛡️",
  "Career / Future Stress": "🎯",
  "Financial Stress": "💳",
  "Relationship / Social Stress": "🤝",
  "Loneliness": "🌱",
  "Family / Expectation Pressure": "🏡",
  "Sleep / Rest Problems": "🌙",
  "General Stress": "✦"
};

const QAWellnessInfo = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWellnessCategories();
      // Handle string array or object array format
      const formatted = Array.isArray(data)
        ? data.map((item) => (typeof item === "string" ? { name: item, description: "" } : item))
        : [];
      setCategories(formatted);
    } catch (err) {
      console.error("Failed to load categories", err);
      setError("Unable to load wellness categories right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (categoryName) => {
    setLoading(true);
    setError(null);
    setSearchQuery("");
    try {
      const data = await getWellnessQuestions(categoryName);
      setQuestions(data || []);
      setSelectedCategory(categoryName);
      setSelectedQuestion(null);
    } catch (err) {
      console.error("Failed to load questions", err);
      setError("Unable to load questions for this category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (questionObj) => {
    setSelectedQuestion(questionObj);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedQuestion(null);
    setQuestions([]);
    setSearchQuery("");
  };

  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
  };

  // Helper to remove any accidental numbering prefixes from question text if present in raw DB
  const formatQuestionText = (text) => {
    if (!text) return "";
    return text
      .replace(/^(Question\s*\d+[\s:-]*|Q\d+[\s:-]*|\d+\.[\s:-]*)/i, "")
      .trim();
  };

  const filteredQuestions = questions.filter((q) => {
    const qText = formatQuestionText(q.question).toLowerCase();
    return qText.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout
      title="Q/A Wellness Info"
      subtitle="Browse practical, student-focused wellness questions and answers organized by category."
    >
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Q/A Wellness Info..." />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-body text-sm font-medium">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-4 rounded-xl bg-red-700 px-4 py-2 font-body text-xs font-semibold text-white hover:bg-red-800 transition"
          >
            Try Again
          </button>
        </div>
      ) : selectedQuestion ? (
        /* ========================================================
           SCREEN 3: QUESTION & ANSWER VIEW (NO CHAT INTERFACE)
           ======================================================== */
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Top Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pine/10 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToQuestions}
                className="flex items-center gap-1.5 rounded-xl border border-pine/15 bg-white px-3.5 py-2 font-body text-xs font-semibold text-pine hover:bg-pine/5 transition"
              >
                ← Back to Questions
              </button>
              <button
                onClick={handleBackToCategories}
                className="font-body text-xs font-medium text-ink/60 hover:text-pine hover:underline transition"
              >
                Back to Categories
              </button>
            </div>
            <span className="rounded-full bg-mist px-3 py-1 font-body text-xs font-medium text-pine border border-pine/10">
              Category: {selectedCategory}
            </span>
          </div>

          {/* Question Box */}
          <div className="rounded-2xl border border-pine/15 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pine/10 text-pine font-display text-base font-bold">
                Q
              </span>
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-pine/60">
                  Selected Question
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-pine leading-snug">
                  {formatQuestionText(selectedQuestion.question)}
                </h2>
              </div>
            </div>
          </div>

          {/* Answer Box */}
          <div className="rounded-2xl border border-pine/15 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-pine/10 pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sage-light/40 text-sage-dark font-bold text-sm">
                A
              </span>
              <h3 className="font-display text-lg font-semibold text-pine">Answer</h3>
            </div>
            <p className="font-body text-base text-ink/80 leading-relaxed whitespace-pre-line">
              {selectedQuestion.answer}
            </p>

            {/* Practical Advice Callout */}
            {selectedQuestion.advice && (
              <div className="mt-6 rounded-xl border-l-4 border-sunrise bg-sunrise/10 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">💡</span>
                  <div>
                    <h4 className="font-display text-sm font-semibold text-pine">
                      Key Takeaway & Practical Advice
                    </h4>
                    <p className="mt-1 font-body text-sm text-ink/80 leading-relaxed">
                      {selectedQuestion.advice}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions & View Counselors Banner */}
          <div className="rounded-2xl border border-pine/15 bg-gradient-to-r from-mist to-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-display text-base font-semibold text-pine">
                Need Personal Guidance?
              </h4>
              <p className="font-body text-xs text-ink/60 max-w-md leading-relaxed">
                If you would like to discuss your thoughts confidentially with a qualified professional, our campus counselors are available for one-on-one sessions.
              </p>
            </div>
            <button
              onClick={() => navigate("/student/counsellors")}
              className="btn-primary shrink-0 !py-2.5 !px-5 text-sm flex items-center gap-2 shadow-sm"
            >
              <span>◎</span>
              <span>View Counselors</span>
            </button>
          </div>
        </div>
      ) : selectedCategory ? (
        /* ========================================================
           SCREEN 2: QUESTIONS LIST SCREEN (NO NUMBERS)
           ======================================================== */
        <div className="space-y-6">
          {/* Header & Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pine/10 pb-4">
            <div>
              <button
                onClick={handleBackToCategories}
                className="mb-2 inline-flex items-center gap-1.5 rounded-xl border border-pine/15 bg-white px-3 py-1.5 font-body text-xs font-semibold text-pine hover:bg-pine/5 transition"
              >
                ← Back to Categories
              </button>
              <h2 className="font-display text-2xl font-semibold text-pine flex items-center gap-2">
                <span>{categoryIcons[selectedCategory] || "✦"}</span>
                <span>{selectedCategory}</span>
              </h2>
              <p className="font-body text-xs text-ink/60 mt-1">
                Select a question below to read the corresponding wellness answer.
              </p>
            </div>

            {/* Counselors Shortcut */}
            <button
              onClick={() => navigate("/student/counsellors")}
              className="btn-secondary shrink-0 !py-2 !px-4 text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>◎</span>
              <span>View Counselors</span>
            </button>
          </div>

          {/* Search Bar */}
          {questions.length > 0 && (
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions in this category..."
                className="w-full rounded-xl border border-pine/15 bg-white py-2.5 pl-10 pr-4 font-body text-sm text-pine placeholder:text-ink/40 focus:border-pine focus:outline-none transition shadow-sm"
              />
              <span className="absolute left-3.5 top-3 text-ink/40 text-sm">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-ink/40 hover:text-pine"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Questions Grid - IMPORTANT: NO QUESTION NUMBERS */}
          {filteredQuestions.length === 0 ? (
            <div className="rounded-2xl border border-pine/10 bg-white p-8 text-center">
              <p className="font-body text-sm text-ink/60">
                {searchQuery
                  ? "No matching questions found for your search."
                  : "No questions currently available in this category."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 font-body text-xs font-semibold text-pine hover:underline"
                >
                  Clear search filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQuestions.map((q) => (
                <button
                  key={q._id || q.order}
                  onClick={() => handleQuestionClick(q)}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-pine/10 bg-white p-5 text-left transition hover:border-pine/30 hover:shadow-md hover:bg-mist/30"
                >
                  <p className="font-display text-base font-semibold text-pine group-hover:text-sunrise-dark transition leading-snug">
                    {formatQuestionText(q.question)}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-pine/5 pt-3">
                    <span className="font-body text-xs font-semibold text-pine/60 group-hover:text-pine group-hover:translate-x-1 transition flex items-center gap-1">
                      <span>Read Answer</span>
                      <span>→</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
           SCREEN 1: CATEGORIES SCREEN (10 CATEGORIES)
           ======================================================== */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pine/10 pb-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-pine">
                Wellness Categories
              </h2>
              <p className="font-body text-sm text-ink/60 mt-1">
                Select a topic category to browse questions and read wellness information.
              </p>
            </div>
            <button
              onClick={() => navigate("/student/counsellors")}
              className="btn-secondary shrink-0 !py-2 !px-4 text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>◎</span>
              <span>View Counselors</span>
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-pine/10 bg-white p-8 text-center">
              <p className="font-body text-sm text-ink/60">No categories found.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const name = typeof cat === "string" ? cat : cat.name;
                const desc = typeof cat === "object" ? cat.description : "";
                const icon = categoryIcons[name] || "✦";

                return (
                  <button
                    key={name}
                    onClick={() => handleCategoryClick(name)}
                    className="group flex flex-col justify-between rounded-2xl border border-pine/10 bg-white p-6 text-left transition hover:border-pine/30 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-mist text-2xl group-hover:bg-pine/10 transition">
                        {icon}
                      </div>
                      <h3 className="font-display text-lg font-semibold text-pine group-hover:text-sunrise-dark transition">
                        {name}
                      </h3>
                      {desc && (
                        <p className="mt-2 font-body text-xs text-ink/70 leading-relaxed">
                          {desc}
                        </p>
                      )}
                    </div>
                    <div className="mt-5 flex items-center gap-1 font-body text-xs font-semibold text-pine/70 group-hover:text-pine">
                      <span>Browse Questions</span>
                      <span className="group-hover:translate-x-1 transition">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default QAWellnessInfo;
