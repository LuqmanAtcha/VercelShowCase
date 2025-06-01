import React, { useEffect, useState } from "react";
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
import { Question, Answer } from "../../types";
import { AnalyticsHeader } from "../analytics/AnalyticsHeader";
import { StatsOverview } from "../analytics/StatsOverview";
import { CategoryChart } from "../analytics/CategoryChart";
import { LevelChart } from "../analytics/LevelChart";
import { ChartContainer } from "../analytics/ChartContainer";
import { Leaderboard } from "../analytics/Leaderboard";
import { ResponsesTable } from "../analytics/ResponsesTable";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsPageProps {
  fetchAllQuestionsAndAnswers: () => Promise<{
    questions: Question[];
    answers: Answer[];
  }>;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  fetchAllQuestionsAndAnswers,
}) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [recentAnsweredIds, setRecentAnsweredIds] = useState<Set<string>>(
    new Set()
  );

  // Handle refresh button click
  const handleRefresh = async () => {
    setLoading(true);
    setErr(null);

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
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr(null);

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
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchAllQuestionsAndAnswers]);

  // Use the custom hook to process data
  const analyticsData = useAnalyticsData(questions);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Simplified Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">📊</span>
            </div>
            <h2 className="text-2xl font-bold">Survey Analytics Dashboard</h2>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
              onClick={handleRefresh}
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => navigate('/responses')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              📋 Responses
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-700 text-lg font-medium">
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6 space-y-6">
        {/* Simplified Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">📊</span>
            </div>
            <h2 className="text-2xl font-bold">Survey Analytics Dashboard</h2>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
              onClick={handleRefresh}
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => navigate('/responses')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              📋 Responses
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Error loading analytics</p>
            <p className="text-sm mt-1">{err}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Simplified Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">📊</span>
          </div>
          <h2 className="text-2xl font-bold">Survey Analytics Dashboard</h2>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
            onClick={handleRefresh}
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => navigate('/responses')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            📋 Responses
          </button>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
      </div>


      <StatsOverview
        totalResponses={analyticsData.totalResponses}
        totalAnswered={analyticsData.totalAnswered}
        totalSkipped={analyticsData.totalSkipped}
        overallSkipRate={analyticsData.overallSkipRate}
      />

      <ChartContainer>
        <CategoryChart data={analyticsData.categoryChartData} />
        <LevelChart data={analyticsData.levelChartData} />
      </ChartContainer>

      <Leaderboard items={analyticsData.leaderboard} />
    </div>
  );
};

export default AnalyticsPage;