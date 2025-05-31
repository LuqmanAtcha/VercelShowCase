import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutPrompt from "../common/LogoutPrompt";

interface HeaderProps {
  completedCount: number;
  totalCount: number;
  mode: "create" | "edit";
  onPreview(): void;
  onCreateNew(): void;
  onUpdate(): void;
  onSwitchToCreate(): void;
  onSwitchToEdit(): void;
  isSubmitting: boolean;
  onLogout(): void;
}

export const Header: React.FC<HeaderProps> = ({
  completedCount,
  totalCount,
  mode,
  onPreview,
  onCreateNew,
  onUpdate,
  onSwitchToCreate,
  onSwitchToEdit,
  isSubmitting,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutPrompt(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutPrompt(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutPrompt(false);
  };

  return (
    <>
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Top Row - Title and Mode Selection */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Survey Form</h1>
                <p className="text-sm text-gray-500">Sanskrit Survey Builder</p>
              </div>
            </div>
            
            {/* Mode Selection Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={onSwitchToCreate}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "create"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ➕ Create Mode
              </button>
              <button
                onClick={onSwitchToEdit}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "edit"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ✏️ Edit Mode
              </button>
            </div>
          </div>

          {/* Bottom Row - Actions */}
          <div className="flex items-center justify-between">
            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-purple-700">{completedCount}</span> completed questions
              </div>
              <div className="text-xs text-gray-500">
                Mode: <span className="font-medium capitalize">{mode}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/analytics")}
                className="flex items-center gap-2 px-4 py-2 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
              >
                📊 Analytics
              </button>
              <button
                onClick={onPreview}
                className="flex items-center gap-2 px-4 py-2 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
              >
                👁️ Preview
              </button>
              
              {mode === "create" ? (
                <button
                  onClick={onCreateNew}
                  disabled={isSubmitting || completedCount === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  ➕ {isSubmitting ? "Creating..." : "Create New"}
                </button>
              ) : (
                <button
                  onClick={onUpdate}
                  disabled={isSubmitting || completedCount === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  ✏️ {isSubmitting ? "Updating..." : "Update Existing"}
                </button>
              )}
              
              <button
                onClick={handleLogoutClick}
                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <LogoutPrompt
        show={showLogoutPrompt}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
};