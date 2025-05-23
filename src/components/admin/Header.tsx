// src/components/admin/Header.tsx
import React from "react";

interface HeaderProps {
  completedCount: number;
  totalCount: number;
  onPreview(): void;
  onPublish(): void;
  isPublishing: boolean;
  onLogout(): void;
}

export const Header: React.FC<HeaderProps> = ({
  completedCount,
  totalCount,
  onPreview,
  onPublish,
  isPublishing,
  onLogout,
}) => (
  <div className="bg-white border-b shadow-sm">
    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SF</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Survey Form</h1>
          <p className="text-sm text-gray-500">Sanskrit Survey Builder</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
        >
          👁️ Preview
        </button>
        <button
          onClick={onPublish}
          disabled={isPublishing || completedCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          📤 {isPublishing ? "Publishing..." : "Publish"}
        </button>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  </div>
);
