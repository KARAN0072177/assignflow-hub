"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Subject = {
  name: string;
  joinCode: string;
};

type Assignment = {
  _id: string;
  title: string;
  deadline: string;
  status: "DRAFT" | "PUBLISHED";
};

export default function TeacherSubjectDetailPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  // ✅ ALL hooks at top
  const [subject, setSubject] = useState<Subject | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subject
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load subject");
          return;
        }

        setSubject(data.subject);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [subjectId]);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      const res = await fetch(`/api/subjects/${subjectId}/assignments`);
      const data = await res.json();
      if (res.ok) setAssignments(data.assignments);
    };

    fetchAssignments();
  }, [subjectId]);

  // --- Conditional UI ---
  if (loading) return <div className="p-6">Loading subject...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!subject) return null;

  // Publish assignment
  const publishAssignment = async (id: string) => {
    await fetch(`/api/assignments/${id}/publish`, {
      method: "PATCH",
    });

    setAssignments((prev) =>
      prev.map((a) =>
        a._id === id ? { ...a, status: "PUBLISHED" } : a
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">
        {subject.name}
      </h1>

      <p className="text-gray-600 mb-6">
        Join Code:
        <span className="font-mono tracking-wider ml-2">
          {subject.joinCode}
        </span>
      </p>

      <Link
        href={`/teacher/subjects/${subjectId}/assignments/new`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Assignment
      </Link>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Assignments
        </h2>

        {assignments.length === 0 ? (
          <p className="text-gray-500">
            No assignments created yet.
          </p>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => (
              <div
                key={a._id}
                className="border rounded p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{a.title}</h3>
                  <p className="text-sm text-gray-600">
                    Deadline:{" "}
                    {new Date(a.deadline).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      a.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {a.status}
                  </span>

                  {a.status === "DRAFT" && (
                    <button
                      onClick={() => publishAssignment(a._id)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Publish
                    </button>
                  )}

                  {/* ✅ View submissions */}
                  <Link
                    href={`/teacher/assignments/${a._id}/submissions`}
                    className="text-sm text-blue-600 underline"
                  >
                    View Submissions
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}