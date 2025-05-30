// src/components/analytics/AnalyticsDebug.tsx
import React, { useState } from "react";
import { Question, Answer } from "../../types";

interface AnalyticsDebugProps {
  questions: Question[];
  answers: Answer[];
}

export const AnalyticsDebug: React.FC<AnalyticsDebugProps> = ({ questions, answers }) => {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setShowDebug(true)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
        >
          🔍 Debug Data Structure
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Debug Information</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
        >
          Close
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Questions Data Sample:</h4>
          <div className="bg-white p-3 rounded border max-h-60 overflow-y-auto">
            <pre className="text-xs">
              {JSON.stringify(questions.slice(0, 2), null, 2)}
            </pre>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Answers Data Sample:</h4>
          <div className="bg-white p-3 rounded border max-h-60 overflow-y-auto">
            <pre className="text-xs">
              {JSON.stringify(answers.slice(0, 5), null, 2)}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium">Total Questions:</span>
          <span className="ml-2">{questions.length}</span>
        </div>
        <div>
          <span className="font-medium">Total Answer Records:</span>
          <span className="ml-2">{answers.length}</span>
        </div>
        <div>
          <span className="font-medium">Questions with Embedded Answers:</span>
          <span className="ml-2">
            {questions.filter(q => q.answers && q.answers.length > 0).length}
          </span>
        </div>
      </div>
      
      {/* Show answer structure for each question */}
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Question Answer Breakdown:</h4>
        <div className="max-h-40 overflow-y-auto">
          {questions.slice(0, 5).map((q, idx) => (
            <div key={q._id} className="mb-2 p-2 bg-white rounded border text-xs">
              <div><strong>Q{idx + 1}:</strong> {q.question.substring(0, 50)}...</div>
              <div><strong>Embedded Answers:</strong> {q.answers?.length || 0}</div>
              {q.answers && q.answers.length > 0 && (
                <div className="ml-4 mt-1">
                  {q.answers.map((ans, ansIdx) => (
                    <div key={ansIdx} className="text-gray-600">
                      • "{ans.answer}" (count: {ans.responseCount})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};