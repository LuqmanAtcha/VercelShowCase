import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const questions = [
  "Name a Sanskrit term for a natural element.",
  "What is the Sanskrit word for 'Knowledge'?",
  "Translate the word 'Sun' into Sanskrit.",
  "What is a Sanskrit name for 'River'?"
];

const UserSurvey: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || { name: "Guest", isAnonymous: true };
  
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [view, setView] = useState<'survey' | 'preview'>('survey');
  
  // New states for SurveyPage component
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [error, setError] = useState("");

  // Set the current answer when index changes
  useEffect(() => {
    setCurrentAnswer(answers[index] || "");
    setError("");
  }, [index, answers]);

  const handleSaveNext = () => {
    if (!currentAnswer.trim()) {
      setError("Please answer the question");
      return;
    }
    setShowSavePrompt(true);
  };

  const confirmSave = () => {
    setShowSavePrompt(false);
    
    // Update answers
    const updatedAnswers = [...answers];
    updatedAnswers[index] = currentAnswer;
    setAnswers(updatedAnswers);
    
    // Move to next question or preview
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setView('preview');
    }
    
    // Show saved message
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 1500);
  };

  const handleSelectQuestion = (i: number) => {
    setIndex(i);
    setView('survey');
  };

  const handlePublish = () => {
    alert("Survey Published! Thank you.");
  };

  const handleLogout = () => {
    navigate('/sbna-gameshow-form');
  };

  return (
    <div className="flex h-screen bg-purple-50">
      {/* Logout Confirmation Modal */}
      {showLogoutPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" role="dialog" aria-labelledby="logout-title">
            <h2 id="logout-title" className="text-xl font-bold text-center mb-2 text-purple-700">Confirm Logout</h2>
            <p className="text-gray-700 text-center mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowLogoutPrompt(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white shadow hover:bg-red-700"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSavePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" role="dialog" aria-labelledby="save-title">
            <h2 id="save-title" className="text-xl font-bold text-center mb-2 text-purple-700">Confirm Save</h2>
            <p className="text-gray-700 text-center mb-6">Are you sure you want to save this answer and go to the next question?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowSavePrompt(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-purple-600 text-white shadow hover:bg-purple-700"
                onClick={confirmSave}
              >
                Save and Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Toast */}
      {showSavedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg shadow-xl max-w-xs w-full p-6 flex flex-col items-center" role="alert">
            <span className="text-green-600 text-3xl mb-2">✓</span>
            <span className="text-lg font-semibold text-green-700">Answer Saved!</span>
          </div>
        </div>
      )}

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
                {answers[i]?.trim() !== '' && (
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
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SS</span>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-center mb-2 text-gray-900">Welcome {user.name} !!</h2>
            <h3 className="text-lg font-medium text-center mb-6 text-purple-700">Question-{index + 1}</h3>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
              <p className="text-lg text-center text-gray-800">{questions[index]}</p>
            </div>
            
            <div className="mb-2 font-medium text-gray-700">Your Answer</div>
            <input
              type="text"
              className="w-full border border-purple-200 rounded p-3 bg-orange-50 mb-6 outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here"
              aria-required="true"
              aria-invalid={!!error}
            />
            
            <div className="flex justify-center mb-6">
              <button
                className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"
                onClick={handleSaveNext}
              >
                {index === questions.length - 1 ? 'Preview' : 'Save and Next'}
              </button>
            </div>
            
            <div className="flex items-center justify-center mb-2">
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${((index + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-center mb-6 text-sm text-gray-600">
              Question {index + 1} of {questions.length}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center justify-center text-sm text-red-600 mb-4">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-8 border-t pt-4">
              <div className="text-xs text-gray-500 flex items-center">
                <span>Logged in as {user.name}</span>
              </div>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 flex items-center transition-colors"
                onClick={() => setShowLogoutPrompt(true)}
              >
                <span className="mr-2">⬅️</span> Logout
              </button>
            </div>
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