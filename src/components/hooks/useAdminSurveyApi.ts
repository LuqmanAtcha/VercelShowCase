import { useState, useCallback, useRef } from "react";
import * as api from "../api/adminSurveyApi";
import { Question } from "../../types";

// Cache duration: 30 seconds (adjust as needed)
const CACHE_DURATION = 30 * 1000;

export function useAdminSurveyApi() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Add cache to avoid unnecessary refetches
  const cache = useRef<{
    questions: Question[] | null;
    timestamp: number;
  }>({
    questions: null,
    timestamp: 0
  });

  const fetchQuestions = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check if we have fresh cached data
    if (!forceRefresh && 
        cache.current.questions && 
        (now - cache.current.timestamp) < CACHE_DURATION) {
      setQuestions(cache.current.questions);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const data = await api.fetchAllQuestions();
      setQuestions(data);
      
      // Update cache
      cache.current = {
        questions: data,
        timestamp: now
      };
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
        // Clear cache to force fresh fetch
        cache.current.questions = null;
        await fetchQuestions(true);
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
        // Batch operations for better performance
        const existingQuestions = questionsToUpdate.filter(q => q._id && q._id !== "");
        const newQuestions = questionsToUpdate.filter(q => !q._id || q._id === "");
        
        // Run operations in parallel when possible
        const updatePromises = existingQuestions.map(q => api.updateQuestionById(q));
        await Promise.all(updatePromises);
        
        // Create new questions
        if (newQuestions.length > 0) {
          await api.postSurveyQuestions(newQuestions);
        }
        
        // Clear cache to force fresh fetch
        cache.current.questions = null;
        await fetchQuestions(true);
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
        
        // Delete in parallel for better performance
        const deletePromises = ids.map(id => api.deleteQuestionById(id));
        await Promise.all(deletePromises);
        
        // Clear cache to force fresh fetch
        cache.current.questions = null;
        await fetchQuestions(true);
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