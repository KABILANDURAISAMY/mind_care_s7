import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { listStudents } from "../../services/counsellorService.js";

const Students = () => {
  const [students, setStudents] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listStudents().then(setStudents).catch(() => setStudents([]));
  }, []);

  const filtered = (students || []).filter((s) =>
    `${s.name} ${s.rollNumber} ${s.department}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardLayout title="Students" subtitle="Everyone who has booked an appointment with you.">
      {students === null ? (
        <Loader label="Loading students" />
      ) : students.length === 0 ? (
        <EmptyState title="No students yet" description="Students who book with you will appear here." />
      ) : (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, roll number, or department…"
            className="input-field mb-6 max-w-md"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <Link
                key={s._id}
                to={`/counsellor/students/${s._id}`}
                className="card flex items-center gap-4 transition hover:border-sage hover:shadow-soft"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine font-display font-semibold text-mist">
                  {s.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-semibold text-pine">{s.name}</p>
                  <p className="truncate font-body text-xs text-ink/60">{s.department} · {s.rollNumber}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Students;
