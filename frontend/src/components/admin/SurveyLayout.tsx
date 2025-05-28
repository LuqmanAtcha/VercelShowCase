// SurveyLayout.tsx
import React from "react";
import { Sidebar } from "./Sidebar";
import { QuestionCard } from "./QuestionCard";
import { PreviewModal } from "./PreviewModal";
import { Header } from "./Header";
import ErrorAlert from "./ErrorAlert";
import { Question } from "../../type";

interface SurveyLayoutProps {
  questions: Question[];
  currentIndex: number;
  completedCount: number;
  showPreview: boolean;
  isSubmitting: boolean;
  error: string;
  onErrorDismiss: () => void;
  onSelectQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDeleteCurrent: () => void;
  onUpdateQuestion: (field: keyof Question, value: string) => void;
  onPublish: () => void;
  onPreview: () => void;
  onClosePreview: () => void;
  onLogout: () => void;
  formTitle: string;
  formDescription: string;
}

const SurveyLayout: React.FC<SurveyLayoutProps> = ({
  questions,
  currentIndex,
  completedCount,
  showPreview,
  isSubmitting,
  error,
  onErrorDismiss,
  onSelectQuestion,
  onAddQuestion,
  onPrev,
  onNext,
  onDeleteCurrent,
  onUpdateQuestion,
  onPublish,
  onPreview,
  onClosePreview,
  onLogout,
  formTitle,
  formDescription,
}) => (
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
      <Sidebar
        questions={questions}
        currentIndex={currentIndex}
        onSelect={onSelectQuestion}
        onAdd={onAddQuestion}
        onDeleteAll={() => {
          console.log("Delete All clicked");
        }}
        completedCount={completedCount}
        levelLabel="TEST"
      />
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-bold">{formTitle}</h1>
        <p className="text-gray-600 mb-4">{formDescription}</p>
        {questions[currentIndex] && (
          <QuestionCard
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

export default SurveyLayout;
