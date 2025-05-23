// src/components/admin/PreviewModal.tsx
import React from "react";
import { X } from "lucide-react";
import { Question } from "../../type";

interface PreviewModalProps {
  title: string;
  description: string;
  questions: Question[];
  onClose(): void;
  onPublish(): void;
  isPublishing: boolean;
  completedCount: number;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  title,
  description,
  questions,
  onClose,
  onPublish,
  isPublishing,
  completedCount,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePublish = () => {
    if (completedCount === 0) return;
    onPublish();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{title} Preview</h2>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <p className="mb-4 text-gray-700">{description}</p>
          {questions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No questions added yet.</p>
          ) : (
            <ul className="space-y-4">
              {questions.map((q, idx) => (
                <li key={q.id} className="border rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Question {idx + 1}</span>
                    <span className="text-sm text-gray-500">
                      {q.category || "—"} / {q.level || "—"}
                    </span>
                  </div>
                  <p className="text-gray-800">
                    {q.question.trim() ? (
                      q.question
                    ) : (
                      <span className="italic text-gray-400">No text</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {completedCount}/{questions.length} complete
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Close
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || completedCount === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50 hover:bg-purple-700 disabled:hover:bg-purple-600 disabled:cursor-not-allowed transition"
            >
              {isPublishing ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
