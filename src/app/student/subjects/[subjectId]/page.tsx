"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Assignment = {
    _id: string;
    title: string;
    description?: string;
    deadline: string;
    fileUrl: string;
    fileName: string;
};

export default function StudentSubjectAssignmentsPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await fetch(
                    `/api/student/subjects/${subjectId}/assignments`
                );
                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || "Failed to load assignments");
                    return;
                }

                setAssignments(data.assignments);
            } catch {
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [subjectId]);

    if (loading) {
        return <div className="p-6">Loading assignments...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-6">
                Assignments
            </h1>

            {assignments.length === 0 ? (
                <p className="text-gray-500">
                    No assignments published yet.
                </p>
            ) : (
                <div className="space-y-4">
                    {assignments.map((a) => (
                        <div
                            key={a._id}
                            className="border rounded-lg p-4 bg-white"
                        >
                            <h2 className="text-lg font-medium">
                                {a.title}
                            </h2>

                            {a.description && (
                                <p className="text-gray-700 mt-1">
                                    {a.description}
                                </p>
                            )}

                            <p className="text-sm text-gray-600 mt-2">
                                Due:{" "}
                                {new Date(a.deadline).toLocaleDateString()}
                            </p>

                            <button
                                onClick={async () => {
                                    const res = await fetch(`/api/assignments/${a._id}/download`);
                                    const data = await res.json();
                                    if (res.ok) window.open(data.url, "_blank");
                                }}
                                className="text-blue-600 underline"
                            >
                                Download {a.fileName}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}