import React from "react";
import Sidebar from "./Sidebar.jsx";

/**
 * Shared shell for every authenticated page: fixed sidebar + scrollable
 * content area with a consistent page heading.
 */
const DashboardLayout = ({ title, subtitle, actions, children }) => (
  <div className="flex min-h-screen bg-mist">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-pine">{title}</h1>
            {subtitle && <p className="mt-1 font-body text-ink/60">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </main>
  </div>
);

export default DashboardLayout;
