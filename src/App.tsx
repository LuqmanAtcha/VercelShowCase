import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import LoginPage from "./components/LoginPage.tsx";
import { Header } from "./components/admin/Header.tsx";
import { Sidebar } from "./components/admin/Sidebar.tsx";
import { QuestionCard } from "./components/admin/QuestionCard.tsx";
import { PreviewModal } from "./components/admin/PreviewModal.tsx";
import UserSurvey from "./components/UserSurvey.tsx";
import { Question } from "./type.ts";

// SET YOUR ADMIN PASSWORD HERE:
const ADMIN_PASSWORD = "admin123";

// Simple UUID generator to avoid external dependency
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/sbna-gameshow-form" element={<LoginWrapper />} />
      <Route path="/participant" element={<UserSurvey />} />
      <Route path="/dashboard" element={<SurveyPage />} />
    </Routes>
  </Router>
);

const LoginWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [adminLoginError, setAdminLoginError] = useState("");

  const handleParticipantLogin = useCallback(
    (name: string, anon: boolean) => {
      navigate("/participant", {
        state: {
          user: {
            name: name || "Guest",
            isAnonymous: anon,
            role: "participant",
          },
        },
      });
    },
    [navigate]
  );

  const handleAdminLogin = useCallback(
    (name: string, password: string) => {
      if (password === ADMIN_PASSWORD) {
        setAdminLoginError("");
        navigate("/dashboard", {
          state: {
            user: {
              name: name || "Admin",
              isAnonymous: false,
              role: "admin",
            },
          },
        });
      } else {
        setAdminLoginError("Incorrect admin password.");
      }
    },
    [navigate]
  );

  return (
    <LoginPage
      onParticipant={handleParticipantLogin}
      onAdmin={handleAdminLogin}
      adminError={adminLoginError}
    />
  );
};

const SurveyPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([
    { id: generateId(), question: "", category: "", level: "" },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const isMountedRef = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const addQuestion = useCallback(() => {
    const last = questions[questions.length - 1];
    const next: Question = {
      id: generateId(),
      question: "",
      category: last?.category || "",
      level: last?.level || "",
    };
    setQuestions((prev) => [...prev, next]);
    setCurrentIndex(questions.length);
  }, [questions]);

  const deleteQuestion = useCallback(
    (i: number) => {
      if (questions.length === 1) return;
      setQuestions((prev) => {
        const updated = prev.filter((_, idx) => idx !== i);
        setCurrentIndex(Math.min(i, updated.length - 1));
        return updated;
      });
    },
    [questions.length]
  );

  const updateQuestion = useCallback(
    (field: keyof Question, val: string) => {
      setQuestions((prev) => {
        const copy = [...prev];
        copy[currentIndex] = { ...copy[currentIndex], [field]: val };
        return copy;
      });
      setError("");
    },
    [currentIndex]
  );

  // MOCKED "Publish" - no backend, just a spinner and close preview
  const handlePublish = useCallback(async () => {
    setIsSubmitting(true);
    setError("");
    setTimeout(() => {
      setIsSubmitting(false);
      setShowPreview(false);
    }, 900);
  }, []);

  const handleLogout = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handlePreview = useCallback(() => setShowPreview(true), []);
  const handleClosePreview = useCallback(() => setShowPreview(false), []);

  const completedCount = questions.filter(
    (q) => q.question.trim() && q.category && q.level
  ).length;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  }, [questions.length]);
  const handleSelectQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);
  const handleDeleteCurrent = useCallback(() => {
    deleteQuestion(currentIndex);
  }, [deleteQuestion, currentIndex]);

  return (
    <div className="min-h-screen bg-purple-50">
      <Header
        completedCount={completedCount}
        totalCount={questions.length}
        onPreview={handlePreview}
        onPublish={handlePublish}
        isPublishing={isSubmitting}
        onLogout={handleLogout}
      />
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar
          questions={questions}
          currentIndex={currentIndex}
          onSelect={handleSelectQuestion}
          onAdd={addQuestion}
          completedCount={completedCount}
        />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold">Sanskrit Language Survey</h1>
          <p className="text-gray-600 mb-4">
            Please answer the following questions to help us understand your
            Sanskrit knowledge.
          </p>
          {questions[currentIndex] && (
            <QuestionCard
              question={questions[currentIndex]}
              index={currentIndex}
              isFirst={currentIndex === 0}
              isLast={currentIndex === questions.length - 1}
              onPrev={handlePrev}
              onNext={handleNext}
              onDelete={handleDeleteCurrent}
              onUpdate={updateQuestion}
              onAddNext={addQuestion}
            />
          )}
        </div>
      </div>
      {showPreview && (
        <PreviewModal
          title="Sanskrit Language Survey"
          description="Please answer the following questions to help us understand your Sanskrit knowledge."
          questions={questions}
          onClose={handleClosePreview}
          onPublish={handlePublish}
          isPublishing={isSubmitting}
          completedCount={completedCount}
        />
      )}
    </div>
  );
};

export default App;
