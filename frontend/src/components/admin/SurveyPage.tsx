// SurveyPage.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Question } from "../../type";
import { Sidebar } from "./Sidebar";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

const SurveyPage: React.FC = () => {
  const [questionsByLevel, setQuestionsByLevel] = useState<
    Record<Level, Question[]>
  >({
    Beginner: [],
    Intermediate: [],
    Advanced: [],
  });
  const [currentTab, setCurrentTab] = useState<Level>("Beginner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const isMountedRef = useRef(true);
  const navigate = useNavigate();

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/v1/questions?page=1`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch questions");

      const formatted = (data.data || []).map((q: any) => ({
        ...q,
        id: q._id,
      }));

      const grouped: Record<Level, Question[]> = {
        Beginner: [],
        Intermediate: [],
        Advanced: [],
      };
      formatted.forEach((q) => {
        if (LEVELS.includes(q.questionLevel as Level)) {
          grouped[q.questionLevel as Level].push(q);
        }
      });
      LEVELS.forEach((lvl) => {
        if (grouped[lvl].length === 0)
          grouped[lvl].push({
            id: "",
            question: "",
            questionType: "Input",
            questionCategory: "",
            questionLevel: lvl,
          });
      });
      setQuestionsByLevel(grouped);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestionsByLevel({
        Beginner: [
          {
            id: "",
            questionType: "Input",
            question: "",
            questionCategory: "",
            questionLevel: "Beginner",
          },
        ],
        Intermediate: [
          {
            id: "",
            questionType: "Input",
            question: "",
            questionCategory: "",
            questionLevel: "Intermediate",
          },
        ],
        Advanced: [
          {
            id: "",
            questionType: "Input",
            question: "",
            questionCategory: "",
            questionLevel: "Advanced",
          },
        ],
      });
      setCurrentIndex(0);
    }
  }, []);

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
      id: "",
      question: "",
      questionType: "Input",
      questionCategory: last?.questionCategory || "",
      questionLevel: currentTab,
    };
    const updated = [...questions, next];
    updateTabQuestions(updated);
    setCurrentIndex(questions.length);
  };

  const deleteQuestion = async (i: number) => {
    const questionToDelete = questions[i];
    if (questions.length === 1) return;

    if (questionToDelete.id) {
      await fetch(`${API}/api/v1/questions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionID: questionToDelete.id }),
      });
    }
    const updated = questions.filter((_, idx) => idx !== i);
    updateTabQuestions(updated);
    setCurrentIndex(Math.min(i, updated.length - 1));
  };

  const updateQuestion = (field: keyof Question, val: string) => {
    const copy = [...questions];
    copy[currentIndex] = { ...copy[currentIndex], [field]: val };
    updateTabQuestions(copy);
    setError("");
  };

  const handleDeleteAllQuestions = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ALL questions for "${currentTab}" level? This cannot be undone.`
      )
    ) {
      return;
    }
    for (const q of questions) {
      if (!q.id) continue;
      await fetch(`${API}/api/v1/questions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionID: q.id }),
      });
    }
    fetchQuestions();
  };

  const handlePublish = useCallback(async () => {
    setIsSubmitting(true);
    setError("");

    const allQuestions = LEVELS.flatMap((lvl) => questionsByLevel[lvl]);
    const isReadyToPublish = LEVELS.every((lvl) =>
      questionsByLevel[lvl].some(
        (q) => q.question.trim() && q.questionCategory && q.questionLevel
      )
    );

    if (!isReadyToPublish) {
      setError(
        "Please complete at least one question in each level (Beginner, Intermediate, Advanced) before publishing."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      await fetch(`${API}/api/v1/questions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: "ALL" }),
      });

      for (const q of allQuestions) {
        await fetch(`${API}/api/v1/questions/surveyQuestions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q.question,
            questionType: "Input",
            questionCategory: q.questionCategory,
            questionLevel: q.questionLevel,
          }),
        });
      }
      alert("Survey published successfully!");
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Failed to publish survey.");
    }
    setIsSubmitting(false);
  }, [questionsByLevel, fetchQuestions]);

  const handleLogout = useCallback(() => {
    navigate("/sbna-gameshow-form");
  }, [navigate]);

  const handleAnalytics = useCallback(() => {
    navigate("/analytics");
  }, [navigate]);

  const completedCount = questions.filter(
    (q) => q.question.trim() && q.questionCategory && q.questionLevel
  ).length;

  return (
    <div className="min-h-screen bg-purple-50">
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
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar
          questions={questions}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
          onAdd={addQuestion}
          onDeleteAll={handleDeleteAllQuestions}
          completedCount={completedCount}
          levelLabel={currentTab}
        />
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
                    value={questions[currentIndex].questionCategory}
                    onChange={(e) =>
                      updateQuestion("questionCategory", e.target.value)
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
                    value={questions[currentIndex].questionLevel}
                    onChange={(e) =>
                      updateQuestion("questionLevel", e.target.value)
                    }
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
                      questionCategory: "",
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
      <div className="flex justify-end max-w-4xl mx-auto pb-6 pr-6">
        <button
          onClick={handlePublish}
          disabled={
            isSubmitting ||
            !LEVELS.every((lvl) =>
              questionsByLevel[lvl].some(
                (q) =>
                  q.question.trim() && q.questionCategory && q.questionLevel
              )
            )
          }
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          📤 {isSubmitting ? "Publishing..." : "Publish All"}
        </button>
        <button
          onClick={handleAnalytics}
          className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📊 Analytics
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

export default SurveyPage;
