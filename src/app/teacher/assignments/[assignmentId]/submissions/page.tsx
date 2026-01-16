"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Submission = {
  id: string;
  student: {
    name: string;
    email: string;
  };
  status: "DRAFT" | "SUBMITTED" | "LOCKED" | "GRADED";
  submittedAt?: string;
};

export default function TeacherSubmissionsPage() {
  const { assignmentId } = useParams() as {
    assignmentId: string;
  };

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(
          `/api/assignments/${assignmentId}/submissions`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load submissions");
          return;
        }

        setSubmissions(data.submissions);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  if (loading) {
    return <div className="p-6">Loading submissions...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Student Submissions
      </h1>

      {submissions.length === 0 ? (
        <p className="text-gray-500">
          No submissions yet.
        </p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {s.student.name}
                </p>
                <p className="text-sm text-gray-600">
                  {s.student.email}
                </p>
                {s.submittedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted at{" "}
                    {new Date(s.submittedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <span
                className={`px-2 py-1 text-xs rounded ${
                  s.status === "SUBMITTED"
                    ? "bg-green-100 text-green-700"
                    : s.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}