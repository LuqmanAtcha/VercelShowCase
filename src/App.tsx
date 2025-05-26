import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";

import LoginPage from "./components/LoginPage.tsx";
import NotFound from "./components/NotFound.tsx";
import UserSurvey from "./components/UserSurvey.tsx";
import { Question } from "./type.ts";

const ADMIN_PASSWORD = "admin123";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

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
      localStorage.removeItem("isAdmin");
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
        localStorage.setItem("isAdmin", "true");
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

// --- ADMIN SURVEY PAGE with Difficulty Switch in Dropdown ---
const SurveyPage: React.FC = () => {
  const [questionsByLevel, setQuestionsByLevel] = useState<
    Record<Level, Question[]>
  >({
    Beginner: [
      { id: generateId(), question: "", category: "", level: "Beginner" },
    ],
    Intermediate: [
      { id: generateId(), question: "", category: "", level: "Intermediate" },
    ],
    Advanced: [
      { id: generateId(), question: "", category: "", level: "Advanced" },
    ],
  });
  const [currentTab, setCurrentTab] = useState<Level>("Beginner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const isMountedRef = useRef(true);
  const navigate = useNavigate();

  // Fetch all questions and group them by level
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
      // Group by level
      const grouped: Record<Level, Question[]> = {
        Beginner: [],
        Intermediate: [],
        Advanced: [],
      };
      formatted.forEach((q) => {
        if (LEVELS.includes(q.level as Level)) {
          grouped[q.level as Level].push(q);
        }
      });
      // Ensure at least one empty question per level for UX
      LEVELS.forEach((lvl) => {
        if (grouped[lvl].length === 0)
          grouped[lvl].push({
            id: generateId(),
            question: "",
            category: "",
            level: lvl,
          });
      });
      setQuestionsByLevel(grouped);
      setCurrentIndex(0);
    } catch (err: any) {
      setQuestionsByLevel({
        Beginner: [
          { id: generateId(), question: "", category: "", level: "Beginner" },
        ],
        Intermediate: [
          {
            id: generateId(),
            question: "",
            category: "",
            level: "Intermediate",
          },
        ],
        Advanced: [
          { id: generateId(), question: "", category: "", level: "Advanced" },
        ],
      });
      setCurrentIndex(0);
    }
  }, []);

  // Protect admin route
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

  const questions = questionsByLevel[currentTab];

  const updateTabQuestions = (updated: Question[]) => {
    setQuestionsByLevel((prev) => ({ ...prev, [currentTab]: updated }));
  };

  const addQuestion = () => {
    const last = questions[questions.length - 1];
    const next: Question = {
      id: generateId(),
      question: "",
      category: last?.category || "",
      level: currentTab,
    };
    const updated = [...questions, next];
    updateTabQuestions(updated);
    setCurrentIndex(questions.length);
  };

  const deleteQuestion = (i: number) => {
    if (questions.length === 1) return;
    const updated = questions.filter((_, idx) => idx !== i);
    updateTabQuestions(updated);
    setCurrentIndex(Math.min(i, updated.length - 1));
  };

  // Improved: Move to another tab and set correct index
  const updateQuestion = (field: keyof Question, val: string) => {
    if (field === "level") {
      const newLevel = val as Level;
      if (!LEVELS.includes(newLevel) || newLevel === currentTab) return;

      setQuestionsByLevel((prev) => {
        // Remove from current tab
        const currentQuestions = [...prev[currentTab]];
        const [moving] = currentQuestions.splice(currentIndex, 1);
        const newQuestion = { ...moving, level: newLevel };
        // Insert into new tab
        const newLevelQuestions = [...prev[newLevel], newQuestion];
        // Always keep at least one question per tab
        return {
          ...prev,
          [currentTab]:
            currentQuestions.length > 0
              ? currentQuestions
              : [
                  {
                    id: generateId(),
                    question: "",
                    category: "",
                    level: currentTab,
                  },
                ],
          [newLevel]: newLevelQuestions,
        };
      });

      // Switch tab and show the newly moved question (at end of list)
      setTimeout(() => {
        setCurrentTab(newLevel);
        setCurrentIndex(
          questionsByLevel[newLevel].length // will be one ahead after setState, so -1
        );
      }, 0);
    } else {
      const copy = [...questions];
      copy[currentIndex] = { ...copy[currentIndex], [field]: val };
      updateTabQuestions(copy);
      setError("");
    }
  };

  const handlePublish = useCallback(async () => {
    setIsSubmitting(true);
    setError("");
    // Flatten all questions from all levels
    const allQuestions = LEVELS.flatMap((lvl) => questionsByLevel[lvl]);
    const completedCount = allQuestions.filter(
      (q) => q.question.trim() && q.category && q.level
    ).length;
    if (completedCount === 0) {
      setError("You must complete at least one question before publishing.");
      setIsSubmitting(false);
      return;
    }
    try {
  await fetch(`${API}/api/v1/questions`, { method: "DELETE" });
  const payload = allQuestions.map((q) => ({
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
  alert("Survey published successfully!");
  fetchQuestions();
} catch (err: any) {
  setError(err.message || "Failed to publish survey.");
}setIsSubmitting(false);
}, [questionsByLevel, fetchQuestions]);
const handleLogout = useCallback(() => {
  navigate("/sbna-gameshow-form");
}, [navigate]);

  const completedCount = LEVELS.flatMap((lvl) => questionsByLevel[lvl]).filter(
    (q) => q.question.trim() && q.category && q.level
  ).length;

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Level Tabs */}
      <div className="flex justify-center pt-6 mb-2 gap-4">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            className={`px-6 py-2 rounded-t-lg font-semibold text-lg transition
              ${
                currentTab === lvl
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            onClick={() => {
              setCurrentTab(lvl);
              setCurrentIndex(0);
            }}
          >
            {lvl}
          </button>
        ))}
      </div>
      {/* Render rest of page for current level */}
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: list of questions for this level */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {currentTab} Questions
          </h3>
          <div className="space-y-2 mb-4">
            {questions.map((q, idx) => {
              const isCompleted = q.question.trim() && q.category && q.level;
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={q.id}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isCurrent
                      ? "bg-purple-100 border-purple-200 border"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentIndex(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCurrentIndex(idx);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Q{idx + 1}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                      aria-label={
                        isCompleted
                          ? "Question completed"
                          : "Question incomplete"
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {q.question.trim() || "Empty question"}
                  </p>
                </div>
              );
            })}
          </div>
          <button
            onClick={addQuestion}
            className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
          >
            ➕ Add Question
          </button>
        </div>
        {/* Main Question Edit Card */}
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold">Sanskrit Language Survey</h1>
          <p className="text-gray-600 mb-4">
            Please add/edit questions for <b>{currentTab}</b> level here.
          </p>
          {questions[currentIndex] && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Question {currentIndex + 1}
                </h3>
                <button
                  onClick={() => deleteQuestion(currentIndex)}
                  disabled={questions.length === 1}
                  className={`p-2 rounded-full hover:bg-red-100 transition ${
                    questions.length === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "text-red-500"
                  }`}
                  aria-label="Delete question"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Question Text *
                </label>
                <textarea
                  rows={4}
                  value={questions[currentIndex].question}
                  onChange={(e) => updateQuestion("question", e.target.value)}
                  placeholder="Enter your question here..."
                  maxLength={500}
                  className="w-full border-2 border-purple-500 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500">
                  {questions[currentIndex].question.length}/500 characters
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    value={questions[currentIndex].category}
                    onChange={(e) =>
                      updateQuestion("category", e.target.value)
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose a category</option>
                    <option value="Vocabulary">Vocabulary</option>
                    <option value="Grammar">Grammar</option>
                    <option value="Culture">Culture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Difficulty Level *
                  </label>
                  <select
                    value={questions[currentIndex].level}
                    onChange={(e) => updateQuestion("level", e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select difficulty</option>
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    const copy = [...questions];
                    copy[currentIndex] = {
                      ...copy[currentIndex],
                      question: "",
                      category: "",
                    };
                    updateTabQuestions(copy);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear
                </button>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center justify-center text-sm text-red-600 my-4">
                  <span className="mr-2">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Publish Button */}
      <div className="flex justify-end max-w-4xl mx-auto pb-6 pr-6">
        <button
          onClick={handlePublish}
          disabled={isSubmitting || completedCount === 0}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          📤 {isSubmitting ? "Publishing..." : "Publish All"}
        </button>
        <button
          onClick={handleLogout}
          className="ml-4 px-6 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default App;
