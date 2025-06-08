import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Question } from "../../types/types";
import { fetchAllQuestionsAndAnswersAdmin } from "../api/adminSurveyApi";
import { useAnalyticsData } from "../hooks/useAnalyticsData";

const ResponsesPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentAnsweredIds, setRecentAnsweredIds] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const navigate = useNavigate();

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const { questions: fetchedQuestions, answers: fetchedAnswers } =
        await fetchAllQuestionsAndAnswersAdmin();
      setQuestions(fetchedQuestions);
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

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { questions: fetchedQuestions, answers: fetchedAnswers } =
          await fetchAllQuestionsAndAnswersAdmin();
        setQuestions(fetchedQuestions);
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
  }, [navigate]);

  const analyticsData = useAnalyticsData(questions);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className="text-gray-400">↕️</span>;
    return (
      <span className="text-purple-600">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const filteredAndSortedQuestions = React.useMemo(() => {
    let filtered = questions.filter((q) => {
      const questionText = (q.question || "").toLowerCase().trim();
      const searchText = searchTerm.toLowerCase().trim();
      const matchesSearch = !searchText || questionText.includes(searchText);
      const matchesCategory =
        !filterCategory || q.questionCategory === filterCategory;
      const matchesLevel = !filterLevel || q.questionLevel === filterLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case "category":
            aValue = a.questionCategory;
            bValue = b.questionCategory;
            break;
          case "level":
            const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
            aValue =
              levelOrder[a.questionLevel as keyof typeof levelOrder] || 4;
            bValue =
              levelOrder[b.questionLevel as keyof typeof levelOrder] || 4;
            break;
          case "answered":
            aValue = analyticsData.answerCounts[a.questionID] || 0;
            bValue = analyticsData.answerCounts[b.questionID] || 0;
            break;
          case "skipped":
            aValue = analyticsData.skipCounts[a.questionID] || 0;
            bValue = analyticsData.skipCounts[b.questionID] || 0;
            break;
          case "skipRate":
            const aAnswered = analyticsData.answerCounts[a.questionID] || 0;
            const aSkipped = analyticsData.skipCounts[a.questionID] || 0;
            const aTotal = aAnswered + aSkipped;
            aValue = aTotal > 0 ? (aSkipped / aTotal) * 100 : 0;

            const bAnswered = analyticsData.answerCounts[b.questionID] || 0;
            const bSkipped = analyticsData.skipCounts[b.questionID] || 0;
            const bTotal = bAnswered + bSkipped;
            bValue = bTotal > 0 ? (bSkipped / bTotal) * 100 : 0;
            break;
          case "total":
            aValue =
              (analyticsData.answerCounts[a.questionID] || 0) +
              (analyticsData.skipCounts[a.questionID] || 0);
            bValue =
              (analyticsData.answerCounts[b.questionID] || 0) +
              (analyticsData.skipCounts[b.questionID] || 0);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    questions,
    searchTerm,
    filterCategory,
    filterLevel,
    sortField,
    sortDirection,
    analyticsData,
  ]);

  const categories = [
    ...new Set(questions.map((q) => q.questionCategory)),
  ].filter(Boolean);
  const levels = [...new Set(questions.map((q) => q.questionLevel))].filter(
    Boolean
  );

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
                onClick={() => navigate("/analytics")}
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
                onClick={() => navigate("/analytics")}
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col">
      <div className="flex-shrink-0 p-6 pb-0">
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
              onClick={() => navigate("/analytics")}
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

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Showing {filteredAndSortedQuestions.length} of{" "}
                {questions.length} questions
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-xl font-semibold mb-4">Responses Table</h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Total Questions:
                  </span>
                  <span className="ml-2 font-bold">
                    {filteredAndSortedQuestions.length}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Total Answers:
                  </span>
                  <span className="ml-2 font-bold text-green-600">
                    {Object.values(analyticsData.answerCounts).reduce(
                      (sum, count) => sum + count,
                      0
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Total Skips:
                  </span>
                  <span className="ml-2 font-bold text-amber-600">
                    {Object.values(analyticsData.skipCounts).reduce(
                      (sum, count) => sum + count,
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-h-[26.4rem] overflow-y-auto border-t border-gray-200">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-purple-100 z-10">
                <tr>
                  <th className="px-3 py-2 font-semibold">#</th>
                  <th className="px-3 py-2 font-semibold">Question</th>
                  <th
                    className="px-3 py-2 font-semibold cursor-pointer hover:bg-purple-200 transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center justify-between">
                      Category
                      <SortIndicator field="category" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 font-semibold cursor-pointer hover:bg-purple-200 transition-colors"
                    onClick={() => handleSort("level")}
                  >
                    <div className="flex items-center justify-between">
                      Level
                      <SortIndicator field="level" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 font-semibold text-green-700 cursor-pointer hover:bg-purple-200 transition-colors"
                    onClick={() => handleSort("answered")}
                  >
                    <div className="flex items-center justify-between">
                      Answered
                      <SortIndicator field="answered" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 font-semibold text-amber-700 cursor-pointer hover:bg-purple-200 transition-colors"
                    onClick={() => handleSort("skipped")}
                  >
                    <div className="flex items-center justify-between">
                      Skipped
                      <SortIndicator field="skipped" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 font-semibold text-red-700 cursor-pointer hover:bg-purple-200 transition-colors"
                    onClick={() => handleSort("skipRate")}
                  >
                    <div className="flex items-center justify-between">
                      Skip%
                      <SortIndicator field="skipRate" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-2 font-semibold cursor-pointer hover:bg-purple-200 transition-colors"
                    onClick={() => handleSort("total")}
                  >
                    <div className="flex items-center justify-between">
                      Total
                      <SortIndicator field="total" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No questions found. Questions need to be added to see
                      analytics.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedQuestions.map((q, index) => {
                    const answeredQ =
                      analyticsData.answerCounts[q.questionID] || 0;
                    const skippedQ =
                      analyticsData.skipCounts[q.questionID] || 0;
                    const totalQ = answeredQ + skippedQ;
                    const skipRate =
                      totalQ > 0
                        ? ((skippedQ / totalQ) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <tr
                        key={q.questionID || `response-row-${index}`}
                        className={`border-b hover:bg-gray-50 ${
                          recentAnsweredIds.has(q.questionID)
                            ? "bg-yellow-100 font-semibold"
                            : index % 2 === 0
                            ? "bg-white"
                            : "bg-purple-25"
                        }`}
                      >
                        <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                        <td
                          className="px-3 py-2 text-purple-600 underline cursor-pointer hover:text-purple-800 max-w-xs"
                          onClick={() => {
                            console.log(
                              "🎯 Navigating to question:",
                              q.questionID
                            );
                            navigate(`/analytics/question/${q.questionID}`);
                          }}
                          title={q.question}
                        >
                          <div className="truncate">
                            {q.question.length > 50
                              ? `${q.question.substring(0, 50)}...`
                              : q.question}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {q.questionCategory}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              q.questionLevel === "Beginner"
                                ? "bg-green-100 text-green-800"
                                : q.questionLevel === "Intermediate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {q.questionLevel}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-green-700">
                              {answeredQ}
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="font-medium text-amber-700">
                              {skippedQ}
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`font-medium ${
                              parseFloat(skipRate) > 50
                                ? "text-red-600"
                                : parseFloat(skipRate) > 25
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {skipRate}%
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-700">
                          {totalQ}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsesPage;
