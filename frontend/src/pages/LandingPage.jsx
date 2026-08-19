import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const FLOW_STEPS = [
  { label: "Create your account", detail: "Register with your college email and roll number in under a minute." },
  { label: "Find a counsellor", detail: "Browse specializations and see real, live availability — no back-and-forth." },
  { label: "Book in advance", detail: "Pick a date and time, note what's on your mind, and you're booked." },
  { label: "Check in daily", detail: "A 10-question wellness check-in keeps a quiet record of how you're doing." },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-mist">
      <Navbar />

      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="animate-rise">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-sage/40 bg-sage-light/30 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-pine-dark">
              Built for your institution
            </span>
            <h1 className="font-display text-5xl font-semibold leading-[1.08] tracking-tight text-pine md:text-6xl">
              Support that fits
              <br />
              between classes.
            </h1>
            <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-ink/70">
              MindCare makes it simple to book confidential counselling appointments
              and keep a private, day-by-day picture of how you're really doing —
              so patterns show up before they become a crisis.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/student/register" className="btn-primary">
                I'm a student — get started
              </Link>
              <Link to="/counsellor/register" className="btn-secondary">
                I'm a counsellor
              </Link>
            </div>
            <p className="mt-5 font-body text-sm text-ink/50">
              Already registered?{" "}
              <Link to="/student/login" className="font-semibold text-dusk-dark underline underline-offset-2">
                Student login
              </Link>{" "}
              ·{" "}
              <Link to="/counsellor/login" className="font-semibold text-dusk-dark underline underline-offset-2">
                Counsellor login
              </Link>
            </p>
          </div>

          {/* Signature element: a slow "breathing" rhythm — the app's one visual metaphor */}
          <div className="relative flex h-80 items-center justify-center md:h-[26rem]" aria-hidden="true">
            <div className="absolute h-64 w-64 animate-breatheOuter rounded-full bg-sage md:h-80 md:w-80" />
            <div className="absolute h-48 w-48 animate-breathe rounded-full bg-sage-light/70 md:h-60 md:w-60" />
            <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full bg-pine shadow-soft md:h-44 md:w-44">
              <span className="font-display text-3xl font-semibold text-mist md:text-4xl">72</span>
              <span className="font-body text-xs tracking-wide text-mist/70">wellness score</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-pine/10 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 max-w-xl">
            <h2 className="font-display text-3xl font-semibold text-pine md:text-4xl">
              From first login to first session, in four steps.
            </h2>
          </div>

          <div className="relative grid gap-10 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-pine/15 md:block" />
            {FLOW_STEPS.map((step, i) => (
              <div key={step.label} className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-sunrise bg-mist font-display text-sm font-semibold text-pine">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-pine">{step.label}</h3>
                <p className="font-body text-sm leading-relaxed text-ink/65">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- FOR STUDENTS / COUNSELLORS */}
      <section className="py-24">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <div id="for-students" className="card !p-8">
            <span className="font-body text-xs font-semibold uppercase tracking-wide text-sage-dark">For students</span>
            <h3 className="mt-2 font-display text-2xl font-semibold text-pine">Your appointments, your pace.</h3>
            <ul className="mt-5 space-y-3 font-body text-sm text-ink/70">
              <li className="flex gap-3"><span className="text-sunrise">✦</span>See real-time counsellor availability, no guesswork.</li>
              <li className="flex gap-3"><span className="text-sunrise">✦</span>Cancel freely, right up until 20 minutes before your slot.</li>
              <li className="flex gap-3"><span className="text-sunrise">✦</span>A private 10-question daily check-in — never shared beyond your counsellor.</li>
              <li className="flex gap-3"><span className="text-sunrise">✦</span>Watch your own wellness trend over weeks, not just days.</li>
            </ul>
            <Link to="/student/register" className="btn-primary mt-7 !px-5 !py-2.5 text-sm">Create student account</Link>
          </div>

          <div id="for-counsellors" className="card !p-8">
            <span className="font-body text-xs font-semibold uppercase tracking-wide text-dusk-dark">For counsellors</span>
            <h3 className="mt-2 font-display text-2xl font-semibold text-pine">Context before every session.</h3>
            <ul className="mt-5 space-y-3 font-body text-sm text-ink/70">
              <li className="flex gap-3"><span className="text-sunrise">✦</span>Walk in knowing a student's stated reason and history.</li>
              <li className="flex gap-3"><span className="text-sunrise">✦</span>Set your own availability in minutes; booked slots close automatically.</li>
              <li className="flex gap-3"><span className="text-sunrise">✦</span>Spot wellness trends across sessions, not just within one.</li>
              <li className="flex gap-3"><span className="text-sunrise">✦</span>One dashboard for today's, upcoming, and completed sessions.</li>
            </ul>
            <Link to="/counsellor/register" className="btn-secondary mt-7 !px-5 !py-2.5 text-sm">Create counsellor account</Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- FOOTER */}
      <footer className="border-t border-pine/10 bg-pine py-12 text-mist/80">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mist/10">
                <span className="h-2.5 w-2.5 rounded-full bg-sunrise" />
              </span>
              <span className="font-display text-lg font-semibold text-mist">MindCare</span>
            </div>
            <p className="max-w-md font-body text-xs leading-relaxed text-mist/60">
              MindCare is a wellness self-check and appointment-booking tool, not a
              medical diagnostic service. If you are in crisis or need immediate
              help, please contact your campus emergency line or local emergency
              services right away.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
