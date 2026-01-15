"use client";

import { useEffect, useState } from "react";

type Subject = {
  id: string;
  name: string;
};

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubjects = async () => {
    const res = await fetch("/api/subjects/joined");
    const data = await res.json();
    if (res.ok) setSubjects(data.subjects);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const joinSubject = async () => {
    if (!joinCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subjects/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to join");
        return;
      }

      setJoinCode("");
      fetchSubjects();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        My Subjects
      </h1>

      {/* Join Subject */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter join code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={joinSubject}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join"}
        </button>
      </div>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {/* Joined Subjects */}
      {subjects.length === 0 ? (
        <p className="text-gray-500">
          You haven’t joined any subjects yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {subjects.map((subj) => (
            <li
              key={subj.id}
              className="border rounded p-4 bg-white"
            >
              {subj.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}