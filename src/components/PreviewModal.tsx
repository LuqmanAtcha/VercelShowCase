import React from "react";
import { X } from "lucide-react";
import { Question } from "../type";

interface PreviewModalProps {
  title: string;
  description: string;
  questions: Question[];
  onClose(): void;
  onPublish(): void;
  isPublishing: boolean;
  completedCount: number;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  title,
  description,
  questions,
  onClose,
  onPublish,
  isPublishing,
  completedCount,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      {/* modal header, body, and footer identical to your JSX, using props */}
    </div>
  </div>
);