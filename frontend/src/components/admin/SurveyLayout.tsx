import React, { memo } from "react";
import { Sidebar } from "./Sidebar";
import { QuestionCard } from "./QuestionCard";
import { PreviewModal } from "./PreviewModal";
import { Header } from "./Header";
import ErrorAlert from "../common/ErrorAlert";
import { Question } from "../../types";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

interface SurveyLayoutProps {
  questions: Question[];
  questionsByLevel: Record<Level, Question[]>;
  currentIndex: number;
  currentLevel: Level;
  completedCount: number;
  showPreview: boolean;
  isSubmitting: boolean;
  error: string;
  mode: "create" | "edit";

  onSelectQuestion: (level: Level, index: number) => void;
  onAddQuestion: (level: Level) => void;
  onPrev: () => void;
  onNext: () => void;
  onDeleteCurrent: () => void;
  onDeleteAllQuestions: (level: Level) => void;

  onUpdateQuestion: (field: keyof Question, value: string) => void;
  onCreateNew: () => void;
  onUpdate: () => void;
  onSwitchToCreate: () => void;
  onSwitchToEdit: () => void;
  onPreview: () => void;
  onClosePreview: () => void;
  onLogout: () => void;
  onErrorDismiss: () => void;

  formTitle: string;
  formDescription: string;
}

function SurveyLayout({
  questions,
  questionsByLevel,
  currentIndex,
  currentLevel,
  completedCount,
  showPreview,
  isSubmitting,
  error,
  mode,
  onSelectQuestion,
  onAddQuestion,
  onPrev,
  onNext,
  onDeleteCurrent,
  onDeleteAllQuestions,
  onUpdateQuestion,
  onCreateNew,
  onUpdate,
  onSwitchToCreate,
  onSwitchToEdit,
  onPreview,
  onClosePreview,
  onLogout,
  onErrorDismiss,
  formTitle,
  formDescription,
}: SurveyLayoutProps) {
  return (
    <div className="min-h-screen bg-purple-50">
      <Header
        completedCount={completedCount}
        totalCount={questions.length}
        mode={mode}
        onPreview={onPreview}
        onCreateNew={onCreateNew}
        onUpdate={onUpdate}
        onSwitchToCreate={onSwitchToCreate}
        onSwitchToEdit={onSwitchToEdit}
        isSubmitting={isSubmitting}
        onLogout={onLogout}
      />
      {error && <ErrorAlert message={error} onDismiss={onErrorDismiss} />}
      
      {/* Mode Toggle */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Current Mode: {mode === "create" ? "Create New Survey" : "Edit Existing Survey"}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={onSwitchToCreate}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === "create"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } disabled:opacity-50`}
                >
                  Create Mode
                </button>
                <button
                  onClick={onSwitchToEdit}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === "edit"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } disabled:opacity-50`}
                >
                  Edit Mode
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {mode === "create" 
                ? "Create new questions (POST)" 
                : "Update existing questions (PUT)"
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-96 flex-shrink-0">
          <MemoizedSidebar
            questionsByLevel={questionsByLevel}
            currentLevel={currentLevel}
            currentIndex={currentIndex}
            onSelect={onSelectQuestion}
            onAdd={onAddQuestion}
            onDeleteAll={onDeleteAllQuestions}
            completedCount={completedCount}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{formTitle}</h1>
          <p className="text-gray-600 mb-4">{formDescription}</p>

          {questions.length === 0 ? (
            <div className="text-center text-gray-500">
              No questions added yet. Click <b>"Add Question"</b> to get
              started.
            </div>
          ) : (
            questions[currentIndex] && (
              <MemoizedQuestionCard
                question={questions[currentIndex]}
                index={currentIndex}
                isFirst={currentIndex === 0}
                isLast={currentIndex === questions.length - 1}
                onPrev={onPrev}
                onNext={onNext}
                onDelete={onDeleteCurrent}
                onUpdate={onUpdateQuestion}
                onAddNext={() => onAddQuestion(currentLevel)}
                currentTabLevel={currentLevel}
              />
            )
          )}
        </div>
      </div>
      
      {showPreview && (
        <PreviewModal
          title={formTitle}
          description={formDescription}
          questions={questions}
          mode={mode}
          onClose={onClosePreview}
          onCreateNew={onCreateNew}
          onUpdate={onUpdate}
          isSubmitting={isSubmitting}
          completedCount={completedCount}
        />
      )}
    </div>
  );
}

const MemoizedSidebar = memo(Sidebar);
const MemoizedQuestionCard = memo(QuestionCard);

export default SurveyLayout;