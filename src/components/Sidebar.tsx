import React from "react";
import { Question } from "../type";

interface SidebarProps {
  questions: Question[];
  currentIndex: number;
  onSelect(index: number): void;
  onAdd(): void;
  completedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  questions,
  currentIndex,
  onSelect,
  onAdd,
  completedCount,
}) => (
  <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-6">
    <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
    <div className="space-y-2 mb-4">
      {questions.map((q, idx) => (
        <div
          key={q.id}
          className={`p-2 rounded-lg cursor-pointer transition-colors ${
            idx === currentIndex
              ? "bg-purple-100 border-purple-200 border"
              : "hover:bg-gray-50"
          }`}
          onClick={() => onSelect(idx)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Q{idx + 1}</span>
            {q.question.trim() && q.category && q.level ? (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            ) : (
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {q.question.trim() || "Empty question"}
          </p>
        </div>
      ))}
    </div>
    <button
      onClick={onAdd}
      className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
    >
      ➕ Add Question
    </button>
    <div className="mt-4 pt-4 border-t">
      <div className="text-xs text-gray-500 mb-1">Progress</div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600">
          {completedCount}/{questions.length}
        </span>
      </div>
    </div>
  </div>
);
