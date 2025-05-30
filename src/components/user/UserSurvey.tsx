import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserSurveyApi } from "../hooks/useUserSurveyApi";
import ProficiencyModal from "../common/ProficiencyModal";
import LogoutPrompt from "../common/LogoutPrompt";
import UserSidebar from "./UserSidebar";
import UserQuestionCard from "./UserQuestionCard";

const UserSurvey: React.FC = () => {
  const navigate = useNavigate();

  // 1) Set proficiency level
  const [proficiency, setProficiency] = useState<string>("");
  const [showModal, setShowModal] = useState(true);

  // 2) Hook loads questions for that level
  const { questions, loading, error, submitting, setError, submitAllAnswers } =
    useUserSurveyApi(proficiency);

  // 3) Local answer state & view state
  const [answers, setAnswers] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  // Initialize answers array when questions arrive
  useEffect(() => {
    if (questions.length) {
      setAnswers(Array(questions.length).fill(""));
    }
  }, [questions]);

  // Count of answered (non-"" and non-"skip")
  const answeredCount = answers.filter((a) => a && a !== "skip").length;

  // Move to next question or show preview dialog
  const handleSaveNext = () => {
    if (!answers[index]?.trim()) {
      setError("Please answer or Skip.");
      return;
    }
    setError("");
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setShowPreviewDialog(true);
    }
  };

  // Mark this one skipped
  const handleSkip = () => {
    const copy = [...answers];
    if (copy[index] === "skip") {
      // Unskip - clear the answer
      copy[index] = "";
    } else {
      // Skip - mark as skipped
      copy[index] = "skip";
    }
    setAnswers(copy);
    setError("");

    // Only auto-advance if we're skipping (not unskipping)
    if (copy[index] === "skip") {
      if (index < questions.length - 1) {
        setIndex((i) => i + 1);
      } else {
        setShowPreviewDialog(true);
      }
    }
  };

  // Jump to a question in the sidebar
  const handleSelectQuestion = (i: number) => {
    setIndex(i);
    setShowPreviewDialog(false);
  };

  // Submit all answers
  const handlePublish = async () => {
    try {
      const payload = questions.map((q, i) => ({
        questionID: q._id,
      answerText: answers[i] === "skip" ? "" : (answers[i] || ""),
      }));
      await submitAllAnswers(payload);
      alert("Survey submitted successfully! Thank you for your participation.");
      navigate("/login");
    } catch (e: any) {
      alert(`Failed to submit survey: ${e.message}`);
    }
  };

  // Close preview dialog
  const handleClosePreview = () => {
    setShowPreviewDialog(false);
  };

  // Handle answer change
  const handleAnswerChange = (value: string) => {
    const copy = [...answers];
    copy[index] = value;
    setAnswers(copy);
    setError(""); // Clear any existing errors when user types
  };

  // --- Render phases ---
  if (showModal) {
    return (
      <ProficiencyModal
        show
        proficiency={proficiency}
        setProficiency={setProficiency}
        onConfirm={() => {
          if (proficiency) setShowModal(false);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-700 text-lg font-medium">
            Loading your survey...
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-700 text-lg font-medium">
            No surveys available for {proficiency} level
          </p>
          <p className="text-gray-500 text-sm mt-2">Please check back later</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LogoutPrompt
        show={showLogoutPrompt}
        onConfirm={() => navigate("/login")}
        onCancel={() => setShowLogoutPrompt(false)}
      />

      <div className="flex h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
        <UserSidebar
          questions={questions}
          answers={answers}
          index={index}
          answeredCount={answeredCount}
          onSelectQuestion={handleSelectQuestion}
        />

        <UserQuestionCard
          questions={questions}
          answers={answers}
          index={index}
          error={error}
          showPreviewDialog={showPreviewDialog}
          answeredCount={answeredCount}
          submitting={submitting}
          onAnswerChange={handleAnswerChange}
          onSaveNext={handleSaveNext}
          onSkip={handleSkip}
          onPublish={handlePublish}
          onClosePreview={handleClosePreview}
          onLogout={() => setShowLogoutPrompt(true)}
        />
      </div>
    </>
  );
};

export default UserSurvey;