import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { studentLogin } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Banner from "../../components/Banner.jsx";

const StudentLogin = () => {
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
      const data = await studentLogin(form);
      login(data.token, data.user);
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-mist to-mist/80 px-6 py-12">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2">
        {/* Left: Login Form */}
        <div className="flex flex-col justify-center">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:justify-start">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pine">
              <span className="h-3 w-3 rounded-full bg-sunrise" />
            </span>
            <span className="font-display text-xl font-semibold text-pine">MindCare</span>
          </Link>

          <div className="card !p-8">
            <h1 className="font-display text-3xl font-semibold text-pine">Welcome back</h1>
            <p className="mt-2 font-body text-sm text-ink/60">
              Sign in to access your wellness dashboard and counselling appointments.
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
                <Link to="/student/register" className="font-semibold text-sunrise hover:text-sunrise-light">
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-5 text-center font-body text-xs text-ink/50">
            Are you a counsellor?{" "}
            <Link to="/counsellor/login" className="font-semibold text-dusk-dark hover:underline">
              Counsellor login
            </Link>
          </p>
        </div>

        {/* Right: Meaningful Illustration */}
        <div className="hidden flex-col items-center justify-center gap-6 lg:flex">
          {/* Shield with Heart - Symbol of Support & Care */}
          <div className="relative flex h-64 w-64 items-center justify-center">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-3xl bg-sage-light/20 blur-3xl" />
            
            {/* Main icon container */}
            <div className="relative flex flex-col items-center gap-4">
              {/* Shield shape */}
              <svg className="h-32 w-32 animate-rise" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shield outline */}
                <path
                  d="M50 10 L85 30 L85 65 Q85 90 50 110 Q15 90 15 65 L15 30 Z"
                  fill="none"
                  stroke="#1F3D3B"
                  strokeWidth="2"
                />
                {/* Heart inside */}
                <path
                  d="M50 45 C50 45, 40 35, 35 40 C32 42, 32 47, 35 50 L50 63 L65 50 C68 47, 68 42, 65 40 C60 35, 50 45, 50 45 Z"
                  fill="#D9A441"
                  opacity="0.9"
                />
              </svg>

              {/* Text below icon */}
              <div className="text-center">
                <h2 className="font-display text-xl font-semibold text-pine">Your Wellness Matters</h2>
                <p className="mt-2 max-w-xs font-body text-sm text-ink/65">
                  Track your mental health, book counselling sessions, and build a support network.
                </p>
              </div>

              {/* Features list */}
              <div className="mt-6 space-y-2 text-left">
                <div className="flex items-center gap-2 font-body text-sm text-ink/70">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sunrise/20 text-sunrise">✓</span>
                  Private & Confidential
                </div>
                <div className="flex items-center gap-2 font-body text-sm text-ink/70">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage/20 text-sage-dark">✓</span>
                  Real-time Appointments
                </div>
                <div className="flex items-center gap-2 font-body text-sm text-ink/70">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-dusk/20 text-dusk">✓</span>
                  Wellness Tracking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
