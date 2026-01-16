"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Subject = {
  _id: string;
  name: string;
  joinCode: string;
};

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (res.ok) setSubjects(data.subjects);
      setLoading(false);
    };

    fetchSubjects();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Teacher Dashboard
        </h1>

        <Link
          href="/teacher/subjects"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Subject
        </Link>
      </div>

      {loading ? (
        <p>Loading subjects...</p>
      ) : subjects.length === 0 ? (
        <p className="text-gray-500">
          No subjects created yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {subjects.map((s) => (
            <Link
              key={s._id}
              href={`/teacher/subjects/${s._id}`}
              className="border rounded p-4 hover:bg-gray-50"
            >
              <h2 className="font-medium">{s.name}</h2>
              <p className="text-sm text-gray-600">
                Join Code: {s.joinCode}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}