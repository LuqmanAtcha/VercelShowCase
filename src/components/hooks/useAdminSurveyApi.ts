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
      const data = await api.fetchAllQuestionsAdmin();
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
       
        await api.updateSurveyQuestionsBatch(questionsToUpdate);
        
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
        const ids = toDelete.map((q) => q.questionID).filter(Boolean) as string[]; // Changed from _id to questionID
        
        // Delete in parallel for better performance
        const deletePromises = ids.map(id => api.deleteQuestionByIdAdmin(id));
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