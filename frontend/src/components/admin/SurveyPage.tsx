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

  const onSelectQuestion = (level: Level, index: number) => {
    setCurrentTab(level);
    setCurrentIndex(index);
  };

  const onAddQuestion = (level: Level) => {
    const last = questionsByLevel[level][questionsByLevel[level].length - 1];
    const next: Question = {
      id: "",
      question: "",
      questionType: "Input",
      questionCategory: last?.questionCategory || "",
      questionLevel: level,
    };
    updateTabQuestions(level, [...questionsByLevel[level], next]);
    setCurrentTab(level);
    setCurrentIndex(questionsByLevel[level].length);
  };

  const onDeleteAllQuestions = (level: Level) => {
    deleteAllQuestions(questionsByLevel[level]);
    setCurrentIndex(0);
  };

  const deleteQuestion = async (i: number) => {
    const questionToDelete = questionsByLevel[currentTab][i];
    if (questionsByLevel[currentTab].length === 1) return;

    if (questionToDelete.id) {
      await deleteAllQuestions([questionToDelete]);
    }
    const updated = questionsByLevel[currentTab].filter((_, idx) => idx !== i);
    updateTabQuestions(currentTab, updated);
    setCurrentIndex(Math.min(i, updated.length - 1));
  };

  const updateQuestion = (field: keyof Question, val: string) => {
    if (field === "questionLevel" && LEVELS.includes(val as Level)) {
      const targetLevel = val as Level;
      const updatedQuestion = {
        ...questionsByLevel[currentTab][currentIndex],
        questionLevel: targetLevel,
      };

      // Remove from current tab
      const updatedCurrentTabList = questionsByLevel[currentTab].filter(
        (_, idx) => idx !== currentIndex
      );

      // Add to target tab
      const targetTabList = [...questionsByLevel[targetLevel], updatedQuestion];

      // Update both
      updateTabQuestions(currentTab, updatedCurrentTabList);
      updateTabQuestions(targetLevel, targetTabList);

      // Switch to target tab and set index to last
      setCurrentTab(targetLevel);
      setCurrentIndex(targetTabList.length - 1);
    } else {
      const copy = [...questionsByLevel[currentTab]];
      copy[currentIndex] = { ...copy[currentIndex], [field]: val };
      updateTabQuestions(currentTab, copy);
    }
    setError("");
  };

  const completedCount = Object.values(questionsByLevel)
    .flat()
    .filter(
      (q) => q.question?.trim() && q.questionCategory && q.questionLevel
    ).length;

  const handleLogout = () => {
    navigate("/sbna-gameshow-form");
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
      questions={questionsByLevel[currentTab]}
      questionsByLevel={questionsByLevel}
      currentIndex={currentIndex}
      currentLevel={currentTab}
      completedCount={completedCount}
      showPreview={false}
      isSubmitting={isLoading}
      error={error}
      onSelectQuestion={onSelectQuestion}
      onAddQuestion={onAddQuestion}
      onPrev={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
      onNext={() =>
        setCurrentIndex((prev) =>
          Math.min(prev + 1, questionsByLevel[currentTab].length - 1)
        )
      }
      onDeleteCurrent={() => deleteQuestion(currentIndex)}
      onDeleteAllQuestions={onDeleteAllQuestions}
      onUpdateQuestion={updateQuestion}
      onPublish={handlePublish}
      onPreview={() => {}}
      onClosePreview={() => {}}
      onLogout={handleLogout}
      onErrorDismiss={() => setError("")}
      formTitle="Sanskrit Language Survey"
      formDescription={`Please add/edit questions across all levels.`}
    />
  );
}

export default SurveyPage;
