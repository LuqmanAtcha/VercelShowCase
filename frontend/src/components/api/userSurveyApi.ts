import { API_BASE, defaultHeaders } from "./config";
import { Question } from "../../types";

// exactly what your backend sends
interface QuestionsResponse {
  statusCode: number;
  data: RawQuestion[];
  message: string;
  success: boolean;
}

interface RawQuestion {
  _id: string;
  question: string;
  questionType: string;
  questionCategory: string;
  questionLevel: string;
}

export async function fetchAllQuestions(): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/api/v1/questions?page=1`, {
    headers: defaultHeaders,
  });
  if (!res.ok) {
    throw new Error(`Network error: ${res.status}`);
  }

  const body = (await res.json()) as QuestionsResponse;

  if (!body.success) {
    throw new Error(`Server error: ${body.message}`);
  }

  return body.data.map(
    (raw): Question => ({
      _id: raw._id,
      question: raw.question,
      questionType: raw.questionType,
      questionCategory: raw.questionCategory,
      questionLevel: raw.questionLevel,
    })
  );
}

/**
 * Fetches all questions, then returns only those whose
 * questionLevel matches the requested level.
 */
export async function fetchQuestionsByLevel(
  level: string
): Promise<Question[]> {
  const all = await fetchAllQuestions();
  return all.filter((q) => q.questionLevel === level);
}

export async function submitAnswer(
  qId: string,
  answerText: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/answers/answer`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify({ questionID: qId, answerText }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to submit answer");
  }
}
