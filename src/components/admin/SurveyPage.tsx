// src/components/admin/SurveyPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminSurveyApi } from "../hooks/useAdminSurveyApi";
import SurveyLayout from "./SurveyLayout";
import AdminEmptyState from "./AdminEmptyState";
import { Question } from "../../types";
 
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];
type QMap = Record<Level, Question[]>;
 
const SurveyPage: React.FC = () => {
  const {
    questions,
    isLoading,
    error,
    isEmpty,
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
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<Level>("Beginner");
  const [showUIImmediately, setShowUIImmediately] = useState(false);
  const navigate = useNavigate();
 
  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
      return;
    }
  }, [navigate]);
 // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!showUIImmediately) {
      const emptyMap: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
      
      LEVELS.forEach((lvl) => {
        emptyMap[lvl] = [{
          questionID: "",
          question: "",
          questionType: "Input",
          questionCategory: "",
          questionLevel: lvl,
          timesAnswered: 0
        }];
      });
      
      setQuestionsByLevel(emptyMap);
      setShowUIImmediately(true);
    }
    
    fetchQuestions();
  }, [fetchQuestions, showUIImmediately]);
 
  useEffect(() => {
    if (!showUIImmediately) return;

    // If we have an error and it indicates empty database, don't process questions
    if (isEmpty && questions.length === 0) {
      return;
    }

    const map: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
   
    questions.forEach((q) => {
      if (q.questionLevel && LEVELS.includes(q.questionLevel as Level)) {
        map[q.questionLevel as Level].push(q);
      }
    });

    // Only add empty questions if we actually have some questions or if we're in create mode
    if (questions.length > 0 || mode === "create") {
      LEVELS.forEach((lvl) => {
        if (map[lvl].length === 0) {
          map[lvl].push({
            questionID: "",
            question: "",
            questionType: "Input",
            questionCategory: "",
            questionLevel: lvl,
            timesAnswered: 0
          });
        }
      });
    }
    
    setQuestionsByLevel(map);
  }, [questions, showUIImmediately, isEmpty, mode]);
 
  const updateTabQuestions = (level: Level, list: Question[]) => {
    setQuestionsByLevel((prev) => ({ ...prev, [level]: list }));
  };
 
  const onSelectQuestion = (level: Level, idx: number) => {
    setCurrentTab(level);
    setCurrentIndex(idx);
  };
 
  const onAddQuestion = (level: Level) => {
    console.log("onAddQuestion called with level:", level);
    if (mode === "edit") {
      setMode("create");
    }
    
    const list = questionsByLevel[level];
    const lastCat = list[list.length - 1]?.questionCategory || "";
    const newQ: Question = {
      questionID: "",
      question: "",
      questionType: "Input",
      questionCategory: lastCat,
      questionLevel: level,
      timesAnswered: 0
    };
    updateTabQuestions(level, [...list, newQ]);
    setCurrentTab(level);
    setCurrentIndex(list.length);
    
    // Clear any "no questions" error when user starts adding
    if (isEmpty) {
      setError("");
    }
    
  };
 
  // const onPrevQuestion = () => {
  //   if (currentIndex > 0) {
  //     setCurrentIndex(currentIndex - 1);
  //   }
  // };
 
  // const onNextQuestion = () => {
  //   const list = questionsByLevel[currentTab];
  //   if (currentIndex < list.length - 1) {
  //     setCurrentIndex(currentIndex + 1);
  //   }
  // };
 
  const onDeleteCurrent = async () => {
    const list = questionsByLevel[currentTab];
    if (list.length <= 1) return;
   
    const toDelete = list[currentIndex];
   
    if (toDelete.questionID) {
      await deleteQuestions([toDelete]);
    }
   
    const newList = list.filter((_, i) => i !== currentIndex);
    updateTabQuestions(currentTab, newList);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };
 
  const onDeleteAllQuestions = (level: Level) => {
    setLevelToDelete(level);
    setShowDeleteDialog(true);
  };
 
  const confirmDeleteAllQuestions = async () => {
    const list = questionsByLevel[levelToDelete];
    const toDelete = list.filter((q) => q.questionID);
   
    if (toDelete.length) {
      await deleteQuestions(toDelete);
    }
   
    updateTabQuestions(levelToDelete, [
      {
        questionID: "",
        question: "",
        questionType: "Input",
        questionCategory: "",
        questionLevel: levelToDelete,
        timesAnswered: 0
      },
    ]);
    setCurrentIndex(0);
    setShowDeleteDialog(false);
  };
 
  const onUpdateQuestion = (field: keyof Question, value: any) => {
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
      
      if (field === "questionType") {
        if (value === "Input" && q.answers) {
          const { answers, ...rest } = q;
          newList[currentIndex] = { ...rest, [field]: value };
        } else {
          newList[currentIndex] = { ...q, [field]: value };
        }
      } else {
        newList[currentIndex] = { ...q, [field]: value };
      }
      
      updateTabQuestions(currentTab, newList);
    }
    setError("");
  };
 
  const completedCount = Object.values(questionsByLevel)
    .flat()
    .filter(
      (q) => q.question.trim() && q.questionCategory && q.questionLevel
    ).length;
 
  const handleCreateNew = async () => {
    if (window.confirm("This will create new survey questions. Continue?")) {
      const allQs = LEVELS.flatMap((lvl) => questionsByLevel[lvl])
        .filter(q => q.question.trim() && q.questionCategory && q.questionLevel && !q.questionID);
      
      try {
        await createQuestions(allQs);
        await fetchQuestions();
      } catch (error) {
        console.error("Creation failed:", error);
      }
    }
  };
 
  const handleUpdate = async () => {
    if (window.confirm("This will update the existing survey. Continue?")) {
      const allQs = LEVELS.flatMap((lvl) => questionsByLevel[lvl])
        .filter(q => q.question.trim() && q.questionCategory && q.questionLevel && q.questionID);
      
      console.log("🔍 Questions being sent for update:", allQs.map(q => ({
        questionID: q.questionID,
        question: q.question.substring(0, 30) + '...',
        type: q.questionType,
        answerCount: q.answers?.length || 0
      })));
      
      try {
        await updateQuestions(allQs);
        await fetchQuestions();
      } catch (error) {
        console.error("Update failed:", error);
      }
    }
  };
 
  const switchToCreateMode = () => {
    if (window.confirm("Switch to create mode? This will clear current questions.")) {
      setMode("create");
      const emptyMap: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
      LEVELS.forEach((lvl) => {
        emptyMap[lvl] = [{
          questionID: "",
          question: "",
          questionType: "Input",
          questionCategory: "",
          questionLevel: lvl,
          timesAnswered: 0
        }];
      });
      setQuestionsByLevel(emptyMap);
      setCurrentIndex(0);
      setError(""); // Clear any errors when switching to create mode
    }
  };
 
  const switchToEditMode = async () => {
    setMode("edit");
    await fetchQuestions();
  };

  if (!showUIImmediately) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-700 text-lg font-medium">
            Loading Survey Builder...
          </p>
        </div>
      </div>
    );
  }

