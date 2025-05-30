// src/components/analytics/ResponsesTable.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Question } from "../../types";

interface ResponsesTableProps {
  questions: Question[];
  answerCounts: Record<string, number>;
  skipCounts: Record<string, number>;
  recentAnsweredIds: Set<string>;
}

export const ResponsesTable: React.FC<ResponsesTableProps> = ({
  questions,
  answerCounts,
  skipCounts,
  recentAnsweredIds,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded shadow overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4">Responses Table</h3>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-purple-100">
            <th className="px-2 py-1">#</th>
            <th className="px-2 py-1">Question</th>
            <th className="px-2 py-1">Category</th>
            <th className="px-2 py-1">Level</th>
            <th className="px-2 py-1">Answered</th>
            <th className="px-2 py-1">Skipped</th>
            <th className="px-2 py-1">Skip%</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, index) => {
            const answeredQ = answerCounts[q._id];
            const skippedQ = skipCounts[q._id];
            const totalQ = answeredQ + skippedQ;
            const skipRate = totalQ > 0 ? ((skippedQ / totalQ) * 100).toFixed(1) : "0.0";
            
            return (
              <tr
                key={q._id}
                className={`even:bg-purple-50 ${
                  recentAnsweredIds.has(q._id) ? 'bg-yellow-100 font-semibold' : ''
                }`}
              >
                <td className="px-2 py-1">{index + 1}</td>
                <td
                  className="px-2 py-1 text-purple-600 underline cursor-pointer"
                  onClick={() => navigate(`/analytics/question/${q._id}`)}
                >
                  {q.question}
                </td>
                <td className="px-2 py-1">{q.questionCategory}</td>
                <td className="px-2 py-1">{q.questionLevel}</td>
                <td className="px-2 py-1">{answeredQ}</td>
                <td className="px-2 py-1">{skippedQ}</td>
                <td className="px-2 py-1">{skipRate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};