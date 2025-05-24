import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProficiencyLevelModal from "./proficiencyModal.tsx";
import LogoutPromptModal from "./LogoutPromptModal.tsx";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

interface Question {
  _id: string;
  id?: string;
  question: string;
  questionType?: string;
  questionCategory?: string;
  questionLevel?: string;
  level?: string; // for safety
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

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
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
        const res = await fetch(`${API}/api/v1/questions/?page=1`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Failed to fetch questions");

        const formattedQuestions = (data.questions || []).map((q: any) => ({
          ...q,
          id: q._id,
        }));

        const filtered = formattedQuestions.filter(
          (q: any) =>
            (q.questionLevel || q.level) === proficiency
        );

        setQuestions(filtered);
        setAnswers(Array(filtered.length).fill(""));
        setIndex(0); // always start at first question
      } catch (err: any) {
        setFetchError(err.message || "Could not load questions.");
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [proficiency]);

  useEffect(() => {
    setCurrentAnswer(answers[index] || "");
    setError("");
  }, [index, answers]);

  const handleSaveNext = () => {
    if (!currentAnswer.trim()) {
      setError("Please answer the question");
      return;
    }
    const updatedAnswers = [...answers];
    updatedAnswers[index] = currentAnswer;
    setAnswers(updatedAnswers);
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setView("preview");
    }
  };

  const handleSelectQuestion = (i: number) => {
    setIndex(i);
    setView("survey");
  };

  const handlePublish = async () => {
    const payload = {
      user: {
        name: user.name,
        isAnonymous: user.isAnonymous,
        proficiency,
      },
      answers: questions.map((q, i) => ({
        questionId: q._id,
        answer: answers[i] || "",
      })),
    };

    try {
      const res = await fetch(`${API}/api/v1/answers/surveyAnswers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data?.error || "Failed to submit answers");
        return;
      }
      alert("Survey Submitted! Thank you.");
      navigate("/login");
    } catch {
      alert("Network error – could not submit.");
    }
  };

  // --- Early returns for modal/loading/error/empty states ---

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

  // --- Main survey UI ---
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
                  <span>Q{i + 1}</span>
                  {answers[i]?.trim() !== "" && (
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 h-2 w-full bg-purple-100 rounded">
            <div
              className="h-full bg-purple-500 rounded"
              style={{
                width: `${
                  (answers.filter((a) => a.trim() !== "").length / questions.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-4">
          {view === "survey" ? (
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
              <h2 className="text-xl font-semibold text-center mb-2 text-gray-900">
                Welcome {user.name} !!
              </h2>
              <h3 className="text-lg font-medium text-center mb-6 text-purple-700">
                Question-{index + 1}
              </h3>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
                <p className="text-lg text-center text-gray-800">
                  {questions[index]?.question}
                </p>
              </div>
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
              <div className="flex justify-center mb-6">
                <button
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"
                  onClick={handleSaveNext}
                >
                  {index === questions.length - 1 ? "Preview" : "Save and Next"}
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
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl text-center">
              <h2 className="text-xl font-bold text-purple-700 mb-6">
                Preview Your Answers
              </h2>
              <ul className="text-left mb-6 space-y-4">
                {questions.map((q, i) => (
                  <li key={q._id}>
                    <p className="font-medium text-gray-800">
                      Q{i + 1}. {q.question}
                    </p>
                    <p className="text-purple-700 ml-4">Ans: {answers[i]}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mr-4"
              >
                Publish
              </button>
              <button
                onClick={() => setView("survey")}
                className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
              >
                Back to Survey
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default UserSurvey;
