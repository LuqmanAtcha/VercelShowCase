import { useState, useCallback } from "react";
import * as api from "../api/adminSurveyApi";
import { Question } from "../../types";
export function useAdminSurveyApi() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.fetchAllQuestions();
      setQuestions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const publishSurvey = useCallback(
    async (allQuestions: Question[]) => {
      setLoading(true);
      setError("");
      try {
        const ids = questions.map((q) => q._id).filter(Boolean) as string[];
        await api.deleteQuestions(ids);
        await api.clearAllAnswers();
        await api.postSurveyQuestions(allQuestions);
        await fetchQuestions();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestions, questions]
  );

  // ✅ ADD THIS FUNCTION
  const deleteAllQuestions = useCallback(
    async (toDelete: Question[]) => {
      setLoading(true);
      setError("");
      try {
        const ids = toDelete.map((q) => q._id).filter(Boolean) as string[];
        await api.deleteQuestions(ids);
        await fetchQuestions();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestions]
  );

  return {
    questions,
    isLoading,
    error,
    fetchQuestions,
    publishSurvey,
    deleteAllQuestions,
    setError,
  };
}
