import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";

import LoginPage from "./components/LoginPage.tsx";
import SurveyLayout from "./components/admin/SurveyLayout.tsx";
import UserSurvey from "./components/UserSurvey.tsx";
import { Question } from "./type.ts";
import NotFound from "./components/NotFound.tsx";

// SET YOUR ADMIN PASSWORD HERE:
const ADMIN_PASSWORD = "admin123";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="/form" element={<UserSurvey />} />
      <Route path="/dashboard" element={<SurveyPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
      <Route
        path="/sbna-gameshow-form"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  </Router>
);

const LoginWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [adminLoginError, setAdminLoginError] = useState("");

  const handleParticipantLogin = useCallback(
    (name: string, anon: boolean) => {
      localStorage.removeItem("isAdmin"); // remove admin status if logging as participant
      navigate("/form", {
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
        localStorage.setItem("isAdmin", "true");   // <-- Set admin flag!
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

  // >>> Extracted fetchQuestions so we can use it everywhere
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/v1/questions?page=1`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch questions");

      const formatted = (data.questions || []).map((q: any) => ({
        id: q._id || generateId(),
        question: q.question || "",
        category: q.questionCategory || q.category || "",
        level: q.questionLevel || q.level || "",
      }));

      setQuestions(
        formatted.length
          ? formatted
          : [{ id: generateId(), question: "", category: "", level: "" }]
      );
      setCurrentIndex(0);
    } catch (err: any) {
      setQuestions([{ id: generateId(), question: "", category: "", level: "" }]);
      setCurrentIndex(0);
    }
  }, []);

  // >>> PROTECT admin route <<<
  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
      return;
    }
    fetchQuestions();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchQuestions, navigate]);

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

  // POST all questions to /api/v1/questions
  const handlePublish = useCallback(async () => {
    setIsSubmitting(true);
    setError("");

    const completedCount = questions.filter(
      (q) => q.question.trim() && q.category && q.level
    ).length;
    if (completedCount === 0) {
      setError("You must complete at least one question before publishing.");
      setIsSubmitting(false);
      return;
    }

    try {
      await fetch(`${API}/api/v1/questions`, { method: "DELETE" });

      const payload = questions.map((q) => ({
        question: q.question,
        questionType: "Input",
        questionCategory: q.category,
        questionLevel: q.level,
      }));

      const res = await fetch(`${API}/api/v1/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Publish failed");

      setShowPreview(false);
      alert("Survey published successfully!");
      // >>>> AUTO-RELOAD QUESTIONS FROM DB <<<<
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Failed to publish survey.");
    }
    setIsSubmitting(false);
  }, [questions, fetchQuestions]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("isAdmin"); // <-- Remove flag on logout!
    navigate("/login");
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

  const formTitle = "Sanskrit Language Survey";
  const formDescription =
    "Please answer the following questions to help us understand your Sanskrit knowledge.";

  return (
    <SurveyLayout
      questions={questions}
      currentIndex={currentIndex}
      completedCount={completedCount}
      showPreview={showPreview}
      isSubmitting={isSubmitting}
      error={error}
      onErrorDismiss={() => setError("")}
      onSelectQuestion={handleSelectQuestion}
      onAddQuestion={addQuestion}
      onPrev={handlePrev}
      onNext={handleNext}
      onDeleteCurrent={handleDeleteCurrent}
      onUpdateQuestion={updateQuestion}
      onPublish={handlePublish}
      onPreview={handlePreview}
      onClosePreview={handleClosePreview}
      onLogout={handleLogout}
      formTitle={formTitle}
      formDescription={formDescription}
    />
  );
};

export default App;
