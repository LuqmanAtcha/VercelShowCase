import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProficiencyLevelModal from "./proficiencyModal";
import LogoutPromptModal from "./LogoutPromptModal";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000"; // <-- fix port!
interface Question {
  _id: string;
  id?: string;
  question: string;
  questionType?: string;
  questionCategory?: string;
  questionLevel?: string;
  level?: string;
}

interface AnswerObj {
  answer: string;
}

const UserSurvey: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || { name: "Guest", isAnonymous: true };
  const [proficiency, setProficiency] = useState<string>("");
  const [showProficiencyModal, setShowProficiencyModal] = useState(true);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerObj[]>([]);
  const [view, setView] = useState<"survey" | "preview">("survey");
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [error, setError] = useState("");

  // Only fetch questions AFTER proficiency is selected

  useEffect(() => {
    if (!proficiency) return;
    setLoading(true);
    setFetchError(null);
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API}/api/v1/questions?page=1`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Failed to fetch questions");
        const formattedQuestions = (data.data || []).map((q: any) => ({
          ...q,
          id: q._id,
        }));

        const filtered = formattedQuestions.filter(
          (q: any) => (q.questionLevel || q.level) === proficiency
        );

        setQuestions(filtered);
        setAnswers(Array(filtered.length).fill({ answer: "" }));
        setIndex(0);
      } catch (err: any) {
        setFetchError(err.message || "Could not load questions.");
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [proficiency]);

  useEffect(() => {
    setCurrentAnswer(answers[index]?.answer || "");
    setError("");
  }, [index, answers]);

  // Save/Next logic
  const handleSaveNext = () => {
    if (!currentAnswer.trim()) {
      setError("Please answer the question or use Skip.");
      return;
    }
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { answer: currentAnswer };
    setAnswers(updatedAnswers);
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setView("preview");
    }
  };

  // Skip logic
  const handleSkip = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { answer: "" };
    setAnswers(updatedAnswers);
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setView("preview");
    }
    setError(""); // Clear any previous error
  };

  const handleSelectQuestion = (i: number) => {
    setIndex(i);
    setView("survey");
  };

  // Send payload with questionId
  const handlePublish = async () => {
    setIsSubmitting(true); // Optionally, add this if you have an isSubmitting state
    try {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const answerText = answers[i]?.answer ?? ""; // Empty string if skipped

        if (!q._id) continue; // Skip questions with missing IDs

        const payload = {
          questionID: q._id,
          answerText,
        };

        const res = await fetch(`${API}/api/v1/answers/answer`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Error for any individual answer
        if (!res.ok) {
          const data = await res.json();
          alert(data?.error || `Failed to submit answer for question ${i + 1}`);
          setIsSubmitting(false);
          return;
        }
      }

      alert("Survey Submitted! Thank you.");
      navigate("/login");
    } catch {
      alert("Network error – could not submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modals/loading/error/empty
  if (showProficiencyModal) {
    return (
      <ProficiencyLevelModal
        show={showProficiencyModal}
        proficiency={proficiency}
        setProficiency={setProficiency}
        onConfirm={() => {
          if (proficiency) setShowProficiencyModal(false);
        }}
      />
    );
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading questions…
      </div>
    );
  if (fetchError)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {fetchError}
      </div>
    );
  if (!questions.length)
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-700 bg-white-50">
        Sorry, there are no surveys available right now. Please come back later!
      </div>
    );

  // Main survey UI
  return (
    <>
      {/* Logout Confirmation Modal */}
      <LogoutPromptModal
        show={showLogoutPrompt}
        onConfirm={() => {
          setShowLogoutPrompt(false);
          navigate("/login");
        }}
        onCancel={() => setShowLogoutPrompt(false)}
      />

      <div className="flex h-screen bg-purple-50">
        {/* Sidebar */}
        <aside className="w-56 bg-white shadow-md p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-purple-700 mb-4">
              Questions
            </h2>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li
                  key={q._id}
                  onClick={() => handleSelectQuestion(i)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer ${
                    index === i && view === "survey"
                      ? "bg-purple-200 font-semibold"
                      : "hover:bg-purple-100"
                  }`}
                >
                  <span>Question {i + 1}</span>
                  {answers[i]?.answer?.trim() !== "" ? (
                    <span
                      className="w-3 h-3 bg-green-500 rounded-full"
                      title="Answered"
                    ></span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 h-2 w-full bg-purple-100 rounded">
            <div
              className="h-full bg-purple-500 rounded"
              style={{
                width: `${
                  (answers.filter((a) => a.answer.trim() !== "").length /
                    questions.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-4">
          {view === "survey" ? (
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl relative">
              {/* Level badge top-left */}
              <div className="absolute top-4 left-6">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                  {questions[index]?.questionLevel || questions[index]?.level}
                </span>
              </div>
              {/* Welcome top-right */}
              <div className="absolute top-4 right-6 text-right">
                <span className="text-base font-semibold text-gray-900 whitespace-nowrap">
                  Welcome {user.name}!
                </span>
              </div>
              {/* Centered Question Number */}
              <div className="mb-8 mt-2">
                <h2 className="text-3xl font-bold text-center text-purple-700">
                  Question {index + 1}
                </h2>
              </div>
              {/* Question Text */}
              <div className="mb-6 mt-2">
                <p className="text-lg font-medium text-center text-gray-900 break-words">
                  {questions[index]?.question}
                </p>
              </div>
              {/* Answer input */}
              <div className="mb-2 font-medium text-gray-700">Your Answer</div>
              <input
                type="text"
                className="w-full border border-purple-200 rounded p-3 bg-orange-50 mb-6 outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here"
                aria-required="true"
                aria-invalid={!!error}
              />
              <div className="flex flex-wrap justify-center mb-6 gap-4">
                <button
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"
                  onClick={handleSaveNext}
                >
                  {index === questions.length - 1 ? "Preview" : "Save and Next"}
                </button>
                <button
                  className="px-6 py-3 bg-gray-300 text-black rounded-lg shadow hover:bg-gray-400 transition-colors"
                  onClick={handleSkip}
                  type="button"
                >
                  Skip
                </button>
              </div>
              <div className="flex items-center justify-center mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((index + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-center mb-6 text-sm text-gray-600">
                Question {index + 1} of {questions.length}
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center justify-center text-sm text-red-600 mb-4">
                  <span className="mr-2">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-8 border-t pt-4">
                <div className="text-xs text-gray-500 flex items-center">
                  <span>Logged in as {user.name}</span>
                </div>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 flex items-center transition-colors"
                  onClick={() => setShowLogoutPrompt(true)}
                >
                  <span className="mr-2">⬅️</span> Logout
                </button>
              </div>
            </div>
          ) : (
          )}
        </main>
      </div>
    </>
  );
};

export default UserSurvey;
