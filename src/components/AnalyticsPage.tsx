import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

interface Question {
  _id: string;
  question: string;
  questionCategory: string;
  questionLevel: string;
}
interface Answer {
  _id: string;
  questionId: string;
  answer: string;
}

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
        const qRes = await fetch(`${API}/api/v1/questions?page=1`);
        const qData = await qRes.json();
        if (!qRes.ok)
          throw new Error(qData?.error || "Failed to fetch questions");
        setQuestions(qData.questions || []);

        const aRes = await fetch(`${API}/api/v1/answers?page=1`);
        const aData = await aRes.json();
        if (!aRes.ok)
          throw new Error(aData?.error || "Failed to fetch answers");
        setAnswers(aData.answers || []);
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
  // (1) Total answers
  const totalAnswers = answers.length;

  // (2) Total skipped answers
  const totalSkipped = answers.filter((a) => a.answer.trim() === "").length;

  // (3) Skipped answers per question
  const getSkippedCountForQuestion = (questionId: string) =>
    answers.filter((a) => a.questionId === questionId && a.answer.trim() === "")
      .length;

  // (4) Answered (non-skipped) count per question
  const getNonSkippedCountForQuestion = (questionId: string) =>
    answers.filter((a) => a.questionId === questionId && a.answer.trim() !== "")
      .length;

  // (5) Category analysis
  const categoryCounts = questions.reduce((acc: Record<string, number>, q) => {
    acc[q.questionCategory] =
      (acc[q.questionCategory] || 0) + getAnswerCountForQuestion(q._id);
    return acc;
  }, {});

  // (6) Level analysis
  const levelCounts = questions.reduce((acc: Record<string, number>, q) => {
    acc[q.questionLevel] =
      (acc[q.questionLevel] || 0) + getAnswerCountForQuestion(q._id);
    return acc;
  }, {});

  // (7) Most answered question
  const mostAnswered = questions.reduce<{ id?: string; count: number }>(
    (acc, q) => {
      const count = getNonSkippedCountForQuestion(q._id);
      return count > acc.count ? { id: q._id, count } : acc;
    },
    { id: undefined, count: 0 }
  );

  // (8) Most skipped question
  const mostSkipped = questions.reduce<{ id?: string; count: number }>(
    (acc, q) => {
      const count = getSkippedCountForQuestion(q._id);
      return count > acc.count ? { id: q._id, count } : acc;
    },
    { id: undefined, count: 0 }
  );

  // (9) Skip rate per question
  const getSkipRate = (questionId: string) => {
    const total = getAnswerCountForQuestion(questionId);
    const skipped = getSkippedCountForQuestion(questionId);
    return total > 0 ? ((skipped / total) * 100).toFixed(1) : "0.0";
  };

  // (10) Overall skip rate
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
