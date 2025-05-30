import React from "react";
import { Plus, Trash2 } from "lucide-react";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

interface Question {
  id?: string;
  question?: string;
  questionCategory?: string;
  questionLevel?: string;
}

interface SidebarProps {
  questionsByLevel: Record<Level, Question[]>;
  currentIndex: number;
  currentLevel: Level;
  onSelect(level: Level, index: number): void;
  onAdd(level: Level): void;
  onDeleteAll(level: Level): void;
  completedCount: number;
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
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isCurrent
          ? "bg-purple-100 border-l-4 border-purple-600 shadow-sm"
          : "hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
      }`}
      onClick={onSelect}
    >
      <span className="text-sm font-medium truncate flex-1 pr-2">
        Q{idx + 1}. {question.question || "Untitled Question"}
      </span>
      <div
        className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${
          isCompleted ? "bg-green-500" : "bg-gray-300"
        }`}
      />
    </div>
  );
}

export function Sidebar({
  questionsByLevel,
  currentIndex,
  currentLevel,
  onSelect,
  onAdd,
  onDeleteAll,
  completedCount,
}: SidebarProps) {
  const totalQuestions = Object.values(questionsByLevel).flat().length;
  const progressPct = totalQuestions
    ? (completedCount / totalQuestions) * 100
    : 0;

  return (
    <aside className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6 space-y-6 text-gray-800 max-h-[calc(100vh-3rem)] overflow-hidden flex flex-col">
      <div className="flex-shrink-0">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Question Bank</h3>

        {/* Progress Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-purple-700">
              {completedCount}/{totalQuestions}
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {Math.round(progressPct)}% Complete
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
        {LEVELS.map((level) => {
          const levelQuestions = questionsByLevel[level] || [];
          const levelCompleted = levelQuestions.filter(
            (q) =>
              !!(q.question?.trim() && q.questionCategory && q.questionLevel)
          ).length;

          return (
            <div
              key={level}
              className="bg-gray-50 rounded-xl p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">{level}</h4>
                  <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600 border">
                    {levelCompleted}/{levelQuestions.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAdd(level);
                    }}
                    className="p-2 rounded-lg hover:bg-purple-100 transition-colors group"
                    title={`Add ${level} question`}
                    type="button"
                  >
                    <Plus
                      size={14}
                      className="text-purple-600 group-hover:text-purple-700"
                    />
                  </button>
                  {levelQuestions.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteAll(level);
                      }}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors group"
                      title={`Delete all ${level} questions`}
                      type="button"
                    >
                      <Trash2
                        size={14}
                        className="text-red-500 group-hover:text-red-600"
                      />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {levelQuestions.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-gray-400 mb-2">
                      <Plus size={24} className="mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500">No questions yet</p>
                    <p className="text-xs text-gray-400">Click + to add one</p>
                  </div>
                ) : (
                  levelQuestions.map((q, idx) => (
                    <SidebarItem
                      key={q.id || idx}
                      idx={idx}
                      question={q}
                      isCurrent={level === currentLevel && idx === currentIndex}
                      isCompleted={
                        !!(
                          q.question?.trim() &&
                          q.questionCategory &&
                          q.questionLevel
                        )
                      }
                      onSelect={() => onSelect(level, idx)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
