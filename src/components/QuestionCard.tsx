import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "../type";

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
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isFirst,
  isLast,
  onPrev,
  onNext,
  onDelete,
  onUpdate,
  onAddNext,
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-sm border"
    >
      {/* content identical to your existing card, replacing state calls with props */}
    </motion.div>
  </AnimatePresence>
);
