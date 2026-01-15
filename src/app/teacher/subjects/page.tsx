"use client";

import { useEffect, useState } from "react";

type Subject = {
  _id: string;
  name: string;
  joinCode: string;
  createdAt: string;
};

export default function TeacherSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newSubject, setNewSubject] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("/api/subjects");
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load subjects");
          return;
        }

        setSubjects(data.subjects);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Create subject
  const createSubject = async () => {
    if (!newSubject.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubject }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create subject");
        return;
      }

      setSubjects((prev) => [
        {
          _id: data.id,
          name: data.name,
          joinCode: data.joinCode,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setNewSubject("");
    } catch {
      setError("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600">Loading subjects...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Your Subjects
      </h1>

      {/* Create Subject */}
      <div className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="New subject name"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={createSubject}
          disabled={creating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <p className="text-gray-500">
          No subjects created yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <h2 className="text-lg font-medium">
                {subject.name}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Join Code
              </p>

              <div className="mt-1 font-mono text-lg tracking-wider">
                {subject.joinCode}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}