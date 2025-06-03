import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { Question } from "../../types";

// Centralize the allowed options
const categories = ["Vocabulary", "Grammar", "Culture", "Literature", "History"] as const;
const levels = ["Beginner", "Intermediate", "Advanced"] as const;

interface QuestionCardProps {
  question: Question;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev(): void;
  onNext(): void;
  onDelete(): void;
  onUpdate(field: keyof Question, value: string): void;
  onAddNext(): void;
  currentTabLevel: string;
}

interface ConfirmationDialogProps {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  show,
  title,
  message,
  confirmText,
  confirmColor,
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center animate-in slide-in-from-bottom-4 duration-300">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2 text-blue-700">{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            className={`px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors shadow-sm ${confirmColor}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const QuestionCard: React.FC<QuestionCardProps> = React.memo(
  ({
    question,
    index,
    isFirst,
    isLast,
    onPrev,
    onNext,
    onDelete,
    onUpdate,
    onAddNext,
    currentTabLevel,
  }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showMoveNextDialog, setShowMoveNextDialog] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showAddNextDialog, setShowAddNextDialog] = useState(false);

    // Validation functions
    const isCategorySelected = () => !!(question.questionCategory?.trim());
    const isQuestionTextEntered = () => !!(question.question?.trim());
    const isLevelSelected = () => !!(question.questionLevel?.trim());
    const isQuestionComplete = () => isQuestionTextEntered() && isCategorySelected() && isLevelSelected();

    const handleClear = () => {
      if (!isQuestionTextEntered() && !isCategorySelected()) {
        // Nothing to clear, no need for confirmation
        return;
      }
      setShowClearDialog(true);
    };

    const confirmClear = () => {
      // Ensure all fields are cleared together
      onUpdate("question", "");
      onUpdate("questionCategory", "");
      setShowClearDialog(false);
    };

    const handleDeleteClick = () => {
      if (isFirst) return; // Don't show dialog if it's the first (can't delete)
      setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
      setShowDeleteDialog(false);
      onDelete();
    };

    const cancelDelete = () => {
      setShowDeleteDialog(false);
    };

    const handleNextClick = () => {
      if (isLast) return; // Can't move next if it's the last question

      // If question has content but is incomplete, show confirmation
      if ((isQuestionTextEntered() || isCategorySelected()) && !isQuestionComplete()) {
        setShowMoveNextDialog(true);
      } else {
        // If question is complete or completely empty, move directly
        onNext();
      }
    };

    const confirmMoveNext = () => {
      setShowMoveNextDialog(false);
      onNext();
    };

    const cancelMoveNext = () => {
      setShowMoveNextDialog(false);
    };

    const handleAddNextClick = () => {
      // If current question has content but is incomplete, show confirmation
      if ((isQuestionTextEntered() || isCategorySelected()) && !isQuestionComplete()) {
        setShowAddNextDialog(true);
      } else {
        // If question is complete or completely empty, add directly
        onAddNext();
      }
    };

    const confirmAddNext = () => {
      setShowAddNextDialog(false);
      onAddNext();
    };

    const cancelAddNext = () => {
      setShowAddNextDialog(false);
    };

    const nearLimit = (question.question?.length || 0) > 450;
    const isCompleted = isQuestionComplete();

    return (
      <>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-2xl font-bold text-gray-900">
                Question {index + 1}
              </h3>
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                }`}
                title={isCompleted ? "Question completed" : "Question incomplete"}
              />
            </div>
            <button
              onClick={handleDeleteClick}
              disabled={isFirst}
              className={`p-2 rounded-lg transition-colors ${
                isFirst
                  ? "opacity-50 cursor-not-allowed text-gray-400"
                  : "text-red-500 hover:bg-red-100 hover:text-red-600"
              }`}
              aria-label="Delete question"
              title="Delete question"
            >
              <X size={20} />
            </button>
          </div>

          {/* Category and Level - Must be selected first */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Category <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(Select first)</span>
              </label>
              <select
                value={question.questionCategory || ""}
                onChange={(e) => onUpdate("questionCategory", e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="">Choose a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                value={question.questionLevel || currentTabLevel}
                onChange={(e) => onUpdate("questionLevel", e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="">Select difficulty</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Text - Disabled until category is selected */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Question Text <span className="text-red-500">*</span>
              {!isCategorySelected() && (
                <span className="text-xs text-orange-600 ml-1">(Select category first)</span>
              )}
            </label>
            <div className="relative">
              <textarea
                rows={4}
                value={question.question || ""}
                onChange={(e) => onUpdate("question", e.target.value)}
                placeholder={
                  isCategorySelected() 
                    ? "Enter your question here..." 
                    : "Please select a category first to enable text input"
                }
                maxLength={500}
                disabled={!isCategorySelected()}
                className={`w-full border-2 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  !isCategorySelected()
                    ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white border-gray-200"
                }`}
              />
              <div className="absolute bottom-3 right-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    nearLimit
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {question.question?.length || 0}/500
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleClear}
              disabled={!isQuestionTextEntered() && !isCategorySelected()}
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg transition-colors ${
                !isQuestionTextEntered() && !isCategorySelected()
                  ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
              }`}
            >
              Clear All Fields
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={onPrev}
                disabled={isFirst}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <button
                onClick={handleNextClick}
                disabled={isLast}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>

              <button
                onClick={handleAddNextClick}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus size={16} />
                <span>Add Next</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          show={showDeleteDialog}
          title="Delete Question"
          message={`Are you sure you want to delete Question ${index + 1}? This action cannot be undone.`}
          confirmText="Yes, Delete"
          confirmColor="bg-red-600 hover:bg-red-700"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />

        {/* Move Next Confirmation Dialog */}
        <ConfirmationDialog
          show={showMoveNextDialog}
          title="Incomplete Question"
          message="This question is not complete. Are you sure you want to move to the next question? You can return to complete it later."
          confirmText="Yes, Move Next"
          confirmColor="bg-blue-600 hover:bg-blue-700"
          onConfirm={confirmMoveNext}
          onCancel={cancelMoveNext}
        />

        {/* Clear Fields Confirmation Dialog */}
        <ConfirmationDialog
          show={showClearDialog}
          title="Clear All Fields"
          message="Are you sure you want to clear all fields for this question? This action cannot be undone."
          confirmText="Yes, Clear"
          confirmColor="bg-orange-600 hover:bg-orange-700"
          onConfirm={confirmClear}
          onCancel={() => setShowClearDialog(false)}
        />

        {/* Add Next Confirmation Dialog */}
        <ConfirmationDialog
          show={showAddNextDialog}
          title="Incomplete Question"
          message="The current question is not complete. Are you sure you want to add a new question? You can return to complete this one later."
          confirmText="Yes, Add Next"
          confirmColor="bg-purple-600 hover:bg-purple-700"
          onConfirm={confirmAddNext}
          onCancel={cancelAddNext}
        />
      </>
    );
  }
);

export default QuestionCard;