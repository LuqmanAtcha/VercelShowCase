import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Question, Answer } from "../../types";
import { fetchAllQuestionsAndAnswers } from "../api/adminSurveyApi";
import { ResponsesTable } from "../analytics/ResponsesTable";
import { useAnalyticsData } from "../hooks/useAnalyticsData";

const ResponsesPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentAnsweredIds, setRecentAnsweredIds] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  
  const navigate = useNavigate();

  // Handle refresh button click
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const { questions: fetchedQuestions, answers: fetchedAnswers } =
        await fetchAllQuestionsAndAnswers();
      setQuestions(fetchedQuestions);
      setAnswers(fetchedAnswers);

      const sorted = [...fetchedAnswers].sort((a, b) => {
        const t1 = new Date(a.createdAt || "").getTime();
        const t2 = new Date(b.createdAt || "").getTime();
        return t2 - t1;
      });
      const recentIds = new Set(sorted.slice(0, 5).map((a) => a.questionId));
      setRecentAnsweredIds(recentIds);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount with admin check
  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
    } else {
      const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
          const { questions: fetchedQuestions, answers: fetchedAnswers } =
            await fetchAllQuestionsAndAnswers();
          setQuestions(fetchedQuestions);
          setAnswers(fetchedAnswers);

          const sorted = [...fetchedAnswers].sort((a, b) => {
            const t1 = new Date(a.createdAt || "").getTime();
            const t2 = new Date(b.createdAt || "").getTime();
            return t2 - t1;
          });
          const recentIds = new Set(sorted.slice(0, 5).map((a) => a.questionId));
          setRecentAnsweredIds(recentIds);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [navigate]);

  // Use the custom hook to process data
  const analyticsData = useAnalyticsData(questions);

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || q.questionCategory === filterCategory;
    const matchesLevel = !filterLevel || q.questionLevel === filterLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Get unique categories and levels for filter dropdowns
  const categories = [...new Set(questions.map(q => q.questionCategory))].filter(Boolean);
  const levels = [...new Set(questions.map(q => q.questionLevel))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📋</span>
              </div>
              <h2 className="text-2xl font-bold">Survey Responses</h2>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
                onClick={handleRefresh}
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                📈 Analytics
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                onClick={() => navigate("/dashboard")}
              >
                ← Back
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-700 text-lg font-medium">
                Loading responses...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📋</span>
              </div>
              <h2 className="text-2xl font-bold">Survey Responses</h2>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
                onClick={handleRefresh}
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                📈 Analytics
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                onClick={() => navigate("/dashboard")}
              >
                ← Back
              </button>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Error loading responses</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Simplified Header */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">📋</span>
            </div>
            <h2 className="text-2xl font-bold">Survey Responses</h2>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
              onClick={handleRefresh}
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              📈 Analytics
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => navigate("/dashboard")}
            >
              ← Back
            </button>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Questions
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by question text..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || filterCategory || filterLevel) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("");
                  setFilterLevel("");
                }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear all filters
              </button>
              <span className="ml-4 text-sm text-gray-500">
                Showing {filteredQuestions.length} of {questions.length} questions
              </span>
            </div>
          )}
        </div>

        {/* Responses Table */}
        <ResponsesTable
          questions={filteredQuestions}
          answerCounts={analyticsData.answerCounts}
          skipCounts={analyticsData.skipCounts}
          recentAnsweredIds={recentAnsweredIds}
        />
      </div>
    </div>
  );
};

export default ResponsesPage;