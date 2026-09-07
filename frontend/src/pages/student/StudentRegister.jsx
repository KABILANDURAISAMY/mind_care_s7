import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { studentRegister } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Banner from "../../components/Banner.jsx";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  rollNumber: "",
  department: "",
  year: "",
  phone: "",
};

const StudentRegister = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const data = await studentRegister(form);
      login(data.token, data.user);
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-6 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pine">
            <span className="h-3 w-3 rounded-full bg-sunrise" />
          </span>
          <span className="font-display text-xl font-semibold text-pine">MindCare</span>
        </Link>

        <div className="card !p-8">
          <h1 className="font-display text-2xl font-semibold text-pine">Create your student account</h1>
          <p className="mt-1 font-body text-sm text-ink/60">Takes about a minute. All fields are required.</p>

          {error && <div className="mt-5"><Banner type="error">{error}</Banner></div>}

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-field">Full name</label>
              <input name="name" required value={form.name} onChange={handleChange} className="input-field" placeholder="Arun Kumar" />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">College email</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className="input-field" placeholder="you@college.edu" />
            </div>
            <div>
              <label className="label-field">Password</label>
              <input type="password" name="password" required value={form.password} onChange={handleChange} className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label className="label-field">Confirm password</label>
              <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label className="label-field">Roll number</label>
              <input name="rollNumber" required value={form.rollNumber} onChange={handleChange} className="input-field" placeholder="22CS101" />
            </div>
            <div>
              <label className="label-field">Department</label>
              <input name="department" required value={form.department} onChange={handleChange} className="input-field" placeholder="CSE" />
            </div>
            <div>
              <label className="label-field">Year</label>
              <select name="year" required value={form.year} onChange={handleChange} className="input-field">
                <option value="">Select year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
            <div>
              <label className="label-field">Phone number</label>
              <input name="phone" required value={form.phone} onChange={handleChange} className="input-field" placeholder="9840012345" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary sm:col-span-2 mt-2 !py-3 disabled:opacity-60">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-ink/60">
            Already have an account?{" "}
            <Link to="/student/login" className="font-semibold text-dusk-dark underline underline-offset-2">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
