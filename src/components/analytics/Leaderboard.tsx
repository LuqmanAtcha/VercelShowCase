// src/components/analytics/Leaderboard.tsx
import React from "react";

interface LeaderboardItem {
  question: string;
  responses: number;
}

interface LeaderboardProps {
  items: LeaderboardItem[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ items }) => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-semibold mb-2">Leaderboard - Top 5 Answered Questions</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex justify-between border-b pb-1">
            <span>{item.question}</span>
            <span className="font-semibold text-purple-700">{item.responses} answers</span>
          </li>
        ))}
      </ul>
    </div>
  );
};