import React from "react";

const Loader = ({ label = "Loading" }) => (
  <div className="flex items-center justify-center gap-3 py-16 text-pine/70">
    <span className="h-2.5 w-2.5 animate-breathe rounded-full bg-sunrise" />
    <span className="font-body text-sm">{label}…</span>
  </div>
);

export default Loader;
