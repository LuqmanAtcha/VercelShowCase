// Enhanced QuestionDetailsPage.tsx - Fixed ID handling and better answer viewing
import React, { useEffect, useState, useMemo } from "react";
import {
  fetchAnswersByQuestionId,
  fetchAllQuestionsAdmin,
} from "../api/adminSurveyApi";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useParams, useNavigate } from "react-router-dom";
import { Question } from "../../types/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Answer {
  answerID: string;
  questionId: string;
  answer: string;
  createdAt?: string;
}

interface AnswerStats {
  totalAnswers: number;
  uniqueAnswers: number;
  averageLength: number;
  mostCommonAnswer: string;
  longestAnswer: string;
  shortestAnswer: string;
}

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "list" | "stats">("chart");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"frequency" | "length" | "alphabetical">(
    "frequency"
  );
  const navigate = useNavigate();

  useEffect(() => {
    // Admin check first
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      if (!id) {
        setError("No question ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("🔍 Fetching data for question ID:", id);

        // First, get all questions to find the specific question
        const allQuestions = await fetchAllQuestionsAdmin();
        console.log("📋 All questions fetched:", allQuestions.length);

        // Find the question by ID (handle both _id and questionID formats)
        const foundQuestion = allQuestions.find(
          (q) =>
            q.questionID === id ||
            (q as any)._id === id ||
            String(q.questionID) === String(id)
        );

        console.log("🎯 Found question:", foundQuestion);

        if (!foundQuestion) {
          setError(`Question with ID "${id}" not found`);
          setLoading(false);
          return;
        }

        setQuestion(foundQuestion);

        // Now fetch answers for this question
        const answerData = await fetchAnswersByQuestionId(id);
        console.log("💬 Answers fetched:", answerData.length);

        setAnswers(answerData);
      } catch (e: any) {
        console.error("❌ Error fetching data:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Calculate answer statistics
  const answerStats: AnswerStats = useMemo(() => {
    if (answers.length === 0) {
      return {
        totalAnswers: 0,
        uniqueAnswers: 0,
        averageLength: 0,
        mostCommonAnswer: "",
        longestAnswer: "",
        shortestAnswer: "",
      };
    }

    const answerTexts = answers
      .map((a) => a.answer)
      .filter((text) => text.trim() !== "");
    const uniqueAnswers = [...new Set(answerTexts)];

    // Calculate frequencies
    const frequencies: Record<string, number> = {};
    answerTexts.forEach((answer) => {
      frequencies[answer] = (frequencies[answer] || 0) + 1;
    });

    const mostCommon =
      Object.entries(frequencies).sort(([, a], [, b]) => b - a)[0]?.[0] || "";

    const lengths = answerTexts.map((a) => a.length);
    const averageLength =
      lengths.length > 0
        ? Math.round(
            lengths.reduce((sum, len) => sum + len, 0) / lengths.length
          )
        : 0;

    const longest = answerTexts.reduce(
      (longest, current) =>
        current.length > longest.length ? current : longest,
      ""
    );

    const shortest = answerTexts.reduce(
      (shortest, current) =>
        current.length < shortest.length ? current : shortest,
      answerTexts[0] || ""
    );

    return {
      totalAnswers: answerTexts.length,
      uniqueAnswers: uniqueAnswers.length,
      averageLength,
      mostCommonAnswer: mostCommon,
      longestAnswer: longest,
      shortestAnswer: shortest,
    };
  }, [answers]);

  // Build frequency map for charts
  const answerFrequencies: Record<string, number> = useMemo(() => {
    const frequencies: Record<string, number> = {};
    answers.forEach((a) => {
      if (a.answer.trim() !== "") {
        frequencies[a.answer] = (frequencies[a.answer] || 0) + 1;
      }
    });
    return frequencies;
  }, [answers]);

  // Filter and sort answers based on search and sort criteria
  const filteredAnswers = useMemo(() => {
    let filtered = Object.entries(answerFrequencies);

    if (searchTerm) {
      filtered = filtered.filter(([answer]) =>
        answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case "frequency":
        filtered.sort(([, a], [, b]) => b - a);
        break;
      case "alphabetical":
        filtered.sort(([a], [b]) => a.localeCompare(b));
        break;
      case "length":
        filtered.sort(([a], [b]) => b.length - a.length);
        break;
    }

    return filtered;
  }, [answerFrequencies, searchTerm, sortBy]);

  const chartData = {
    labels: filteredAnswers
      .slice(0, 10)
      .map(([answer]) =>
        answer.length > 30 ? answer.substring(0, 30) + "..." : answer
      ),
    datasets: [
      {
        label: "Answer Frequency",
        data: filteredAnswers.slice(0, 10).map(([, freq]) => freq),
        backgroundColor: [
          "#8B5CF6",
          "#06B6D4",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#EC4899",
          "#6366F1",
          "#84CC16",
          "#F97316",
          "#14B8A6",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: viewMode === "chart" ? ("y" as const) : undefined,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${question?.question.substring(0, 50)}${
          question?.question && question.question.length > 50 ? "..." : ""
        }`,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const fullAnswer = filteredAnswers[context.dataIndex]?.[0] || "";
            return `${fullAnswer}: ${
              context.parsed.y || context.parsed.x
            } responses`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Question Details</h2>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-700 text-lg font-medium">
                Loading question details...
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
            <h2 className="text-2xl font-bold">Question Details</h2>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold">
                Error loading question details
              </p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question || answers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Question Details</h2>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">
              No Responses Found
            </h3>
            <p className="text-blue-700 mb-4">
              {question
                ? "This question hasn't received any responses yet."
                : "Question not found in the database."}
            </p>
            <button
              onClick={() => navigate("/responses")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Question Analysis
            </h2>
            <p className="text-gray-600 mt-1">
              Detailed response analysis and statistics
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Question Info Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Question Details
            </h3>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  question.questionLevel === "Beginner"
                    ? "bg-green-100 text-green-800"
                    : question.questionLevel === "Intermediate"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {question.questionLevel}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {question.questionCategory}
              </span>
            </div>
          </div>
          <p className="text-gray-800 text-lg leading-relaxed">
            {question.question}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Question ID:</span>
                <p className="font-mono text-xs text-gray-700">
                  {question.questionID}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <p className="font-medium">
                  {question.questionType === "Mcq"
                    ? "Multiple Choice"
                    : "Text Input"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Total Responses:</span>
                <p className="font-bold text-purple-600">
                  {answerStats.totalAnswers}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Unique Answers:</span>
                <p className="font-bold text-blue-600">
                  {answerStats.uniqueAnswers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("chart")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "chart"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📊 Chart View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setViewMode("stats")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "stats"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📈 Statistics
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="frequency">Sort by Frequency</option>
                <option value="alphabetical">Sort Alphabetically</option>
                <option value="length">Sort by Length</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === "chart" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Response Frequency Chart</h3>
            <div className="h-96">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {viewMode === "list" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold">
                All Responses ({filteredAnswers.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredAnswers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No answers match your search criteria.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredAnswers.map(([answer, count], idx) => (
                    <li
                      key={idx}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 break-words">{answer}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Length: {answer.length} characters
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {count} {count === 1 ? "response" : "responses"}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {viewMode === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Statistics Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-4">Response Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Responses:</span>
                  <span className="font-bold text-purple-600">
                    {answerStats.totalAnswers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unique Answers:</span>
                  <span className="font-bold text-blue-600">
                    {answerStats.uniqueAnswers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Length:</span>
                  <span className="font-bold text-green-600">
                    {answerStats.averageLength} chars
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-bold text-orange-600">
                    {answerStats.uniqueAnswers > 0
                      ? (
                          (answerStats.uniqueAnswers /
                            answerStats.totalAnswers) *
                          100
                        ).toFixed(1) + "%"
                      : "0%"}{" "}
                    unique
                  </span>
                </div>
              </div>
            </div>

            {/* Most Common Answer */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-4">Most Common Answer</h3>
              {answerStats.mostCommonAnswer ? (
                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <p className="text-gray-900 font-medium">
                      {answerStats.mostCommonAnswer}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Given {answerFrequencies[answerStats.mostCommonAnswer]}{" "}
                    times (
                    {(
                      (answerFrequencies[answerStats.mostCommonAnswer] /
                        answerStats.totalAnswers) *
                      100
                    ).toFixed(1)}
                    % of responses)
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No answers available</p>
              )}
            </div>

            {/* Answer Length Analysis */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-4">Length Analysis</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Longest Answer:</span>
                  <p className="text-sm bg-gray-50 p-2 rounded mt-1 break-words">
                    {answerStats.longestAnswer || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    Shortest Answer:
                  </span>
                  <p className="text-sm bg-gray-50 p-2 rounded mt-1 break-words">
                    {answerStats.shortestAnswer || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-4">Response Distribution</h3>
              <div className="h-64">
                <Pie
                  data={{
                    labels: filteredAnswers
                      .slice(0, 5)
                      .map(([answer]) =>
                        answer.length > 20
                          ? answer.substring(0, 20) + "..."
                          : answer
                      ),
                    datasets: [
                      {
                        data: filteredAnswers
                          .slice(0, 5)
                          .map(([, freq]) => freq),
                        backgroundColor: [
                          "#8B5CF6",
                          "#06B6D4",
                          "#10B981",
                          "#F59E0B",
                          "#EF4444",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                      title: { display: true, text: "Top 5 Responses" },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailPage;
