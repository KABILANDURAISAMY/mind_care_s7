import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const STUDENT_LINKS = [
  { to: "/student/dashboard", label: "Dashboard", icon: "◈" },
  { to: "/student/counsellors", label: "Counsellors", icon: "◎" },
  { to: "/student/appointments", label: "My Appointments", icon: "▤" },
  { to: "/student/wellness-checkin", label: "Wellness Check-in", icon: "✦" },
  { to: "/student/wellness-history", label: "Wellness History", icon: "≈" },
  { to: "/student/qa-wellness-info", label: "Q/A Wellness Info", icon: "📖" },
  { to: "/student/profile", label: "Profile", icon: "●" },
];

const COUNSELLOR_LINKS = [
  { to: "/counsellor/dashboard", label: "Dashboard", icon: "◈" },
  { to: "/counsellor/appointments", label: "Appointments", icon: "▤" },
  { to: "/counsellor/students", label: "Students", icon: "◎" },
  { to: "/counsellor/availability", label: "Availability", icon: "◷" },
  { to: "/counsellor/profile", label: "Profile", icon: "●" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const profile = user?.profile || {};
  const rawName = profile.name || user?.name || "User";
  const hasDr = /^dr\.?/i.test(rawName);
  const title = profile.title && !hasDr ? `${profile.title} ` : "";
  const displayName = user?.role === "counsellor" ? `${title}${rawName}` : rawName;
  const links = user?.role === "counsellor" ? COUNSELLOR_LINKS : STUDENT_LINKS;

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-pine/10 bg-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pine">
          <span className="h-3 w-3 rounded-full bg-sunrise" />
        </span>
        <span className="font-display text-lg font-semibold text-pine">MindCare</span>
      </div>

      <div className="px-6 pb-4">
        <p className="font-body text-xs uppercase tracking-wide text-ink/40">Signed in as</p>
        <p className="truncate font-body text-sm font-semibold text-pine">{displayName}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium transition ${
                isActive ? "bg-pine text-mist" : "text-ink/70 hover:bg-pine/5 hover:text-pine"
              }`
            }
          >
            <span className="w-4 text-center text-sunrise">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-pine/10 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium text-ink/60 transition hover:bg-pine/5 hover:text-pine"
        >
          <span className="w-4 text-center">↩</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
