import React, { useState } from "react";
import Modal from "./Modal.jsx";
import Banner from "./Banner.jsx";
import { submitFeedback } from "../services/studentService.js";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const CounsellorFeedbackModal = ({ counsellor, onClose, onSubmitSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!counsellor) return null;

  const displayName = counsellor.title ? `${counsellor.title} ${counsellor.name}` : counsellor.name;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setLoading(true);
    try {
      await submitFeedback({
        counsellorId: counsellor._id,
        rating,
        comment,
      });
      onSubmitSuccess && onSubmitSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <Modal open={true} onClose={onClose} title={`Feedback & Rating for ${displayName}`}>
      <div className="space-y-4">
        <p className="font-body text-sm text-ink/70">
          Share your general feedback or rating for <strong className="text-pine">{displayName}</strong>.
          Your feedback helps us continuously improve student care.
        </p>

        {error && <Banner type="error">{error}</Banner>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating Section */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-mist p-4">
            <span className="mb-2 font-body text-xs uppercase tracking-wide text-ink/50">Overall Rating</span>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl transition transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} star rating`}
                >
                  <span className={star <= activeRating ? "text-sunrise" : "text-gray-300"}>★</span>
                </button>
              ))}
            </div>

            <span className="mt-2 font-body text-sm font-semibold text-pine">
              {activeRating ? `${activeRating} Star${activeRating > 1 ? "s" : ""} - ${RATING_LABELS[activeRating]}` : "Select rating"}
            </span>
          </div>

          {/* Comment / Feedback details */}
          <div>
            <label className="label-field">Your Feedback / Comments (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field min-h-[90px] resize-none"
              placeholder="What do you think of this counsellor's guidance or expertise?"
              rows={3}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary !py-2.5 !px-5 text-sm disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CounsellorFeedbackModal;