// Only show empty state if database is truly empty AND no questions have been added locally
const hasAnyQuestions = Object.values(questionsByLevel).some(levelQuestions => 
  levelQuestions && levelQuestions.length > 0
);

if ((isEmpty || (error && error.includes("No questions found"))) && !hasAnyQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-white bg-opacity-90 backdrop-blur border-b shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center shadow text-white text-lg font-bold">
                SF
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Survey Form
                </h1>
                <span className="text-xs text-gray-400 tracking-wide">
                  Admin Panel
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/analytics")}
                className="flex items-center gap-2 px-4 py-2 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition font-semibold"
                disabled={isEmpty}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                🚪 Logout
              </button>
            </div>
          </div>
          <div className="w-full h-[2px] bg-gradient-to-r from-purple-200 via-gray-100 to-blue-200 opacity-70" />
        </header>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row px-16 py-8 justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-4xl">
            <AdminEmptyState 
              onAddQuestion={onAddQuestion}
              isEmpty={isEmpty}
              error={error.includes("Network error") || error.includes("Unable to connect") ? error : undefined}
            />
          </div>
        </div>
      </div>
    );
  }
 
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

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-red-700">Delete All Questions</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete all <span className="font-semibold">{levelToDelete}</span> level questions?
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                onClick={confirmDeleteAllQuestions}
              >
                Yes, Delete All
              </button>
              <button
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SurveyPage;