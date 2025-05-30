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

  // Create new questions (POST)
  const createQuestions = useCallback(
    async (newQuestions: Question[]) => {
      setLoading(true);
      setError("");
      try {
        await api.postSurveyQuestions(newQuestions);
        await fetchQuestions(); // Refresh the list
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestions]
  );

  // Update existing questions (PUT)
  const updateQuestions = useCallback(
    async (questionsToUpdate: Question[]) => {
      setLoading(true);
      setError("");
      try {
        // Update existing questions one by one
        const existingQuestions = questionsToUpdate.filter(q => q._id && q._id !== "");
        for (const question of existingQuestions) {
          await api.updateQuestionById(question);
        }
        
        // Create new questions
        const newQuestions = questionsToUpdate.filter(q => !q._id || q._id === "");
        if (newQuestions.length > 0) {
          await api.postSurveyQuestions(newQuestions);
        }
        
        await fetchQuestions(); // Refresh the list
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestions]
  );

  // Delete specific questions
  const deleteQuestions = useCallback(
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
    createQuestions,
    updateQuestions,
    deleteQuestions,
    setError,
  };
}