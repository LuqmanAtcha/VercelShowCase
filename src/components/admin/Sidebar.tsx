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
      className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
        isCurrent
          ? "bg-purple-100 border-l-4 border-purple-600 shadow-sm"
          : "hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
      }`}
      onClick={onSelect}
      tabIndex={0}
      title={question.question || "Untitled Question"}
      aria-label={question.question || "Untitled Question"}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            isCurrent ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {idx + 1}
        </div>
        <span
          className="text-base font-medium truncate"
          title={question.question}
        >
          {question.question || "Untitled Question"}
        </span>
      </div>
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
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

  // Set the max height for the scrollable question list area in each column (in rem units)
  const MAX_HEIGHT_REM = 22;

  return (
    <aside
      className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-4 space-y-4 text-gray-800"
      role="navigation"
      aria-label="Question Navigation Sidebar"
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Question Bank</h3>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-purple-700">
              {completedCount}/{totalQuestions}
            </span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Columns: Now using flex so columns never overlap and always fit */}
      <div className="flex gap-4 w-full">
        {LEVELS.map((level) => {
          const levelQuestions = questionsByLevel[level] || [];
          return (
            <div
              key={level}
              className="bg-white/90 rounded-xl border border-gray-200 shadow flex flex-col flex-1 min-w-0"
              // If you want to prevent columns from getting too skinny, use min-w-[220px] max-w-[340px] as desired.
            >
              {/* Level Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gradient-to-r from-white via-purple-50 to-white rounded-t-xl">
                <h4 className="font-semibold text-gray-900 text-sm">{level}</h4>
                <div className="flex items-center space-x-1">
                  {levelQuestions.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Delete all ${level} questions? This cannot be undone.`
                          )
                        ) {
                          onDeleteAll(level);
                        }
                      }}
                      className="p-1 rounded-md hover:bg-red-100 transition-colors group"
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
              {/* Questions List */}
              <div
                className="overflow-y-scroll p-2 custom-scrollbar"
                style={{
                  maxHeight: `${MAX_HEIGHT_REM}rem`,
                  minHeight: 0,
                }}
              >
                {levelQuestions.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-gray-400 mb-2">
                      <Plus size={20} className="mx-auto" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">No questions</p>
                    <p className="text-xs text-gray-400">Click + to add</p>
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
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
          scrollbar-gutter: stable both-edges;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
      `}</style>
    </aside>
  );
}
