import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Loader from "./Loader";

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

const QASection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/wellness/categories");
      const formatted = Array.isArray(response.data)
        ? response.data.map((item) => (typeof item === "string" ? { name: item, description: "" } : item))
        : [];
      setCategories(formatted);
    } catch (err) {
      setError("Unable to load wellness categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (categoryName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/wellness/questions/${encodeURIComponent(categoryName)}`);
      setQuestions(response.data || []);
      setSelectedCategory(categoryName);
      setSelectedQuestion(null);
    } catch (err) {
      setError("Unable to load wellness questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedQuestion(null);
    setQuestions([]);
  };

  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
  };

  const cleanQuestionText = (text) => {
    if (!text) return "";
    return text.replace(/^(Question\s*\d+[\s:-]*|Q\d+[\s:-]*|\d+\.[\s:-]*)/i, "").trim();
  };

  if (loading) {
    return <div className="p-6 flex justify-center"><Loader label="Loading wellness info..." /></div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 rounded-xl bg-red-50 border border-red-200">{error}</div>;
  }

  if (selectedQuestion) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-pine/10 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pine/10 pb-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBackToQuestions} 
              className="rounded-xl border border-pine/15 bg-white px-3 py-1.5 font-body text-xs font-semibold text-pine hover:bg-pine/5 transition"
            >
              ← Back to Questions
            </button>
            <button 
              onClick={handleBackToCategories} 
              className="font-body text-xs text-ink/60 hover:text-pine hover:underline"
            >
              Back to Categories
            </button>
          </div>
          <span className="font-body text-xs text-pine bg-mist px-3 py-1 rounded-full border border-pine/10">
            Category: {selectedCategory}
          </span>
        </div>

        <div className="bg-mist/50 p-5 rounded-xl border border-pine/10">
          <p className="font-body text-xs font-semibold text-pine/60 uppercase tracking-wide mb-1">Selected Question</p>
          <h3 className="text-xl font-display font-semibold text-pine">{cleanQuestionText(selectedQuestion.question)}</h3>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-lg font-display font-semibold text-pine">Answer</h4>
          <p className="text-ink/80 font-body leading-relaxed bg-white p-4 rounded-xl border border-pine/10 whitespace-pre-line">{selectedQuestion.answer}</p>
        </div>
        
        {selectedQuestion.advice && (
          <div className="bg-sunrise/10 p-4 rounded-xl border-l-4 border-sunrise">
            <h4 className="text-sm font-display font-semibold text-pine flex items-center gap-1.5">
              <span>💡</span> Practical Advice
            </h4>
            <p className="text-sm font-body text-ink/80 mt-1 leading-relaxed">{selectedQuestion.advice}</p>
          </div>
        )}

        <div className="pt-4 border-t border-pine/10 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-body text-ink/60">Want personalized confidential support?</span>
          <button
            onClick={() => navigate("/student/counsellors")}
            className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5"
          >
            <span>◎</span> View Counselors
          </button>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-pine/10 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-pine/10 pb-3">
          <button 
            onClick={handleBackToCategories} 
            className="rounded-xl border border-pine/15 bg-white px-3 py-1.5 font-body text-xs font-semibold text-pine hover:bg-pine/5 transition"
          >
            ← Back to Categories
          </button>
          <button
            onClick={() => navigate("/student/counsellors")}
            className="btn-secondary !py-1.5 !px-3 text-xs"
          >
            View Counselors
          </button>
        </div>

        <h2 className="text-2xl font-display font-semibold text-pine flex items-center gap-2">
          <span>{categoryIcons[selectedCategory] || "✦"}</span>
          <span>{selectedCategory}</span>
        </h2>
        
        {questions.length === 0 ? (
          <p className="text-ink/60 font-body">No questions found for this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((q) => (
              <button
                key={q._id || q.order}
                onClick={() => handleQuestionClick(q)}
                className="text-left p-5 rounded-2xl border border-pine/10 hover:border-pine/30 hover:bg-mist/40 transition-all bg-white shadow-sm font-display font-semibold text-pine h-full flex flex-col justify-between"
              >
                <span>{cleanQuestionText(q.question)}</span>
                <span className="mt-3 font-body text-xs text-pine/60 font-medium">Read Answer →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl border border-pine/10 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-pine/10 pb-3">
        <div>
          <h2 className="text-2xl font-display font-semibold text-pine">Q/A Wellness Info Categories</h2>
          <p className="text-xs font-body text-ink/60 mt-1">Select a category to browse questions and read practical advice.</p>
        </div>
        <button
          onClick={() => navigate("/student/counsellors")}
          className="btn-secondary !py-2 !px-4 text-xs"
        >
          View Counselors
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="text-ink/60 font-body">No categories found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const name = typeof cat === "string" ? cat : cat.name;
            const desc = typeof cat === "object" ? cat.description : "";
            return (
              <button
                key={idx}
                onClick={() => handleCategoryClick(name)}
                className="p-5 text-left rounded-2xl border border-pine/10 hover:border-pine/30 hover:shadow-md transition-all bg-white shadow-sm text-pine"
              >
                <div className="text-2xl mb-2">{categoryIcons[name] || "✦"}</div>
                <h3 className="font-display font-semibold text-lg">{name}</h3>
                {desc && <p className="font-body text-xs text-ink/60 mt-1">{desc}</p>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QASection;
