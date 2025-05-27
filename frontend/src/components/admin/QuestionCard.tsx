// src/components/admin/QuestionCard.tsx
import React from "react";
import { X } from "lucide-react";
import { Question } from "../../type";

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
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isFirst,
  isLast,
  onPrev,
  onNext,
  onDelete,
  onUpdate,
  onAddNext,
}) => {
  const handleClear = () => {
    onUpdate("question", "");
    onUpdate("questionCategory", "");
    onUpdate("questionLevel", "");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-800">
          Question {index + 1}
        </h3>
        <button
          onClick={onDelete}
          disabled={isFirst}
          className={`p-2 rounded-full hover:bg-red-100 transition ${
            isFirst ? "opacity-50 cursor-not-allowed" : "text-red-500"
          }`}
          aria-label="Delete question"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-2 mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Question Text *
        </label>
        <textarea
          rows={4}
          value={question.question}
          onChange={(e) => onUpdate("question", e.target.value)}
          placeholder="Enter your question here..."
          maxLength={500}
          className="w-full border-2 border-purple-500 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500">
          {question.question.length}/500 characters
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            value={question.questionCategory}
            onChange={(e) => onUpdate("questionCategory", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Choose a category</option>
            <option value="Vocabulary">Vocabulary</option>
            <option value="Grammar">Grammar</option>
            <option value="Culture">Culture</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Difficulty Level *
          </label>
          <select
            value={question.questionLevel}
            onChange={(e) => onUpdate("questionLevel", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Clear
        </button>
        <div className="flex space-x-2">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Prev
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
          <button
            onClick={onAddNext}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Add Next Question
          </button>
        </div>
      </div>
    </div>
  );
};
