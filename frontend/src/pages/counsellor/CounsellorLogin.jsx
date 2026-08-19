import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { counsellorLogin } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Banner from "../../components/Banner.jsx";

const CounsellorLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await counsellorLogin(form);
      login(data.token, data.user);
      navigate("/counsellor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pine to-pine-light px-6 py-12">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2">
        {/* Left: Meaningful Illustration */}
        <div className="hidden flex-col items-center justify-center gap-6 lg:flex">
          {/* Professional Support Icon */}
          <div className="relative flex h-64 w-64 items-center justify-center">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-3xl bg-mist/10 blur-3xl" />
            
            {/* Main icon container */}
            <div className="relative flex flex-col items-center gap-4">
              {/* Professional icon - Person with hands together */}
              <svg className="h-32 w-32 animate-rise" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Head */}
                <circle cx="50" cy="25" r="12" fill="#F2F4EF" stroke="#1F3D3B" strokeWidth="1.5" />
                {/* Body */}
                <rect x="42" y="40" width="16" height="20" rx="2" fill="#F2F4EF" stroke="#1F3D3B" strokeWidth="1.5" />
                {/* Left arm */}
                <path d="M42 45 L25 55" stroke="#D9A441" strokeWidth="3" strokeLinecap="round" />
                {/* Right arm */}
                <path d="M58 45 L75 55" stroke="#D9A441" strokeWidth="3" strokeLinecap="round" />
                {/* Left hand */}
                <circle cx="22" cy="58" r="4" fill="#D9A441" />
                {/* Right hand */}
                <circle cx="78" cy="58" r="4" fill="#D9A441" />
                {/* Legs */}
                <line x1="45" y1="60" x2="42" y2="85" stroke="#1F3D3B" strokeWidth="2" strokeLinecap="round" />
                <line x1="55" y1="60" x2="58" y2="85" stroke="#1F3D3B" strokeWidth="2" strokeLinecap="round" />
                {/* Heart on chest */}
                <path
                  d="M50 50 C50 50, 47 48, 45 49 C43.5 49.5, 43.5 51, 45 52 L50 56 L55 52 C56.5 51, 56.5 49.5, 55 49 C53 48, 50 50, 50 50 Z"
                  fill="#D9A441"
                />
              </svg>

              {/* Text below icon */}
              <div className="text-center">
                <h2 className="font-display text-xl font-semibold text-mist">Support & Care</h2>
                <p className="mt-2 max-w-xs font-body text-sm text-mist/80">
                  Manage student appointments, track wellness trends, and provide meaningful support.
                </p>
              </div>

              {/* Features list */}
              <div className="mt-6 space-y-2 text-left">
                <div className="flex items-center gap-2 font-body text-sm text-mist/85">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sunrise/30 text-sunrise">✓</span>
                  Student Schedules
                </div>
                <div className="flex items-center gap-2 font-body text-sm text-mist/85">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage/30 text-sage">✓</span>
                  Wellness Analytics
                </div>
                <div className="flex items-center gap-2 font-body text-sm text-mist/85">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-dusk/30 text-dusk-light">✓</span>
                  Secure Communication
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex flex-col justify-center">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:justify-end">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mist">
              <span className="h-3 w-3 rounded-full bg-sunrise" />
            </span>
            <span className="font-display text-xl font-semibold text-mist">MindCare</span>
          </Link>

          <div className="card !p-8">
            <h1 className="font-display text-3xl font-semibold text-pine">Counsellor Portal</h1>
            <p className="mt-2 font-body text-sm text-ink/60">
              Sign in to manage appointments and support your students' wellness journey.
            </p>

            {error && <div className="mt-5"><Banner type="error">{error}</Banner></div>}

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label className="label-field">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="your.email@college.edu"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label-field">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3 disabled:opacity-60">
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-6 border-t border-pine/10 pt-6">
              <p className="text-center font-body text-sm text-ink/60">
                Don't have an account?{" "}
                <Link to="/counsellor/register" className="font-semibold text-sunrise hover:text-sunrise-light">
                  Register here
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-5 text-center font-body text-xs text-mist/70">
            Are you a student?{" "}
            <Link to="/student/login" className="font-semibold text-mist hover:underline">
              Student login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CounsellorLogin;
