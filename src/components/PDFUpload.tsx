"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import type { ResumeData } from "@/lib/types";

interface PDFUploadProps {
  onExtracted: (data: Partial<ResumeData>) => void;
  onError: (msg: string) => void;
}

export default function PDFUpload({ onExtracted, onError }: PDFUploadProps) {
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.name.endsWith(".pdf")) {
        onError("Please upload a PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        onError("File must be under 5MB");
        return;
      }

      setFileName(file.name);
      setProcessing(true);

      try {
        const formData = new FormData();
        formData.append("pdf", file);

        const res = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to process PDF");
        }

        const { data } = await res.json();
        onExtracted(data);
      } catch (err: any) {
        onError(err.message || "Failed to process PDF");
      } finally {
        setProcessing(false);
      }
    },
    [onExtracted, onError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: processing,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? "#b08d57" : "#d4cfc8"}`,
        borderRadius: 8,
        padding: "32px 24px",
        textAlign: "center",
        cursor: processing ? "wait" : "pointer",
        background: isDragActive ? "#b08d5708" : "#faf8f5",
        transition: "all 0.2s ease",
      }}
    >
      <input {...getInputProps()} />
      {processing ? (
        <div>
          <div
            style={{
              width: 32,
              height: 32,
              margin: "0 auto 12px",
              border: "3px solid #e8e2da",
              borderTopColor: "#1e2a3a",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p
            style={{
              fontSize: "0.85rem",
              color: "#1b1b1b",
              fontWeight: 500,
            }}
          >
            Extracting resume data from {fileName}...
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b6560", marginTop: 4 }}>
            AI is reading your resume. This takes a few seconds.
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b08d57"
            strokeWidth="1.5"
            style={{ margin: "0 auto 12px", display: "block" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#1b1b1b",
              fontWeight: 500,
            }}
          >
            {isDragActive ? "Drop your PDF here" : "Drop your resume PDF here"}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b6560", marginTop: 4 }}>
            or click to browse. PDF files up to 5MB.
          </p>
        </div>
      )}
    </div>
  );
}
