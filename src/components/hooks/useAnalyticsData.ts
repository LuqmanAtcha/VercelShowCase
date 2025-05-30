// src/components/hooks/useAnalyticsData.ts
import { useMemo } from "react";
import { Question, Answer } from "../../types";

interface AnalyticsData {
  categoryCounts: Record<string, number>;
  levelCounts: Record<string, number>;
  answerCounts: Record<string, number>;
  skipCounts: Record<string, number>;
  totalAnswered: number;
  totalSkipped: number;
  totalResponses: number;
  overallSkipRate: string;
  leaderboard: Array<{ question: string; responses: number }>;
  categoryChartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  };
  levelChartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  };
}

export const useAnalyticsData = (
  questions: Question[], 
  answers: Answer[]
): AnalyticsData => {
  return useMemo(() => {
    const predefinedCategories = ["Grammar", "Vocabulary", "Culture"];
    const categoryCounts: Record<string, number> = {
      Grammar: 0,
      Vocabulary: 0,
      Culture: 0,
    };
    const levelCounts: Record<string, number> = {};
    const answerCounts: Record<string, number> = {};
    const skipCounts: Record<string, number> = {};

    // Initialize counts for all questions
    questions.forEach((q) => {
      if (!categoryCounts[q.questionCategory]) {
        categoryCounts[q.questionCategory] = 0;
      }
      categoryCounts[q.questionCategory]++;
      levelCounts[q.questionLevel] = (levelCounts[q.questionLevel] || 0) + 1;
      
      // Initialize counts for each question
      answerCounts[q._id] = 0;
      skipCounts[q._id] = 0;

      // Use the timesSkipped field directly from the question
      if (q.timesSkipped !== undefined) {
        skipCounts[q._id] = q.timesSkipped;
      }

      // Count actual answers from the question's embedded answers array
      if (q.answers && Array.isArray(q.answers)) {
        q.answers.forEach((answerData) => {
          // Only count non-empty answers as actual responses
          if (answerData.answer && answerData.answer.trim() !== '') {
            answerCounts[q._id] += answerData.responseCount;
          }
        });
      }
    });

    // Calculate totals
    const totalAnswered = Object.values(answerCounts).reduce((sum, cnt) => sum + cnt, 0);
    const totalSkipped = Object.values(skipCounts).reduce((sum, cnt) => sum + cnt, 0);
    const totalResponses = totalAnswered + totalSkipped;
    const overallSkipRate = totalResponses > 0 ? ((totalSkipped / totalResponses) * 100).toFixed(1) : "0.0";

    // Create leaderboard based on actual answers (not including skips)
    const leaderboard = questions
      .map((q) => ({
        question: q.question,
        responses: answerCounts[q._id] || 0,
      }))
      .sort((a, b) => b.responses - a.responses)
      .slice(0, 5);

    // Chart data
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

    return {
      categoryCounts,
      levelCounts,
      answerCounts,
      skipCounts,
      totalAnswered,
      totalSkipped,
      totalResponses,
      overallSkipRate,
      leaderboard,
      categoryChartData,
      levelChartData,
    };
  }, [questions, answers]);
};