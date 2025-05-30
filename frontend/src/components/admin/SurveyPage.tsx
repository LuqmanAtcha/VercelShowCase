import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminSurveyApi } from "../hooks/useAdminSurveyApi";
import SurveyLayout from "./SurveyLayout";
import { Question } from "../../types";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];
type QMap = Record<Level, Question[]>;

const SurveyPage: React.FC = () => {
  const {
    questions,
    isLoading,
    error,
    setError,
    fetchQuestions,
    createQuestions,
    updateQuestions,
    deleteQuestions,
  } = useAdminSurveyApi();

  const [questionsByLevel, setQuestionsByLevel] = useState<QMap>({
    Beginner: [],
    Intermediate: [],
    Advanced: [],
  });
  const [currentTab, setCurrentTab] = useState<Level>("Beginner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  // On mount: verify admin & fetch
  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
    } else {
      fetchQuestions();
    }
  }, [fetchQuestions, navigate]);

  // Group flat questions into per-level buckets
  useEffect(() => {
    const map: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
    
    // If we have existing questions, we're in edit mode
    if (questions.length > 0) {
      setMode("edit");
      questions.forEach((q) => {
        if (q.questionLevel && LEVELS.includes(q.questionLevel as Level)) {
          map[q.questionLevel as Level].push(q);
        }
      });
    } else {
      setMode("create");
    }

    // Ensure at least one empty placeholder per level
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

  // Update a single level's list
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
    
    // If it's an existing question (has _id), delete from backend
    if (toDelete._id) {
      await deleteQuestions([toDelete]);
    }
    
    // Remove from local state
    const newList = list.filter((_, i) => i !== currentIndex);
    updateTabQuestions(currentTab, newList);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const onDeleteAllQuestions = async (level: Level) => {
    const list = questionsByLevel[level];
    const toDelete = list.filter((q) => q._id);
    
    if (toDelete.length) {
      await deleteQuestions(toDelete);
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

  const handleCreateNew = () => {
    if (window.confirm("This will create new survey questions. Continue?")) {
      const allQs = LEVELS.flatMap((lvl) => questionsByLevel[lvl])
        .filter(q => q.question.trim() && q.questionCategory && q.questionLevel);
      createQuestions(allQs);
    }
  };

  const handleUpdate = () => {
    if (window.confirm("This will update the existing survey. Continue?")) {
      const allQs = LEVELS.flatMap((lvl) => questionsByLevel[lvl])
        .filter(q => q.question.trim() && q.questionCategory && q.questionLevel);
      updateQuestions(allQs);
    }
  };

  const switchToCreateMode = () => {
    if (window.confirm("Switch to create mode? This will clear current questions.")) {
      setMode("create");
      const emptyMap: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
      LEVELS.forEach((lvl) => {
        emptyMap[lvl] = [{
          _id: "",
          question: "",
          questionType: "Input",
          questionCategory: "",
          questionLevel: lvl,
        }];
      });
      setQuestionsByLevel(emptyMap);
      setCurrentIndex(0);
    }
  };

  const switchToEditMode = async () => {
    setMode("edit");
    await fetchQuestions();
  };

  return (
    <>
      <SurveyLayout
        questions={questionsByLevel[currentTab]}
        questionsByLevel={questionsByLevel}
        currentIndex={currentIndex}
        currentLevel={currentTab}
        completedCount={completedCount}
        showPreview={showPreview}
        isSubmitting={isLoading}
        error={error}
        mode={mode}
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
        onCreateNew={handleCreateNew}
        onUpdate={handleUpdate}
        onSwitchToCreate={switchToCreateMode}
        onSwitchToEdit={switchToEditMode}
        onPreview={() => setShowPreview(true)}
        onClosePreview={() => setShowPreview(false)}
        onLogout={() => navigate("/")}
        formTitle="Sanskrit Survey Builder"
        formDescription="Add or edit questions for each level."
      />
    </>
  );
};

export default SurveyPage;