import { useState, useEffect } from "react";
import * as api from "../api/userSurveyApi";
import { Question } from "../../types";

export function useUserSurveyApi(level: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const qs = await api.fetchQuestionsByLevel(level);
        setQuestions(qs);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [level]);

  const submitAllAnswers = async (
    answers: { questionID: string; answerText: string }[]
  ) => {
    for (const { questionID, answerText } of answers) {
      await api.submitAnswer(questionID, answerText);
    }
  };

  return { questions, loading, error, setError, submitAllAnswers };
}
