import React, { useMemo } from "react";
import { X } from "lucide-react";
import { Question } from "../../types";

interface PreviewModalProps {
  title: string;
  description: string;
  questions: Question[];
  mode: "create" | "edit";
  onClose(): void;
  onCreateNew(): void;
  onUpdate(): void;
  isSubmitting: boolean;
  completedCount: number;
}

const QuestionItem: React.FC<{ q: Question; index: number }> = ({
  q,
  index,
}) => (
  <li className="border rounded p-4">
    <div className="flex justify-between items-center mb-2">
      <span className="font-medium">Question {index + 1}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {q.questionCategory || "—"} / {q.questionLevel || "—"}
        </span>
        {q._id && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Existing
          </span>
        )}
        {!q._id && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            New
          </span>
        )}
      </div>
    </div>
    <p className="text-gray-800">
      {q.question.trim() ? (
        q.question
      ) : (
        <span className="italic text-gray-400">No text</span>
      )}
    </p>
  </li>
);

export const PreviewModal: React.FC<PreviewModalProps> = ({
  title,
  description,
  questions,
  mode,
  onClose,
  onCreateNew,
  onUpdate,
  isSubmitting,
  completedCount,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAction = () => {
    if (completedCount === 0) return;
    if (mode === "create") {
      onCreateNew();
    } else {
      onUpdate();
    }
  };

  const questionList = useMemo(() => {
    return questions.map((q, idx) => (
      <QuestionItem key={q._id || idx} q={q} index={idx} />
    ));
  }, [questions]);

  const newQuestions = questions.filter(q => !q._id || q._id === "");
  const existingQuestions = questions.filter(q => q._id && q._id !== "");

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
          
          {/* Mode Information */}
          <div className="mb-4 p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                Mode: {mode === "create" ? "Create New Survey" : "Edit Existing Survey"}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                mode === "create" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              }`}>
                {mode === "create" ? "POST" : "PUT"}
              </span>
            </div>
            
            {mode === "edit" && (
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Existing questions: {existingQuestions.length} (will be updated)</p>
                <p>• New questions: {newQuestions.length} (will be created)</p>
              </div>
            )}
          </div>

          {questions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No questions added yet.
            </p>
          ) : (
            <ul className="space-y-4">{questionList}</ul>
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
              onClick={handleAction}
              disabled={isSubmitting || completedCount === 0}
              className={`px-4 py-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition ${
                mode === "create" 
                  ? "bg-green-600 hover:bg-green-700 disabled:hover:bg-green-600" 
                  : "bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? 
                (mode === "create" ? "Creating…" : "Updating…") : 
                (mode === "create" ? "Create New Survey" : "Update Survey")
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};