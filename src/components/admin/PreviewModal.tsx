import React, { useMemo } from "react";
import { X } from "lucide-react";
import { Question } from "../../types";

interface PreviewModalProps {
  title: string;
  description: string;
  questions: Question[];
  mode: "create" | "edit";
  onClose: () => void;
  onCreateNew: () => void;
  onUpdate: () => void;
  isSubmitting: boolean;
  completedCount: number;
}

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

  // Only include completed questions in preview
  const completedQuestions = useMemo(() => {
    return questions.filter(
      (q) => q.question.trim() && q.questionCategory && q.questionLevel
    );
  }, [questions]);

  const newQuestions = completedQuestions.filter(q => !q.questionID || q.questionID === "");
  const existingQuestions = completedQuestions.filter(q => q.questionID && q.questionID !== "");

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

          {/* Question List */}
          {completedQuestions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No complete questions found. Please complete at least one question before submitting.
            </p>
          ) : (
            <ul className="space-y-4">
              {completedQuestions.map((q, idx) => (
                <li key={q.questionID || idx} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Question {idx + 1}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {q.questionCategory} / {q.questionLevel}
                      </span>
                      {q.questionID ? (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Existing</span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">New</span>
                      )}
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {q.questionType === "Mcq" ? "Multiple Choice" : "Text Input"}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-900 mb-3">{q.question}</p>
                  
                  {/* Display MCQ options if applicable */}
                  {q.questionType === "Mcq" && q.answers && q.answers.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                      <p className="font-medium text-sm text-gray-700 mb-2">Answer Options:</p>
                      <ul className="space-y-1 pl-4">
                        {q.answers.map((option, optIdx) => (
                          <li key={optIdx} className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-2 ${
                              option.isCorrect ? 'bg-green-500' : 'bg-gray-200'
                            }`}></div>
                            <span className={option.isCorrect ? 'font-medium' : ''}>
                              {option.answer}
                              {option.isCorrect && ' (Correct)'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {completedCount} of {questions.length} questions complete
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              onClick={mode === "create" ? onCreateNew : onUpdate}
              disabled={isSubmitting || completedQuestions.length === 0}
              className={`px-4 py-2 rounded-lg text-white ${
                mode === "create" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : (
                mode === "create" ? "Create Questions" : "Update Questions"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};