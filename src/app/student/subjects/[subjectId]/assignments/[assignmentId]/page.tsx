"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StudentAssignmentPage() {
  const { subjectId, assignmentId } = useParams() as {
    subjectId: string;
    assignmentId: string;
  };

  const [textAnswer, setTextAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "DRAFT" | "SUBMITTED" | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch existing submission on load
  useEffect(() => {
    const fetchSubmission = async () => {
      const res = await fetch(
        `/api/submissions?assignmentId=${assignmentId}`
      );
      const data = await res.json();

      if (res.ok && data.submission) {
        setSubmissionId(data.submission._id);
        setTextAnswer(data.submission.textAnswer || "");
        setStatus(data.submission.status);
      }
    };

    fetchSubmission();
  }, [assignmentId]);

  // 🔹 Auto-save draft
  const saveDraft = async (
    payload: Record<string, any>
  ) => {
    setSaving(true);
    setError(null);

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        ...payload,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setSubmissionId(data.submissionId);
      setStatus("DRAFT");
    } else {
      setError(data.message || "Failed to save draft");
    }

    setSaving(false);
  };

  // 🔹 Handle file upload
  const handleFileUpload = async (file: File) => {
    setFile(file);

    // 1️⃣ Get upload URL
    const uploadRes = await fetch(
      "/api/submissions/upload-url",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      }
    );

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      setError(uploadData.message);
      return;
    }

    // 2️⃣ Upload to S3
    await fetch(uploadData.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    // 3️⃣ Save draft with file
    await saveDraft({
      fileKey: uploadData.fileKey,
      fileName: file.name,
      fileType: file.type,
    });
  };

  // 🔹 Submit final
  const submitFinal = async () => {
    if (!submissionId) return;

    const res = await fetch(
      `/api/submissions/${submissionId}/submit`,
      { method: "PATCH" }
    );

    if (res.ok) {
      setStatus("SUBMITTED");
    } else {
      setError("Failed to submit");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Your Submission
      </h1>

      {status && (
        <p className="mb-4 text-sm">
          Status:{" "}
          <span className="font-medium">{status}</span>
          {saving && " (saving...)"}
        </p>
      )}

      <textarea
        value={textAnswer}
        onChange={(e) => {
          setTextAnswer(e.target.value);
          saveDraft({ textAnswer: e.target.value });
        }}
        placeholder="Write your answer here (optional)"
        className="w-full border rounded p-3 min-h-[120px]"
        disabled={status === "SUBMITTED"}
      />

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) =>
          e.target.files &&
          handleFileUpload(e.target.files[0])
        }
        disabled={status === "SUBMITTED"}
        className="mt-4"
      />

      {error && (
        <p className="text-red-600 mt-3">{error}</p>
      )}

      <button
        onClick={submitFinal}
        disabled={status === "SUBMITTED"}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        Submit Final
      </button>
    </div>
  );
}