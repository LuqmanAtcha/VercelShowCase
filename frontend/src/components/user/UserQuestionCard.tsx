// src/components/user/UserQuestionCard.tsx
import React from "react";

interface UserQuestionCardProps {
  questions: any[];
  answers: string[];
  index: number;
  error: string;
  showPreviewDialog: boolean;
  answeredCount: number;
  onAnswerChange: (value: string) => void;
  onSaveNext: () => void;
  onSkip: () => void;
  onPublish: () => void;
  onClosePreview: () => void;
  onLogout: () => void;
}

const UserQuestionCard: React.FC<UserQuestionCardProps> = ({
  questions,
  answers,
  index,
  error,
  showPreviewDialog,
  answeredCount,
  onAnswerChange,
  onSaveNext,
  onSkip,
  onPublish,
  onClosePreview,
  onLogout,
}) => {
  return (
    <main className="flex-grow flex items-center justify-center px-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-2xl relative border border-purple-100">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl"></div>

        {/* Level Badge & Logout */}
        <div className="relative flex justify-between items-start mb-8">
          <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
            {questions[index].questionLevel} Level
          </span>
          <button
            onClick={onLogout}
            className="text-sm text-red-500 hover:text-red-600 hover:underline font-medium transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Question Header */}
        <div className="relative mb-8 text-center">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">
            {questions[index].question}
          </h2>
        </div>

        {/* Answer Input */}
        <div className="mb-6">
          <textarea
            className="w-full border-2 border-purple-200 rounded-2xl p-4 text-lg focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none bg-white/50 backdrop-blur-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            placeholder={
              answers[index] === "skip"
                ? "This question has been skipped"
                : "Share your thoughts here..."
            }
            rows={4}
            value={answers[index] === "skip" ? "" : answers[index]}
            disabled={answers[index] === "skip"}
            onChange={(e) => onAnswerChange(e.target.value)}
          />
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium text-center">
                {error}
              </p>
            </div>
          )}
          {/* Preview Dialog */}
          {showPreviewDialog && (
            <div className="mt-4 bg-white/95 backdrop-blur-sm border-2 border-green-200 rounded-2xl shadow-xl p-6 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                    Survey Complete!
                  </h3>
                </div>
                <button
                  onClick={onClosePreview}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-4 text-sm">
                You've answered {answeredCount} out of {questions.length}{" "}
                questions. Review your responses before submitting.
              </p>

              <div className="max-h-48 overflow-y-auto mb-4 space-y-3">
                {questions.slice(0, 3).map((q, i) => (
                  <div
                    key={q.id}
                    className="bg-gray-50 rounded-xl p-3 text-sm"
                  >
                    <p className="font-medium text-gray-800 mb-1">
                      Q{i + 1}: {q.question.substring(0, 60)}...
                    </p>
                    <p className="text-gray-600 text-xs">
                      {answers[i] && answers[i] !== "skip"
                        ? answers[i].substring(0, 80) +
                          (answers[i].length > 80 ? "..." : "")
                        : answers[i] === "skip"
                        ? "Skipped"
                        : "No answer"}
                    </p>
                  </div>
                ))}
                {questions.length > 3 && (
                  <p className="text-xs text-gray-500 text-center italic">
                    ... and {questions.length - 3} more questions
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onPublish}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 text-sm"
                >
                  Submit Survey
                </button>
                <button
                  onClick={onClosePreview}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 text-sm"
                >
                  Review More
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onSaveNext}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {index === questions.length - 1
              ? "Complete Survey"
              : "Save & Continue"}
          </button>
         
          <button
            onClick={onSkip}
            className={`px-8 py-3 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg ${
              answers[index] === "skip"
                ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {answers[index] === "skip"
              ? "Unskip Question"
              : "Skip Question"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default UserQuestionCard;