import React, { memo } from "react";
import { Sidebar } from "./Sidebar";
import { QuestionCard } from "./QuestionCard";
import { PreviewModal } from "./PreviewModal";
import { Header } from "./Header";
import ErrorAlert from "../common/ErrorAlert";
import { Question } from "../../type";

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

  onSelectQuestion: (level: Level, index: number) => void;
  onAddQuestion: (level: Level) => void;
  onPrev: () => void;
  onNext: () => void;
  onDeleteCurrent: () => void;
  onDeleteAllQuestions: (level: Level) => void;

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
  questionsByLevel,
  currentIndex,
  currentLevel,
  completedCount,
  showPreview,
  isSubmitting,
  error,
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
      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
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
          onClose={onClosePreview}
          onPublish={onPublish}
          isPublishing={isSubmitting}
          completedCount={completedCount}
        />
      )}
    </div>
  );
}

const MemoizedSidebar = memo(Sidebar);
const MemoizedQuestionCard = memo(QuestionCard);

export default SurveyLayout;