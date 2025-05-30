import React, { useEffect, useState } from "react";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useNavigate } from "react-router-dom";
import { Question, Answer } from "../../types";

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
  fetchAllQuestionsAndAnswers: () => Promise<{ questions: Question[]; answers: Answer[] }>;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ fetchAllQuestionsAndAnswers }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [recentAnsweredIds, setRecentAnsweredIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { questions, answers } = await fetchAllQuestionsAndAnswers();
      setQuestions(questions);
      setAnswers(answers);

      const sorted = [...answers].sort((a, b) => {
        const t1 = new Date(a.createdAt || '').getTime();
        const t2 = new Date(b.createdAt || '').getTime();
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

  useEffect(() => {
    fetchData();
  }, []);

  const predefinedCategories = ["Grammar", "Vocabulary", "Culture"];
  const categoryCounts: Record<string, number> = {
    Grammar: 0,
    Vocabulary: 0,
    Culture: 0,
  };
  const levelCounts: Record<string, number> = {};
  const answerCounts: Record<string, number> = {};
  const skipCounts: Record<string, number> = {};

  questions.forEach((q) => {
    if (!categoryCounts[q.questionCategory]) {
      categoryCounts[q.questionCategory] = 0;
    }
    categoryCounts[q.questionCategory]++;
    levelCounts[q.questionLevel] = (levelCounts[q.questionLevel] || 0) + 1;
    answerCounts[q._id] = 0;
    skipCounts[q._id] = 0;
  });

  answers.forEach((a) => {
    const isSkip = a.answer.toLowerCase() === "skip" || a.answer.toLowerCase() === "skipped";
    if (a.questionId && answerCounts[a.questionId] !== undefined) {
      if (isSkip) {
        skipCounts[a.questionId]++;
      } else {
        answerCounts[a.questionId]++;
      }
    }
  });

  const totalAnswered = Object.values(answerCounts).reduce((sum, cnt) => sum + cnt, 0);
  const totalSkipped = Object.values(skipCounts).reduce((sum, cnt) => sum + cnt, 0);
  const totalResponses = totalAnswered + totalSkipped;
  const overallSkipRate =
    totalResponses > 0 ? ((totalSkipped / totalResponses) * 100).toFixed(1) : "0.0";

  const leaderboard = questions
    .map((q) => ({
      question: q.question,
      responses: answerCounts[q._id] || 0,
    }))
    .sort((a, b) => b.responses - a.responses)
    .slice(0, 5);

  const categoryChartData = {
    labels: predefinedCategories,
    datasets: [
      {
        label: "Questions per Category",
        data: predefinedCategories.map((cat) => categoryCounts[cat] || 0),
        backgroundColor: ["#6a5acd", "#ec4899", "#10b981"],
      },
    ],
  };

  const levelChartData = {
    labels: Object.keys(levelCounts),
    datasets: [
      {
        label: "Questions per Level",
        data: Object.values(levelCounts),
        backgroundColor: ["#ec4899", "#3b82f6", "#8b5cf6", "#22c55e"],
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Survey Analytics Dashboard</h2>
        <div className="flex gap-2">
          <button
            className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
            onClick={() => fetchData()}
          >
            🔄 Refresh Analytics
          </button>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm">Total Responses</p>
          <p className="text-xl font-bold">{totalResponses}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm">Total Answered</p>
          <p className="text-xl font-bold">{totalAnswered}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm">Total Skipped</p>
          <p className="text-xl font-bold">{totalSkipped}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm">Overall Skip Rate</p>
          <p className="text-xl font-bold">{overallSkipRate}%</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
        <div className="bg-white p-4 rounded shadow w-full max-w-[500px]">
          <Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
        </div>
        <div className="bg-white p-4 rounded shadow w-full max-w-[400px]">
          <Pie data={levelChartData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Leaderboard - Top 5 Answered Questions</h3>
        <ul className="space-y-2">
          {leaderboard.map((item, idx) => (
            <li key={idx} className="flex justify-between border-b pb-1">
              <span>{item.question}</span>
              <span className="font-semibold text-purple-700">{item.responses} answers</span>
            </li>
          ))}
        </ul>
      </div>

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
                  className={`even:bg-purple-50 ${recentAnsweredIds.has(q._id) ? 'bg-yellow-100 font-semibold' : ''}`}
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
    </div>
  );
};

export default AnalyticsPage;
