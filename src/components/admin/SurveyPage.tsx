// src/components/admin/SurveyPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminSurveyApi } from "../hooks/useAdminSurveyApi";
import SurveyLayout from "./SurveyLayout";
import AdminEmptyState from "./AdminEmptyState";
import { Question } from "../../types/types";

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

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  const showConfirmationDialog = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setConfirmationTitle(title);
    setConfirmationMessage(message);
    setOnConfirmAction(() => onConfirm);
    setShowConfirmation(true);
  };

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!showUIImmediately) {
      const emptyMap: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
      LEVELS.forEach((lvl) => {
        emptyMap[lvl] = [
          {
            questionID: "",
            question: "",
            questionType: "Input",
            questionCategory: "",
            questionLevel: lvl,
            timesAnswered: 0,
          },
        ];
      });
      setQuestionsByLevel(emptyMap);
      setShowUIImmediately(true);
    }
    fetchQuestions();
  }, [fetchQuestions, showUIImmediately]);

  useEffect(() => {
    if (!showUIImmediately) return;
    if (isEmpty && questions.length === 0) return;
    const map: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
    questions.forEach((q) => {
      if (q.questionLevel && LEVELS.includes(q.questionLevel as Level)) {
        map[q.questionLevel as Level].push(q);
      }
    });
    if (questions.length > 0 || mode === "create") {
      LEVELS.forEach((lvl) => {
        if (map[lvl].length === 0) {
          map[lvl].push({
            questionID: "",
            question: "",
            questionType: "Input",
            questionCategory: "",
            questionLevel: lvl,
            timesAnswered: 0,
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
    if (mode === "edit") setMode("create");
    const list = questionsByLevel[level];
    const lastCat = list[list.length - 1]?.questionCategory || "";
    const newQ: Question = {
      questionID: "",
      question: "",
      questionType: "Input",
      questionCategory: lastCat,
      questionLevel: level,
      timesAnswered: 0,
    };
    updateTabQuestions(level, [...list, newQ]);
    setCurrentTab(level);
    setCurrentIndex(list.length);
    if (isEmpty) setError("");
  };

  const onDeleteCurrent = async () => {
    const list = questionsByLevel[currentTab];
    if (list.length <= 1) return;
    const toDelete = list[currentIndex];
    if (toDelete.questionID) await deleteQuestions([toDelete]);
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
    if (toDelete.length) await deleteQuestions(toDelete);
    updateTabQuestions(levelToDelete, [
      {
        questionID: "",
        question: "",
        questionType: "Input",
        questionCategory: "",
        questionLevel: levelToDelete,
        timesAnswered: 0,
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
      if (field === "questionType" && value === "Input" && q.answers) {
        const { answers, ...rest } = q;
        newList[currentIndex] = { ...rest, [field]: value };
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

  const handleCreateNew = () => {
    showConfirmationDialog(
      "Create Survey Questions",
      "This will create new survey questions. Do you want to continue?",
      async () => {
        const allQs = LEVELS.flatMap((lvl) => questionsByLevel[lvl]).filter(
          (q) =>
            q.question.trim() &&
            q.questionCategory &&
            q.questionLevel &&
            !q.questionID
        );
        try {
          await createQuestions(allQs);
          await fetchQuestions();
        } catch (error) {
          console.error("Creation failed:", error);
        }
      }
    );
  };

  const handleUpdate = () => {
    showConfirmationDialog(
      "Update Survey Questions",
      "This will update the existing survey. Do you want to continue?",
      async () => {
        const allQs = LEVELS.flatMap((lvl) => questionsByLevel[lvl]).filter(
          (q) =>
            q.question.trim() &&
            q.questionCategory &&
            q.questionLevel &&
            q.questionID
        );
        try {
          await updateQuestions(allQs);
          await fetchQuestions();
        } catch (error) {
          console.error("Update failed:", error);
        }
      }
    );
  };

  const switchToCreateMode = () => {
    showConfirmationDialog(
      "Switch to Create Mode",
      "This will clear current questions. Do you want to continue?",
      () => {
        setMode("create");
        const emptyMap: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
        LEVELS.forEach((lvl) => {
          emptyMap[lvl] = [
            {
              questionID: "",
              question: "",
              questionType: "Input",
              questionCategory: "",
              questionLevel: lvl,
              timesAnswered: 0,
            },
          ];
        });
        setQuestionsByLevel(emptyMap);
        setCurrentIndex(0);
        setError("");
      }
    );
  };

  const switchToEditMode = async () => {
    setMode("edit");
    await fetchQuestions();
  };

  if (!showUIImmediately) {
    return <div>Loading Survey Builder...</div>;
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
        onSelectLevel={(lvl) => {
          setCurrentTab(lvl);
          setCurrentIndex(0);
        }}
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

      {/* Delete Confirmation */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Delete All Questions
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete all{" "}
              <strong>{levelToDelete}</strong> questions?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-lg"
                onClick={confirmDeleteAllQuestions}
              >
                Yes, Delete All
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-blue-700 mb-2">
              {confirmationTitle}
            </h2>
            <p className="text-gray-700 mb-6">{confirmationMessage}</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                onClick={() => {
                  setShowConfirmation(false);
                  onConfirmAction();
                }}
              >
                Yes, Confirm
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
                onClick={() => setShowConfirmation(false)}
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
