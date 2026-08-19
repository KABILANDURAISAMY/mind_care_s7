import React from "react";

const EmptyState = ({ title, description, action }) => (
  <div className="card flex flex-col items-center gap-2 py-14 text-center">
    <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-sage-light/40 text-xl text-sage-dark">
      ○
    </span>
    <p className="font-display text-lg font-semibold text-pine">{title}</p>
    {description && <p className="max-w-sm font-body text-sm text-ink/60">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export default EmptyState;
