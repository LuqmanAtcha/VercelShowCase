import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSurveyApi } from "../hooks/userSurveyApi";
import SurveyLayout from "../admin/SurveyLayout";
import { Question } from "../../type";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

function SurveyPage() {
  const {
    questionsByLevel,
    isLoading,
    error,
    setError,
    fetchQuestions,
    deleteAllQuestions,
    publishSurvey,
    updateTabQuestions,
  } = useSurveyApi();

  const [currentTab, setCurrentTab] = useState<Level>("Beginner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
      return;
    }
    fetchQuestions();
  }, [fetchQuestions, navigate]);

  const questions = questionsByLevel[currentTab];

  const addQuestion = () => {
    const last = questions[questions.length - 1];
    const next: Question = {
      id: "",
      question: "",
      questionType: "Input",
      questionCategory: last?.questionCategory || "",
      questionLevel: currentTab,
    };
    updateTabQuestions(currentTab, [...questions, next]);
    setCurrentIndex(questions.length);
  };

  const deleteQuestion = async (i: number) => {
    const questionToDelete = questions[i];
    if (questions.length === 1) return;

    if (questionToDelete.id) {
      await deleteAllQuestions([questionToDelete]);
    }
    const updated = questions.filter((_, idx) => idx !== i);
    updateTabQuestions(currentTab, updated);
    setCurrentIndex(Math.min(i, updated.length - 1));
  };

  const updateQuestion = (field: keyof Question, val: string) => {
    const copy = [...questions];
    copy[currentIndex] = { ...copy[currentIndex], [field]: val };
    updateTabQuestions(currentTab, copy);

    if (field === "questionLevel" && LEVELS.includes(val as Level)) {
      setCurrentTab(val as Level);
      setCurrentIndex(0);
    }
    setError("");
  };

  const completedCount = questions.filter(
    (q) => q.question?.trim() && q.questionCategory && q.questionLevel
  ).length;

  const handleLogout = () => {
    navigate("/sbna-gameshow-form");
  };

  const handleAnalytics = () => {
    navigate("/analytics");
  };

  const handlePublish = async () => {
    const allQuestions = LEVELS.flatMap((lvl) => questionsByLevel[lvl]);

    const isReadyToPublish = LEVELS.every((lvl) =>
      questionsByLevel[lvl].some(
        (q) => q.question?.trim() && q.questionCategory && q.questionLevel
      )
    );

    if (!isReadyToPublish) {
      setError(
        "Please complete at least one question in each level before publishing."
      );
      return;
    }

    if (
      window.confirm(
        "⚠️ This will create a new form, and all past answers and questions will be permanently deleted. Do you want to continue?"
      )
    ) {
      await publishSurvey(allQuestions);
      alert("✅ Survey published successfully!");
    }
  };

  return (
    <SurveyLayout
      questions={questions}
      currentIndex={currentIndex}
      completedCount={completedCount}
      showPreview={false} // hook this up if needed
      isSubmitting={isLoading}
      error={error}
      currentLevel={currentTab}
      onSelectQuestion={setCurrentIndex}
      onAddQuestion={addQuestion}
      onPrev={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
      onNext={() =>
        setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))
      }
      onDeleteCurrent={() => deleteQuestion(currentIndex)}
      onDeleteAllQuestions={() => deleteAllQuestions(questions)}
      onUpdateQuestion={updateQuestion}
      onPublish={handlePublish}
      onPreview={() => {}}
      onClosePreview={() => {}}
      onLogout={handleLogout}
      onErrorDismiss={() => setError("")}
      formTitle="Sanskrit Language Survey"
      formDescription={`Please add/edit questions for the ${currentTab} level here.`}
    />
  );
}

export default SurveyPage;
