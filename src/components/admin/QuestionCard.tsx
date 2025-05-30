import React from "react";
import { X, Plus } from "lucide-react";
import { Question } from "../../types";

// Centralize the allowed options
const categories = ["Vocabulary", "Grammar", "Culture"] as const;
const levels = ["Beginner", "Intermediate", "Advanced"] as const;

interface QuestionCardProps {
  question: Question;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev(): void;
  onNext(): void;
  onDelete(): void;
  onUpdate(field: keyof Question, value: string): void;
  onAddNext(): void;
  currentTabLevel: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = React.memo(
  ({
    question,
    index,
    isFirst,
    isLast,
    onPrev,
    onNext,
    onDelete,
    onUpdate,
    onAddNext,
    currentTabLevel,
  }) => {
    const handleClear = () => {
      // Ensure all fields are cleared together
      onUpdate("question", "");
      onUpdate("questionCategory", "");
    };

    const nearLimit = (question.question?.length || 0) > 450;
    const isCompleted = !!(
      question.question?.trim() &&
      question.questionCategory &&
      question.questionLevel
    );

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-2xl font-bold text-gray-900">
              Question {index + 1}
            </h3>
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${
                isCompleted ? "bg-green-500" : "bg-gray-300"
              }`}
              title={isCompleted ? "Question completed" : "Question incomplete"}
            />
          </div>
          <button
            onClick={onDelete}
            disabled={isFirst}
            className={`p-2 rounded-lg transition-colors ${
              isFirst
                ? "opacity-50 cursor-not-allowed text-gray-400"
                : "text-red-500 hover:bg-red-100 hover:text-red-600"
            }`}
            aria-label="Delete question"
            title="Delete question"
          >
            <X size={20} />
          </button>
        </div>

        {/* Question Text */}
        <div className="space-y-3">
          
          <div className="relative">
            <textarea
              rows={4}
              value={question.question || ""}
              onChange={(e) => onUpdate("question", e.target.value)}
              placeholder="Enter your question here..."
              maxLength={500}
              className="w-full border-2 border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
            <div className="absolute bottom-3 right-3">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  nearLimit
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {question.question?.length || 0}/500
              </span>
            </div>
          </div>
        </div>

        {/* Category and Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={question.questionCategory || ""}
              onChange={(e) => onUpdate("questionCategory", e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="">Choose a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Difficulty Level <span className="text-red-500">*</span>
            </label>
            <select
              value={question.questionLevel || currentTabLevel}
              onChange={(e) => onUpdate("questionLevel", e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="">Select difficulty</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors"
          >
            Clear All Fields
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onPrev}
              disabled={isFirst}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <button
              onClick={onNext}
              disabled={isLast}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>

            <button
              onClick={onAddNext}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus size={16} />
              <span>Add Next</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default QuestionCard;
