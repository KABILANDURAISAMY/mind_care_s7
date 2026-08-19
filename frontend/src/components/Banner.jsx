import React from "react";

/**
 * Inline success / error / info banner used across forms and dashboards.
 * Kept intentionally simple and reused everywhere instead of a toast
 * library, so messages never get missed off-screen.
 */
const STYLES = {
  error: "bg-red-50 text-red-700 border-red-200",
  success: "bg-sage-light/40 text-pine-dark border-sage",
  info: "bg-dusk-light/30 text-dusk-dark border-dusk-light",
};

const Banner = ({ type = "info", children, onClose }) => (
  <div className={`mb-4 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 font-body text-sm ${STYLES[type]}`}>
    <span>{children}</span>
    {onClose && (
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Dismiss">
        ✕
      </button>
    )}
  </div>
);

export default Banner;
