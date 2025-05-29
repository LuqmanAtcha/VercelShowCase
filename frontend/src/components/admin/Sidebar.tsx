import React, { useCallback } from "react";
import { Question } from "../../type";

interface SidebarProps {
  questions: Question[];
  currentIndex: number;
  onSelect(index: number): void;
  onAdd(): void;
  onDeleteAll(): void;
  completedCount: number;
  levelLabel: string;
}

interface SidebarItemProps {
  idx: number;
  question: Question;
  isCurrent: boolean;
  isCompleted: boolean;
  onSelect(): void;
}

function SidebarItem({
  idx,
  question,
  isCurrent,
  isCompleted,
  onSelect,
}: SidebarItemProps) {
  return (
    <div
      className={`p-2 rounded-lg cursor-pointer transition-colors ${
        isCurrent
          ? "bg-purple-100 border-purple-200 border"
          : "hover:bg-gray-50"
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Question {idx + 1}</span>
        <div
          className={`w-2 h-2 rounded-full ${
            isCompleted ? "bg-green-500" : "bg-gray-300"
          }`}
          aria-label={isCompleted ? "Question completed" : "Question incomplete"}
        />
      </div>
      <p className="text-xs text-gray-500 truncate">
        {question.question?.trim() || "Empty question"}
      </p>
    </div>
  );
}

export function Sidebar({
  questions,
  currentIndex,
  onSelect,
  onAdd,
  onDeleteAll,
  completedCount,
  levelLabel,
}: SidebarProps) {
  const clampedCompletedCount = Math.min(completedCount, questions.length);
  const progressPercentage =
    questions.length > 0 ? (clampedCompletedCount / questions.length) * 100 : 0;

  const handleSelect = useCallback(
    (idx: number) => () => onSelect(idx),
    [onSelect]
  );

  const handleDeleteAll = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete ALL questions for "${levelLabel}" level? This cannot be undone.`
      )
    ) {
      onDeleteAll();
    }
  }, [levelLabel, onDeleteAll]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-6">
      <h3 className="font-semibold text-gray-900 mb-3">
        {levelLabel} Questions
      </h3>
      <div className="space-y-2 mb-4">
        {questions.map((q, idx) => {
          const isCompleted =
            q.question?.trim() && q.questionCategory && q.questionLevel;
          const isCurrent = idx === currentIndex;

          return (
            <SidebarItem
              key={q.id || idx}
              idx={idx}
              question={q}
              isCurrent={isCurrent}
              isCompleted={!!isCompleted}
              onSelect={handleSelect(idx)}
            />
          );
        })}
      </div>
      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
        type="button"
      >
        ➕ Add Question
      </button>
      <button
        onClick={handleDeleteAll}
        className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-red-400 rounded-lg text-red-600 hover:border-red-600 hover:text-white hover:bg-red-500 transition-colors mt-2"
        type="button"
      >
        🗑️ Delete All Questions
      </button>
      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500 mb-1">Progress</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600">
            {clampedCompletedCount}/{questions.length}
          </span>
        </div>
      </div>
    </div>
  );
}
