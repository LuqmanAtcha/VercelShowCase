import React, { useEffect, useState } from "react";
import { fetchAnswersByQuestionId } from "../api/adminSurveyApi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useParams, useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Answer {
  _id: string;
  questionId: string;
  answer: string;
  createdAt?: string;
}

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Admin check first
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login", { replace: true });
      return;
    }

    const doFetch = async () => {
      setLoading(true);
      setErr(null);

      try {
        if (id) {
          const data = await fetchAnswersByQuestionId(id);
          setAnswers(data);
        }
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };

    doFetch();
  }, [id, navigate]);

  // Build a frequency map of answers
  const answerFrequencies: Record<string, number> = {};
  answers.forEach((a) => {
    answerFrequencies[a.answer] = (answerFrequencies[a.answer] || 0) + 1;
  });

  const sortedAnswers = Object.entries(answerFrequencies).sort(
    (a, b) => b[1] - a[1]
  );

  const chartData = {
    labels: sortedAnswers.map(([answer]) => answer),
    datasets: [
      {
        label: "Answer Frequency",
        data: sortedAnswers.map(([, freq]) => freq),
        backgroundColor: "#6b21a8",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Most Common Answers" },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Answer Frequencies</h2>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : err ? (
        <p className="text-red-600">Error: {err}</p>
      ) : answers.length === 0 ? (
        <p>No answers found for this question.</p>
      ) : (
        <div className="bg-white p-4 rounded shadow max-w-3xl mx-auto">
          <div className="h-96">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <ul className="mt-4 space-y-1 text-sm text-gray-700">
            {sortedAnswers.map(([text, count], idx) => (
              <li key={idx} className="flex justify-between border-b py-1">
                <span>{text}</span>
                <span className="text-purple-700 font-semibold">
                  {count} times
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuestionDetailPage;