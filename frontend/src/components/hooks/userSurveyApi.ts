import { useState, useCallback } from "react";
import { Question } from "../../type";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";
const API_KEY = process.env.REACT_APP_API_KEY || "somya";

const defaultHeaders = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
};

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

export function useSurveyApi() {
  const [questionsByLevel, setQuestionsByLevel] = useState<Record<Level, Question[]>>({
    Beginner: [],
    Intermediate: [],
    Advanced: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/v1/questions?page=1`, { headers: defaultHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch questions");

      const formatted = (data.data || []).map((q: any) => ({
        ...q,
        id: q._id,
      }));

      const grouped: Record<Level, Question[]> = {
        Beginner: [],
        Intermediate: [],
        Advanced: [],
      };
      formatted.forEach((q: Question) => {
        if (LEVELS.includes(q.questionLevel as Level)) {
          grouped[q.questionLevel as Level].push(q);
        }
      });
      LEVELS.forEach((lvl) => {
        if (grouped[lvl].length === 0)
          grouped[lvl].push(emptyQuestion(lvl));
      });
      setQuestionsByLevel(grouped);
    } catch (err: any) {
      console.error("Error fetching questions:", err);
      setError(err.message || "Failed to fetch questions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAllQuestions = useCallback(async (questions: Question[]) => {
    await Promise.all(
      questions.map((q) =>
        q.id
          ? fetch(`${API}/api/v1/questions`, {
              method: "DELETE",
              headers: defaultHeaders,
              body: JSON.stringify({ questionID: q.id }),
            })
          : Promise.resolve()
      )
    );
    fetchQuestions();
  }, [fetchQuestions]);

  const publishSurvey = useCallback(async (allQuestions: Question[]) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/v1/questions?page=1`, { headers: defaultHeaders });
      const data = await res.json();
      const existingQuestions = data.data || [];

      await Promise.all(
        existingQuestions.map((q: any) =>
          fetch(`${API}/api/v1/questions`, {
            method: "DELETE",
            headers: defaultHeaders,
            body: JSON.stringify({ questionID: q._id }),
          })
        )
      );

      await fetch(`${API}/api/v1/answers`, {
        method: "DELETE",
        headers: defaultHeaders,
        body: JSON.stringify({ _id: "ALL" }),
      });

      await Promise.all(
        allQuestions.map((q) =>
          fetch(`${API}/api/v1/questions/surveyQuestions`, {
            method: "POST",
            headers: defaultHeaders,
            body: JSON.stringify({
              question: q.question,
              questionType: "Input",
              questionCategory: q.questionCategory,
              questionLevel: q.questionLevel,
            }),
          })
        )
      );

      await fetchQuestions();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to publish survey.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchQuestions]);

  const updateTabQuestions = (level: Level, updated: Question[]) => {
    setQuestionsByLevel((prev) => ({ ...prev, [level]: updated }));
  };

  return {
    questionsByLevel,
    isLoading,
    error,
    setError,
    fetchQuestions,
    deleteAllQuestions,
    publishSurvey,
    updateTabQuestions,
  };
}

function emptyQuestion(level: Level): Question {
  return {
    id: "",
    question: "",
    questionType: "Input",
    questionCategory: "",
    questionLevel: level,
  };
}
