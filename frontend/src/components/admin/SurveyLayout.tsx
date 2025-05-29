import React, { memo } from "react";
import { Sidebar } from "./Sidebar";
import { QuestionCard } from "./QuestionCard";
import { PreviewModal } from "./PreviewModal";
import { Header } from "./Header";
import ErrorAlert from "../common/ErrorAlert";
import { Question } from "../../type";

interface SurveyLayoutProps {
  questions: Question[];
  currentIndex: number;
  completedCount: number;
  showPreview: boolean;
  isSubmitting: boolean;
  error: string;
  currentLevel: string;

  // Group: Navigation handlers
  onSelectQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDeleteCurrent: () => void;
  onDeleteAllQuestions: () => void;

  // Group: Form handlers
  onUpdateQuestion: (field: keyof Question, value: string) => void;
  onPublish: () => void;
  onPreview: () => void;
  onClosePreview: () => void;
  onLogout: () => void;
  onErrorDismiss: () => void;

  formTitle: string;
  formDescription: string;
}

function SurveyLayout({
  questions,
  currentIndex,
  completedCount,
  showPreview,
  isSubmitting,
  error,
  currentLevel,
  onSelectQuestion,
  onAddQuestion,
  onPrev,
  onNext,
  onDeleteCurrent,
  onDeleteAllQuestions,
  onUpdateQuestion,
  onPublish,
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
        onPreview={onPreview}
        onPublish={onPublish}
        isPublishing={isSubmitting}
        onLogout={onLogout}
      />
      {error && <ErrorAlert message={error} onDismiss={onErrorDismiss} />}
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MemoizedSidebar
          questions={questions}
          currentIndex={currentIndex}
          onSelect={onSelectQuestion}
          onAdd={onAddQuestion}
          onDeleteAll={onDeleteAllQuestions}
          completedCount={completedCount}
          levelLabel={currentLevel}
        />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold">{formTitle}</h1>
          <p className="text-gray-600 mb-4">{formDescription}</p>

          {questions.length === 0 ? (
            <div className="text-center text-gray-500">
              No questions added yet. Click <b>“Add Question”</b> to get started.
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
                onAddNext={onAddQuestion}
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
          onClose={onClosePreview}
          onPublish={onPublish}
          isPublishing={isSubmitting}
          completedCount={completedCount}
        />
      )}
    </div>
  );
}

// React.memo for performance on large lists
const MemoizedSidebar = memo(Sidebar);
const MemoizedQuestionCard = memo(QuestionCard);

export default SurveyLayout;
