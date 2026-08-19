import React from "react";

const StatCard = ({ label, value, accent = "pine" }) => {
  const accentClasses = {
    pine: "text-pine",
    sunrise: "text-sunrise-dark",
    sage: "text-sage-dark",
    dusk: "text-dusk-dark",
  };

  return (
    <div className="card flex flex-col gap-1">
      <span className="font-body text-sm text-ink/60">{label}</span>
      <span className={`font-display text-4xl font-semibold ${accentClasses[accent] || accentClasses.pine}`}>
        {value}
      </span>
    </div>
  );
};

export default StatCard;
