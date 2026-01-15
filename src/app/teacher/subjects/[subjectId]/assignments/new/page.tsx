"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title || !deadline || !file) {
      setError("Title, deadline and PDF file are required");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Ask backend for S3 upload URL
      const uploadRes = await fetch(
        "/api/assignments/upload-url",
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
        setError(uploadData.message || "Failed to get upload URL");
        return;
      }

      const { uploadUrl, fileKey } = uploadData;

      // 2️⃣ Upload file directly to S3
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!s3Res.ok) {
        setError("Failed to upload file to S3");
        return;
      }

      // 3️⃣ Create assignment in backend
      const createRes = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          title,
          description,
          deadline,
          fileKey,
          fileName: file.name,
          fileType: file.type,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        setError(createData.message || "Failed to create assignment");
        return;
      }

      // 4️⃣ Redirect back to subject page
      router.push(`/teacher/subjects/${subjectId}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Create Assignment
      </h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Assignment title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          placeholder="Assignment description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 min-h-[100px]"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setFile(e.target.files ? e.target.files[0] : null)
          }
          className="w-full"
        />

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Assignment"}
        </button>
      </div>
    </div>
  );
}