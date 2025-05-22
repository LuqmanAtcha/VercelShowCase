import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Header } from "./components/Header.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { QuestionCard } from "./components/QuestionCard.tsx";
import { PreviewModal } from "./components/PreviewModal.tsx";
import { Question } from "./type";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const App: React.FC = () => {
  // state hooks
  const [questions, setQuestions] = useState<Question[]>([
    { id: uuidv4(), question: "", category: "", level: "" },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formTitle] = useState("Sanskrit Language Survey");
  const [formDescription] = useState(
    "Please answer the following questions to help us understand your Sanskrit knowledge."
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // helper functions
  const addQuestion = () => {
    /* …your code… */
  };
  const deleteQuestion = (index: number) => {
    /* … */
  };
  const updateQuestion = (field: keyof Question, value: string) => {
    /* … */
  };
  const handleSubmit = async () => {
    /* … */
  };

  // derived values
  const completedCount = questions.filter(
    (q) => q.question.trim() !== "" && q.category && q.level
  ).length;

  return (
    <div className="min-h-screen bg-purple-50">
      <Header
        completedCount={completedCount}
        totalCount={questions.length}
        onPreview={() => setShowPreview(true)}
        onPublish={handleSubmit}
        isPublishing={isSubmitting}
      />

      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar
          questions={questions}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
          onAdd={addQuestion}
          completedCount={completedCount}
        />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold">{formTitle}</h1>
          <p className="text-gray-600">{formDescription}</p>

          <QuestionCard
            question={questions[currentIndex]}
            index={currentIndex}
            isFirst={currentIndex === 0}
            isLast={currentIndex === questions.length - 1}
            onPrev={() => setCurrentIndex((i) => i - 1)}
            onNext={() => setCurrentIndex((i) => i + 1)}
            onDelete={() => deleteQuestion(currentIndex)}
            onUpdate={updateQuestion}
            onAddNext={addQuestion}
          />
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          title={formTitle}
          description={formDescription}
          questions={questions}
          onClose={() => setShowPreview(false)}
          onPublish={handleSubmit}
          isPublishing={isSubmitting}
          completedCount={completedCount}
        />
      )}
    </div>
  );
};

export default App;
