// src/components/UserSurvey.tsx
import React, { useState } from 'react';

const questions = [
  "Name a Sanskrit term for a natural element.",
  "What is the Sanskrit word for 'Knowledge'?",
  "Translate the word 'Sun' into Sanskrit.",
  "What is a Sanskrit name for 'River'?"
];

const UserSurvey: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [view, setView] = useState<'survey' | 'preview'>('survey');

  const handleNext = () => {
    if (answers[index].trim() === '') return;
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setView('preview');
    }
  };

  const handleAnswerChange = (value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSelectQuestion = (i: number) => {
    setIndex(i);
    setView('survey');
  };

  const handlePublish = () => {
    alert("Survey Published! Thank you.");
  };

  return (
    <div className="flex h-screen bg-purple-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-md p-6 overflow-y-auto flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-purple-700 mb-4">Questions</h2>
          <ul className="space-y-2">
            {questions.map((_, i) => (
              <li
                key={i}
                onClick={() => handleSelectQuestion(i)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer ${
                  index === i && view === 'survey'
                    ? 'bg-purple-200 font-semibold'
                    : 'hover:bg-purple-100'
                }`}
              >
                <span>Q{i + 1}</span>
                {answers[i].trim() !== '' && (
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 h-2 w-full bg-purple-100 rounded">
          <div
            className="h-full bg-purple-500 rounded"
            style={{ width: `${(answers.filter(a => a.trim() !== '').length / questions.length) * 100}% `}}
          ></div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4">
        {view === 'survey' ? (
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl text-center">
            <h2 className="text-xl font-bold text-purple-700 mb-2">Welcome Ganesh !!</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Question-{index + 1}
            </h3>
            <p className="text-gray-600 mb-4">{questions[index]}</p>
            <input
              type="text"
              value={answers[index]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Your Answer"
              className="w-full p-3 rounded-md border border-gray-300 bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
            <button
              onClick={handleNext}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
            >
              {index === questions.length - 1 ? 'Preview' : 'Save and Next'}
            </button>
            <p className="mt-4 text-sm text-gray-600">
              Question {index + 1} of {questions.length}
            </p>
            {answers[index].trim() === '' && (
              <p className="text-orange-500 text-sm mt-2">Please answer the question</p>
            )}
            <div className="mt-6 text-sm text-gray-500">Logged in as user</div>
            <button
              className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
              onClick={() => alert("Logged out")}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl text-center">
            <h2 className="text-xl font-bold text-purple-700 mb-6">Preview Your Answers</h2>
            <ul className="text-left mb-6 space-y-4">
              {questions.map((q, i) => (
                <li key={i}>
                  <p className="font-medium text-gray-800">Q{i + 1}. {q}</p>
                  <p className="text-purple-700 ml-4">Ans: {answers[i]}</p>
                </li>
              ))}
            </ul>
            <button
              onClick={handlePublish}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mr-4"
            >
              Publish
            </button>
            <button
              onClick={() => setView('survey')}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
            >
              Back to Survey
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserSurvey;
