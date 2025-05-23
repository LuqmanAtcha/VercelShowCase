// src/App.tsx
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Header } from "./components/Header.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { QuestionCard } from "./components/QuestionCard.tsx";
import { PreviewModal } from "./components/PreviewModal.tsx";
import { Question } from "./type";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const App: React.FC = () => {
  
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

  const addQuestion = () => {
    const last = questions[questions.length - 1];
    const newQuestion: Question = {
      id: uuidv4(),
      question: "",
      category: last.category,
      level: last.level,
    };
    setQuestions([...questions, newQuestion]);
    setCurrentIndex(questions.length);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length > 1) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
      setCurrentIndex(Math.min(index, updated.length - 1));
    }
  };

  const updateQuestion = (field: keyof Question, value: string) => {
    const updated = [...questions];
    updated[currentIndex] = { ...updated[currentIndex], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // remove old surveys
      await fetch(`${API}/api/surveys`, { method: "DELETE" });
      // publish new
      const res = await fetch(`${API}/api/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: questions.filter((q) => q.question.trim() !== ""),
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
