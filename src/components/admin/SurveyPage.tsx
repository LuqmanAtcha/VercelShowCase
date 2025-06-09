// src/components/admin/SurveyPage.tsx - Corrected with Simple Loading
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminSurveyApi } from "../hooks/useAdminSurveyApi";
import SurveyLayout from "./SurveyLayout";
import AdminEmptyState from "./AdminEmptyState";
import LoadingPopup from "../common/LoadingPopup";
import { Question } from "../../types/types";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];
type QMap = Record<Level, Question[]>;

const SurveyPage: React.FC = () => {
  const {
    questions: existingQuestions,
    isLoading,
    error,
    isEmpty,
    setError,
    fetchQuestions,
    createQuestions,
    updateQuestions,
    deleteQuestions,
  } = useAdminSurveyApi();

  // Loading states
  const [loadingState, setLoadingState] = useState({
    show: false,
    message: "",
    variant: "fetch" as "create" | "update" | "delete" | "fetch",
  });

  // Separate state for new questions (Add mode) vs existing questions (Edit mode)
  const [newQuestionsByLevel, setNewQuestionsByLevel] = useState<QMap>({
    Beginner: [],
    Intermediate: [],
    Advanced: [],
  });
  
  const [existingQuestionsByLevel, setExistingQuestionsByLevel] = useState<QMap>({
    Beginner: [],
    Intermediate: [],
    Advanced: [],
  });

  const hasFetchedOnce = useRef(false);
  const [currentTab, setCurrentTab] = useState<Level>("Beginner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<Level>("Beginner");
  const [showUIImmediately, setShowUIImmediately] = useState(false);
  const navigate = useNavigate();

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  // Loading helpers
  const showLoading = (variant: typeof loadingState.variant, message?: string) => {
    setLoadingState({ show: true, variant, message: message || "" });
  };

  const hideLoading = () => {
    setLoadingState({ show: false, message: "", variant: "fetch" });
  };

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

  // Admin check
  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Initialize UI immediately for better UX
  useEffect(() => {
    if (!showUIImmediately) {
      initializeEditMode();
      setShowUIImmediately(true);
    }

    // Fetch existing questions once
    if (showUIImmediately && !hasFetchedOnce.current) {
      hasFetchedOnce.current = true;
      showLoading("fetch", "Loading Questions...");
      fetchQuestions().finally(() => hideLoading());
    }
  }, [fetchQuestions, showUIImmediately]);

  // Update existing questions when fetched
  useEffect(() => {
    if (!showUIImmediately) return;
    
    if (mode === "edit") {
      updateExistingQuestionsFromFetch();
    }
  }, [existingQuestions, showUIImmediately, mode]);

  // Initialize edit mode with existing questions or empty placeholders
  const initializeEditMode = () => {
    const map: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
    
    existingQuestions.forEach((q) => {
      if (q.questionLevel && LEVELS.includes(q.questionLevel as Level)) {
        map[q.questionLevel as Level].push(q);
      }
    });

    LEVELS.forEach((lvl) => {
      if (map[lvl].length === 0) {
        map[lvl].push(createEmptyQuestion(lvl));
      }
    });

    setExistingQuestionsByLevel(map);
  };

  // Update existing questions when new data is fetched
  const updateExistingQuestionsFromFetch = () => {
    if (isEmpty && existingQuestions.length === 0) return;
    
    const map: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
    
    existingQuestions.forEach((q) => {
      if (q.questionLevel && LEVELS.includes(q.questionLevel as Level)) {
        map[q.questionLevel as Level].push(q);
      }
    });

    LEVELS.forEach((lvl) => {
      if (map[lvl].length === 0) {
        map[lvl].push(createEmptyQuestion(lvl));
      }
    });

    setExistingQuestionsByLevel(map);
  };

  // Initialize add mode with clean slate
  const initializeAddMode = () => {
    const emptyMap: QMap = { Beginner: [], Intermediate: [], Advanced: [] };
    
    LEVELS.forEach((lvl) => {
      emptyMap[lvl] = [createEmptyQuestion(lvl)];
    });

    setNewQuestionsByLevel(emptyMap);
  };

  // Create an empty question template
  const createEmptyQuestion = (level: Level): Question => ({
    questionID: "",
    question: "",
    questionType: "Input",
    questionCategory: "",
    questionLevel: level,
    timesAnswered: 0,
  });

  // Get current questions based on mode
  const getCurrentQuestions = (): Question[] => {
    const questionsByLevel = mode === "create" ? newQuestionsByLevel : existingQuestionsByLevel;
    return questionsByLevel[currentTab] || [];
  };

  // Get current questions by level based on mode
  const getCurrentQuestionsByLevel = (): QMap => {
    return mode === "create" ? newQuestionsByLevel : existingQuestionsByLevel;
  };

  // Update questions based on current mode
  const updateCurrentQuestions = (level: Level, questions: Question[]) => {
    if (mode === "create") {
      setNewQuestionsByLevel(prev => ({ ...prev, [level]: questions }));
    } else {
      setExistingQuestionsByLevel(prev => ({ ...prev, [level]: questions }));
    }
  };

  // Mode switching functions
  const switchToCreateMode = () => {
    setMode("create");
    initializeAddMode();
    setCurrentIndex(0);
    setError("");
    console.log("🆕 Switched to CREATE mode - sidebar should show only new questions");
  };

  const switchToEditMode = async () => {
    setMode("edit");
    setCurrentIndex(0);
    setError("");
    showLoading("fetch", "Switching to Edit Mode...");
    try {
      await fetchQuestions();
    } finally {
      hideLoading();
    }
    console.log("✏️ Switched to EDIT mode - sidebar should show existing questions");
  };

  // Question management functions
  const onSelectQuestion = (level: Level, idx: number) => {
    setCurrentTab(level);
    setCurrentIndex(idx);
  };

  const onAddQuestion = (level: Level) => {
    if (mode === "edit") {
      switchToCreateMode();
      return;
    }

    const currentQuestions = newQuestionsByLevel[level];
    const hasEmptyQuestion = currentQuestions.some(q => !q.question?.trim());
    
    if (hasEmptyQuestion) {
      setError("Please complete the current question before adding a new one.");
      return;
    }

    const lastQuestion = currentQuestions[currentQuestions.length - 1];
    const lastCategory = lastQuestion?.questionCategory || "";
    
    const newQuestion = createEmptyQuestion(level);
    newQuestion.questionCategory = lastCategory;
    
    const updatedQuestions = [...currentQuestions, newQuestion];
    setNewQuestionsByLevel(prev => ({ ...prev, [level]: updatedQuestions }));
    
    setCurrentTab(level);
    setCurrentIndex(updatedQuestions.length - 1);
    
    if (isEmpty) setError("");
    console.log(`➕ Added new question to ${level} level in CREATE mode`);
  };

  const onDeleteCurrent = async () => {
    const currentQuestions = getCurrentQuestions();
    const questionToDelete = currentQuestions[currentIndex];
    
    if (mode === "edit" && questionToDelete.questionID) {
      showLoading("delete", "Deleting Question...");
      try {
        await deleteQuestions([questionToDelete]);
      } catch (error) {
        console.error("Failed to delete question:", error);
        setError("Failed to delete question from database");
        return;
      } finally {
        hideLoading();
      }
    }

    const newList = currentQuestions.filter((_, i) => i !== currentIndex);
    
    if (newList.length === 0) {
      newList.push(createEmptyQuestion(currentTab));
    }
    
    updateCurrentQuestions(currentTab, newList);
    
    const newIndex = Math.min(currentIndex, newList.length - 1);
    setCurrentIndex(Math.max(newIndex, 0));
    
    console.log(`🗑️ Deleted question from ${currentTab} level. Remaining: ${newList.length}`);
  };

  const onDeleteAllQuestions = (level: Level) => {
    setLevelToDelete(level);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAllQuestions = async () => {
    const currentQuestions = getCurrentQuestions();
    
    if (mode === "edit") {
      const questionsToDelete = currentQuestions.filter(q => q.questionID);
      if (questionsToDelete.length) {
        showLoading("delete", `Deleting All ${levelToDelete} Questions...`);
        try {
          await deleteQuestions(questionsToDelete);
        } catch (error) {
          console.error("Failed to delete questions:", error);
          setError("Failed to delete questions from database");
          setShowDeleteDialog(false);
          return;
        } finally {
          hideLoading();
        }
      }
    }

    updateCurrentQuestions(levelToDelete, [createEmptyQuestion(levelToDelete)]);
    setCurrentIndex(0);
    setShowDeleteDialog(false);
  };

  const onUpdateQuestion = (field: keyof Question, value: any) => {
    const currentQuestions = getCurrentQuestions();
    const question = currentQuestions[currentIndex];
    
    if (field === "questionLevel" && LEVELS.includes(value as Level)) {
      const newLevel = value as Level;
      const updatedQuestion = { ...question, questionLevel: newLevel };
      
      const remainingQuestions = currentQuestions.filter((_, idx) => idx !== currentIndex);
      updateCurrentQuestions(currentTab, remainingQuestions);
      
      const targetLevelQuestions = getCurrentQuestionsByLevel()[newLevel];
      updateCurrentQuestions(newLevel, [...targetLevelQuestions, updatedQuestion]);
      
      setCurrentTab(newLevel);
      setCurrentIndex(targetLevelQuestions.length);
    } else {
      const newList = [...currentQuestions];
      if (field === "questionType" && value === "Input" && question.answers) {
        const { answers, ...rest } = question;
        newList[currentIndex] = { ...rest, [field]: value };
      } else {
        newList[currentIndex] = { ...question, [field]: value };
      }
      updateCurrentQuestions(currentTab, newList);
    }
    
    setError("");
  };

  // Calculate completed questions based on current mode
  const getCompletedCount = (): number => {
    const questionsByLevel = getCurrentQuestionsByLevel();
    return Object.values(questionsByLevel)
      .flat()
      .filter(q => q.question.trim() && q.questionCategory && q.questionLevel)
      .length;
  };

  // Submission handlers
  const handleCreateNew = () => {
    showConfirmationDialog(
      "Create Survey Questions",
      "This will create new survey questions. Do you want to continue?",
      async () => {
        const allNewQuestions = LEVELS.flatMap(lvl => newQuestionsByLevel[lvl]).filter(
          q => q.question.trim() && q.questionCategory && q.questionLevel && !q.questionID
        );
        
        showLoading("create", "Creating Questions...");
        try {
          await createQuestions(allNewQuestions);
          console.log(`✅ Created ${allNewQuestions.length} new questions`);
          await switchToEditMode();
        } catch (error) {
          console.error("Creation failed:", error);
        } finally {
          hideLoading();
        }
      }
    );
  };

  const handleUpdate = async () => {
    const allExistingQuestions = LEVELS.flatMap(lvl => existingQuestionsByLevel[lvl]).filter(
      q => q.question.trim() && q.questionCategory && q.questionLevel && q.questionID
    );

    showLoading("update", "Updating Questions...");
    try {
      await updateQuestions(allExistingQuestions);
      console.log(`✅ Updated ${allExistingQuestions.length} existing questions`);
      await fetchQuestions();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      hideLoading();
    }
  };

  // Show loading or empty state
  if (!showUIImmediately) {
    return (
      <LoadingPopup
        show={true}
        variant="fetch"
        message="Initializing Survey Builder..."
      />
    );
  }

  // Show empty state only when in edit mode and no questions exist
  if (mode === "edit" && isEmpty && existingQuestions.length === 0) {
    return (
      <>
        <AdminEmptyState
          onAddQuestion={(level) => {
            switchToCreateMode();
            setTimeout(() => onAddQuestion(level), 0);
          }}
          isEmpty={true}
          error={error}
        />
        <LoadingPopup
          show={loadingState.show}
          variant={loadingState.variant}
          message={loadingState.message}
        />
      </>
    );
  }

  return (
    <>
      <SurveyLayout
        questions={getCurrentQuestions()}
        questionsByLevel={getCurrentQuestionsByLevel()}
        currentIndex={currentIndex}
        currentLevel={currentTab}
        completedCount={getCompletedCount()}
        showPreview={showPreview}
        isSubmitting={loadingState.show || isLoading}
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
        onPrev={() => setCurrentIndex(i => Math.max(i - 1, 0))}
        onNext={() => setCurrentIndex(i => Math.min(i + 1, getCurrentQuestions().length - 1))}
        onCreateNew={handleCreateNew}
        onUpdate={handleUpdate}
        onSwitchToCreate={switchToCreateMode}
        onSwitchToEdit={switchToEditMode}
        onPreview={() => setShowPreview(true)}
        onClosePreview={() => setShowPreview(false)}
        onLogout={() => navigate("/")}
        formTitle="Sanskrit Survey Builder"
        formDescription={mode === "create" ? "Create new questions for each level." : "Edit existing questions."}
      />

      {/* Loading Popup */}
      <LoadingPopup
        show={loadingState.show}
        variant={loadingState.variant}
        message={loadingState.message}
      />

      {/* Delete Confirmation */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Delete All Questions
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete all <strong>{levelToDelete}</strong> questions?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                onClick={confirmDeleteAllQuestions}
              >
                Yes, Delete All
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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