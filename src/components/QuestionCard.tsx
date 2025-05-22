// src/components/QuestionCard.tsx
import React from "react";
import { X } from "lucide-react";
import { Question } from "../type";

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
}) => (
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    {/* Header with delete button */}
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Question {index + 1}</h3>
      <button
        onClick={onDelete}
        disabled={isFirst}
        className={isFirst ? "opacity-50 cursor-not-allowed" : ""}
      >
        <X size={20} />
      </button>
    </div>

    {/* Question text input */}
    <input
      type="text"
      value={question.question}
      onChange={(e) => onUpdate("question", e.target.value)}
      placeholder="Type your question here"
      className="w-full border rounded p-2"
    />

    {/* Category & Level selectors */}
    <div className="grid grid-cols-2 gap-4">
      <select
        value={question.category}
        onChange={(e) => onUpdate("category", e.target.value)}
        className="border rounded p-2"
      >
        <option value="">Select category</option>
        <option value="Vocabulary">Vocabulary</option>
        <option value="Grammar">Grammar</option>
        <option value="Culture">Culture</option>
      </select>

      <select
        value={question.level}
        onChange={(e) => onUpdate("level", e.target.value)}
        className="border rounded p-2"
      >
        <option value="">Select level</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>
    </div>

    {/* Navigation & Add-next */}
    <div className="flex justify-between items-center">
      <div className="space-x-2">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <button
        onClick={onAddNext}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        Add Question
      </button>
    </div>
  </div>
);
