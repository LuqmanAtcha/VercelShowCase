// src/components/admin/Header.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutPrompt from "../common/LogoutPrompt";
import UpdatePrompt from "../common/UpdateConfirmPrompt";

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
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const handleLogoutClick = () => setShowLogoutPrompt(true);
  const handleConfirmLogout = () => {
    setShowLogoutPrompt(false);
    onLogout();
  };
  const handleCancelLogout = () => setShowLogoutPrompt(false);

  // Update popup logic
  const handleUpdateClick = () => setShowUpdatePrompt(true);
  const handleConfirmUpdate = () => {
    setShowUpdatePrompt(false);
    onUpdate();
  };
  const handleCancelUpdate = () => setShowUpdatePrompt(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white bg-opacity-90 backdrop-blur border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Logo + Title */}
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

          {/* Center: Mode Toggle */}
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button
              onClick={onSwitchToCreate}
              className={`px-5 py-2 rounded-full font-semibold flex items-center gap-2 shadow-sm transition
                ${
                  mode === "create"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50"
                }`}
            >
              <span className="text-lg">➕</span> Add
            </button>
            <button
              onClick={onSwitchToEdit}
              className={`px-5 py-2 rounded-full font-semibold flex items-center gap-2 shadow-sm transition
                ${
                  mode === "edit"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
                }`}
            >
              <span className="text-lg">✏️</span> Edit
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <button
              onClick={() => navigate("/analytics")}
              className="flex items-center gap-2 px-4 py-2 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition font-semibold"
            >
              📊 Analytics
            </button>
            <button
              onClick={onPreview}
              className="flex items-center gap-2 px-4 py-2 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition font-semibold"
            >
              👁️ Preview
            </button>
            {mode === "create" ? (
              <button
                onClick={onCreateNew}
                disabled={isSubmitting || completedCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
              >
                ➕ {isSubmitting ? "Creating..." : "Create New"}
              </button>
            ) : (
              <button
                onClick={handleUpdateClick}
                disabled={isSubmitting || completedCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
              >
                ✏️ {isSubmitting ? "Updating..." : "Update Existing"}
              </button>
            )}
            <button
              onClick={handleLogoutClick}
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              🚪 Logout
            </button>
          </div>
        </div>
        {/* Divider */}
        <div className="w-full h-[2px] bg-gradient-to-r from-purple-200 via-gray-100 to-blue-200 opacity-70" />
      </header>

      {/* LOGOUT MODAL */}
      <LogoutPrompt
        show={showLogoutPrompt}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
      {/* UPDATE MODAL */}
      <UpdatePrompt
        show={showUpdatePrompt}
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
      />
    </>
  );
};