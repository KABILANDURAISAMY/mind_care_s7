import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <header className="sticky top-0 z-40 border-b border-pine/10 bg-mist/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link to="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pine">
          <span className="h-3 w-3 rounded-full bg-sunrise" />
        </span>
        <span className="font-display text-xl font-semibold tracking-tight text-pine">MindCare</span>
      </Link>
      <nav className="hidden items-center gap-8 font-body text-sm font-medium text-pine/80 md:flex">
        <a href="#how-it-works" className="hover:text-pine">How it works</a>
        <a href="#for-students" className="hover:text-pine">For students</a>
        <a href="#for-counsellors" className="hover:text-pine">For counsellors</a>
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/student/login" className="btn-ghost text-sm">Student login</Link>
        <Link to="/counsellor/login" className="btn-secondary !px-4 !py-2 text-sm">Counsellor login</Link>
      </div>
    </div>
  </header>
);

export default Navbar;
