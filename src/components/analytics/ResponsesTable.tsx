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
      
      {/* Summary Stats */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Total Questions:</span>
            <span className="ml-2 font-bold">{questions.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Answers:</span>
            <span className="ml-2 font-bold text-green-600">
              {Object.values(answerCounts).reduce((sum, count) => sum + count, 0)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Skips:</span>
            <span className="ml-2 font-bold text-amber-600">
              {Object.values(skipCounts).reduce((sum, count) => sum + count, 0)}
            </span>
          </div>
        </div>
      </div>

      <table className="w-full text-left border border-gray-200">
        <thead>
          <tr className="bg-purple-100">
            <th className="px-3 py-2 font-semibold">#</th>
            <th className="px-3 py-2 font-semibold">Question</th>
            <th className="px-3 py-2 font-semibold">Category</th>
            <th className="px-3 py-2 font-semibold">Level</th>
            <th className="px-3 py-2 font-semibold text-green-700">Answered</th>
            <th className="px-3 py-2 font-semibold text-amber-700">Skipped</th>
            <th className="px-3 py-2 font-semibold text-red-700">Skip%</th>
            <th className="px-3 py-2 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, index) => {
            const answeredQ = answerCounts[q._id] || 0;
            const skippedQ = skipCounts[q._id] || 0;
            const totalQ = answeredQ + skippedQ;
            const skipRate = totalQ > 0 ? ((skippedQ / totalQ) * 100).toFixed(1) : "0.0";
            
            return (
              <tr
                key={q._id}
                className={`border-b hover:bg-gray-50 ${
                  recentAnsweredIds.has(q._id) ? 'bg-yellow-100 font-semibold' : 
                  index % 2 === 0 ? 'bg-white' : 'bg-purple-25'
                }`}
              >
                <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                <td
                  className="px-3 py-2 text-purple-600 underline cursor-pointer hover:text-purple-800 max-w-xs"
                  onClick={() => navigate(`/analytics/question/${q._id}`)}
                  title={q.question}
                >
                  <div className="truncate">
                    {q.question.length > 50 ? `${q.question.substring(0, 50)}...` : q.question}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {q.questionCategory}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    q.questionLevel === 'Beginner' ? 'bg-green-100 text-green-800' :
                    q.questionLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {q.questionLevel}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-700">{answeredQ}</span>
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="font-medium text-amber-700">{skippedQ}</span>
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`font-medium ${
                    parseFloat(skipRate) > 50 ? 'text-red-600' :
                    parseFloat(skipRate) > 25 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {skipRate}%
                  </span>
                </td>
                <td className="px-3 py-2 font-medium text-gray-700">{totalQ}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No questions found. Questions need to be added to see analytics.
        </div>
      )}
    </div>
  );
};