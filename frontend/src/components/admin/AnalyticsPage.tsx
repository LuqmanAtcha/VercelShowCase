import React, { useEffect, useState } from "react";
import { Question, Answer } from "../../types";
const API = process.env.REACT_APP_API_URL || "http://localhost:8000";
const API_KEY = "onn32q43QijfewnS20in2siu!$d24324ckxf";

const AnalyticsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr(null);
      try {
        // 1. Fetch all questions
        const qRes = await fetch(`${API}/api/v1/questions?page=1`, {
          headers: { "x-api-key": API_KEY },
        });
        const qData = await qRes.json();
        if (!qRes.ok)
          throw new Error(qData?.error || "Failed to fetch questions");
        const questionList = qData.data || qData.questions || [];
        setQuestions(questionList);

        // 2. For each question, fetch all answers
        let allAnswers: Answer[] = [];
        for (const q of questionList) {
          const ansRes = await fetch(`${API}/api/v1/answers/answers/${q._id}`, {
            headers: { "x-api-key": API_KEY },
          });
          const ansData = await ansRes.json();
          if (ansRes.ok && Array.isArray(ansData.data)) {
            allAnswers.push(
              ...ansData.data.map((a: any) => ({
                _id: a._id,
                questionId: q._id,
                answer: a.answer,
              }))
            );
          }
        }
        setAnswers(allAnswers);
      } catch (e: any) {
        setErr(e.message || "Error loading data");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Helpers
  const getQuestionText = (questionId: string) =>
    questions.find((q) => q._id === questionId)?.question ||
    "Question not found";

  const getAnswerCountForQuestion = (questionId: string) =>
    answers.filter((a) => a.questionId === questionId).length;

  // --- Analysis Calculations ---
  const totalAnswers = answers.length;
  const totalSkipped = answers.filter((a) => a.answer.trim() === "").length;

  const getSkippedCountForQuestion = (questionId: string) =>
    answers.filter((a) => a.questionId === questionId && a.answer.trim() === "")
      .length;

  const getNonSkippedCountForQuestion = (questionId: string) =>
    answers.filter((a) => a.questionId === questionId && a.answer.trim() !== "")
      .length;

  const categoryCounts = questions.reduce((acc: Record<string, number>, q) => {
    acc[q.questionCategory] =
      (acc[q.questionCategory] || 0) + getAnswerCountForQuestion(q._id);
    return acc;
  }, {});

  const levelCounts = questions.reduce((acc: Record<string, number>, q) => {
    acc[q.questionLevel] =
      (acc[q.questionLevel] || 0) + getAnswerCountForQuestion(q._id);
    return acc;
  }, {});

  const mostAnswered = questions.reduce<{ id?: string; count: number }>(
    (acc, q) => {
      const count = getNonSkippedCountForQuestion(q._id);
      return count > acc.count ? { id: q._id, count } : acc;
    },
    { id: undefined, count: 0 }
  );

  const mostSkipped = questions.reduce<{ id?: string; count: number }>(
    (acc, q) => {
      const count = getSkippedCountForQuestion(q._id);
      return count > acc.count ? { id: q._id, count } : acc;
    },
    { id: undefined, count: 0 }
  );

  const getSkipRate = (questionId: string) => {
    const total = getAnswerCountForQuestion(questionId);
    const skipped = getSkippedCountForQuestion(questionId);
    return total > 0 ? ((skipped / total) * 100).toFixed(1) : "0.0";
  };

  const overallSkipRate =
    totalAnswers > 0 ? ((totalSkipped / totalAnswers) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-2 text-purple-700">
        Survey Analytics (Compact View)
      </h1>
      {loading && <div>Loading...</div>}
      {err && <div className="text-red-600 mb-2">{err}</div>}

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="bg-white p-2 rounded shadow">
          Total Answers: <b>{totalAnswers}</b>
        </div>
        <div className="bg-white p-2 rounded shadow">
          Total Skipped: <b>{totalSkipped}</b>
        </div>
        <div className="bg-white p-2 rounded shadow">
          Overall Skip Rate: <b>{overallSkipRate}%</b>
        </div>
        <div className="bg-white p-2 rounded shadow">
          Most Answered: <b>{getQuestionText(mostAnswered.id || "")}</b> (
          {mostAnswered.count})
        </div>
        <div className="bg-white p-2 rounded shadow">
          Most Skipped: <b>{getQuestionText(mostSkipped.id || "")}</b> (
          {mostSkipped.count})
        </div>
      </div>

      {/* Category Analysis */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {Object.entries(categoryCounts).map(([cat, cnt]) => (
          <div key={cat} className="bg-white p-2 rounded shadow">
            Category <b>{cat}</b>: {cnt} responses
          </div>
        ))}
      </div>
      {/* Level Analysis */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {Object.entries(levelCounts).map(([lvl, cnt]) => (
          <div key={lvl} className="bg-white p-2 rounded shadow">
            Level <b>{lvl}</b>: {cnt} responses
          </div>
        ))}
      </div>

      {/* Compact Questions Table */}
      <div className="mb-6 overflow-x-auto">
        <h2 className="text-base font-semibold mb-1">Questions & Responses</h2>
        <table className="text-xs w-full min-w-[600px] bg-white rounded shadow">
          <thead>
            <tr className="bg-purple-100">
              <th className="px-2 py-1">#</th>
              <th className="px-2 py-1">Question</th>
              <th className="px-2 py-1">Category</th>
              <th className="px-2 py-1">Level</th>
              <th className="px-2 py-1">Responses</th>
              <th className="px-2 py-1">Answered</th>
              <th className="px-2 py-1">Skipped</th>
              <th className="px-2 py-1">Skip %</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => (
              <tr key={q._id} className="border-t">
                <td className="px-2 py-1">{i + 1}</td>
                <td className="px-2 py-1 max-w-[180px] truncate">
                  {q.question}
                </td>
                <td className="px-2 py-1">{q.questionCategory}</td>
                <td className="px-2 py-1">{q.questionLevel}</td>
                <td className="px-2 py-1">
                  {getAnswerCountForQuestion(q._id)}
                </td>
                <td className="px-2 py-1">
                  {getNonSkippedCountForQuestion(q._id)}
                </td>
                <td className="px-2 py-1">
                  {getSkippedCountForQuestion(q._id)}
                </td>
                <td className="px-2 py-1">{getSkipRate(q._id)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compact Answers Table */}
      <div className="overflow-x-auto">
        <h2 className="text-base font-semibold mb-1">Answers</h2>
        <table className="text-xs w-full min-w-[500px] bg-white rounded shadow">
          <thead>
            <tr className="bg-purple-100">
              <th className="px-2 py-1">#</th>
              <th className="px-2 py-1">Q. ID</th>
              <th className="px-2 py-1">Q. Text</th>
              <th className="px-2 py-1">Answer</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((a, i) => (
              <tr key={a._id} className="border-t">
                <td className="px-2 py-1">{i + 1}</td>
                <td className="px-2 py-1">{a.questionId}</td>
                <td className="px-2 py-1 max-w-[180px] truncate">
                  {getQuestionText(a.questionId)}
                </td>
                <td className="px-2 py-1">
                  {a.answer.trim() === "" ? (
                    <span className="italic text-gray-400">Skipped</span>
                  ) : (
                    a.answer
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsPage;
