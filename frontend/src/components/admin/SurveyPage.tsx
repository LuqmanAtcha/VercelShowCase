// src/components/admin/SurveyPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminSurveyApi } from "../hooks/useAdminSurveyApi";
import SurveyLayout from "./SurveyLayout";
import { Question } from "../../types";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

type QMap = Record<Level, Question[]>;

const SurveyPage: React.FC = () => {
  // now also pull deleteAllQuestions from the hook
  const {
    questions,
    isLoading,
    error,
    setError,
    fetchQuestions,
    publishSurvey,
    deleteAllQuestions,
  } = useAdminSurveyApi();

  const [questionsByLevel, setQuestionsByLevel] = useState<QMap>({
    Beginner: [],
    Intermediate: [],
    Advanced: [],
  });
  const [currentTab, setCurrentTab] = useState<Level>("Beginner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // on mount: verify admin & fetch
  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
    } else {
      fetchQuestions();
    }
  }, [fetchQuestions, navigate]);

  // group flat questions into per-level buckets
  useEffect(() => {
    const map: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
    questions.forEach((q) => {
      if (q.questionLevel && LEVELS.includes(q.questionLevel as Level)) {
        map[q.questionLevel as Level].push(q);
      }
    });
    // ensure at least one empty placeholder per level
    LEVELS.forEach((lvl) => {
      if (map[lvl].length === 0) {
        map[lvl].push({
          _id: "",
          question: "",
          questionType: "Input",
          questionCategory: "",
          questionLevel: lvl,
        });
      }
    });
    setQuestionsByLevel(map);
  }, [questions]);

  // update a single level’s list
  const updateTabQuestions = (level: Level, list: Question[]) => {
    setQuestionsByLevel((prev) => ({ ...prev, [level]: list }));
  };

  const onSelectQuestion = (level: Level, idx: number) => {
    setCurrentTab(level);
    setCurrentIndex(idx);
  };

  const onAddQuestion = (level: Level) => {
    const list = questionsByLevel[level];
    const lastCat = list[list.length - 1]?.questionCategory || "";
    const newQ: Question = {
      _id: "",
      question: "",
      questionType: "Input",
      questionCategory: lastCat,
      questionLevel: level,
    };
    updateTabQuestions(level, [...list, newQ]);
    setCurrentTab(level);
    setCurrentIndex(list.length);
  };

  const onDeleteCurrent = async () => {
    const list = questionsByLevel[currentTab];
    if (list.length <= 1) return; // keep one placeholder
    const toDelete = list[currentIndex];
    if (toDelete._id) {
      await deleteAllQuestions([toDelete]);
      await fetchQuestions();
    }
    const newList = list.filter((_, i) => i !== currentIndex);
    updateTabQuestions(currentTab, newList);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const onDeleteAllQuestions = async (level: Level) => {
    const list = questionsByLevel[level];
    const toDelete = list.filter((q) => q._id);
    if (toDelete.length) {
      await deleteAllQuestions(toDelete);
      await fetchQuestions();
    }
    updateTabQuestions(level, [
      {
        _id: "",
        question: "",
        questionType: "Input",
        questionCategory: "",
        questionLevel: level,
      },
    ]);
    setCurrentIndex(0);
  };

  const onUpdateQuestion = (field: keyof Question, value: string) => {
    const list = questionsByLevel[currentTab];
    const q = list[currentIndex];
    if (field === "questionLevel" && LEVELS.includes(value as Level)) {
      const newLevel = value as Level;
      const updated = { ...q, questionLevel: newLevel };
      const oldList = list.filter((_, idx) => idx !== currentIndex);
      updateTabQuestions(currentTab, oldList);
      updateTabQuestions(newLevel, [...questionsByLevel[newLevel], updated]);
      setCurrentTab(newLevel);
      setCurrentIndex(questionsByLevel[newLevel].length);
    } else {
      const newList = [...list];
      newList[currentIndex] = { ...q, [field]: value };
      updateTabQuestions(currentTab, newList);
    }
    setError("");
  };

  const completedCount = Object.values(questionsByLevel)
    .flat()
    .filter(
      (q) => q.question.trim() && q.questionCategory && q.questionLevel
    ).length;

  const handlePublish = () => {
    const allQs = LEVELS.flatMap((lvl) => questionsByLevel[lvl]);
    if (
      !LEVELS.every((lvl) =>
        questionsByLevel[lvl].some(
          (q) => q.question.trim() && q.questionCategory && q.questionLevel
        )
      )
    ) {
      setError("Complete at least one question per level before publishing.");
      return;
    }
    if (window.confirm("This will delete all old data. Continue?")) {
      publishSurvey(allQs);
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
      onErrorDismiss={() => setError("")}
      onSelectQuestion={onSelectQuestion}
      onAddQuestion={onAddQuestion}
      onDeleteCurrent={onDeleteCurrent}
      onDeleteAllQuestions={onDeleteAllQuestions}
      onUpdateQuestion={onUpdateQuestion}
      onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
      onNext={() =>
        setCurrentIndex((i) =>
          Math.min(i + 1, questionsByLevel[currentTab].length - 1)
        )
      }
      onPublish={handlePublish}
      onPreview={() => {}}
      onClosePreview={() => {}}
      onLogout={() => navigate("/")}
      formTitle="Sanskrit Survey Builder"
      formDescription="Add or edit questions for each level."
    />
  );
};

export default SurveyPage;
