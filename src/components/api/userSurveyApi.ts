import { API_BASE, defaultHeaders } from "./config";
import { Question } from "../../types";

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
  timesAnswered?: number;
  timesSkipped?: number;
  answers?: Array<{
    _id?: string;
    answer: string;
    responseCount?: number;
    isCorrect?: boolean;
  }>;
  timeStamp?: boolean;
}

export async function fetchAllQuestions(): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/api/v1/survey/`, {
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
      questionType: raw.questionType || "Input", // Default to Input if not specified
      questionCategory: raw.questionCategory,
      questionLevel: raw.questionLevel,
      timesAnswered: raw.timesAnswered || 0, // Add required property with default
      timesSkipped: raw.timesSkipped,
      answers: raw.answers?.map(ans => ({
        _id: ans._id,
        answer: ans.answer,
        responseCount: ans.responseCount || 0, // Default value
        isCorrect: ans.isCorrect || false // Default value
      })),
      timeStamp: raw.timeStamp
    })
  );
}

export async function fetchQuestionsByLevel(
  level: string
): Promise<Question[]> {
  const all = await fetchAllQuestions();
  return all.filter((q) => q.questionLevel === level);
}

// Fixed: Submit answers one by one to match backend format
export async function submitAllAnswers(
  answers: { questionID: string; answerText: string }[]
): Promise<void> {
  // Transform data to match backend format
  const questions = answers.map(a => ({ _id: a.questionID }));
  const answerTexts = answers.map(a => ({ answer: a.answerText }));
  
  const payload = {
    questions: questions,
    answers: answerTexts
  };

  const res = await fetch(`${API_BASE}/api/v1/survey/`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    // Handle non-JSON responses more safely
    const text = await res.text();
    let message;
    try {
      const json = JSON.parse(text);
      message = json.message || "Failed to submit answers";
    } catch (e) {
      // If response isn't valid JSON, use status text
      message = `Server error (${res.status} ${res.statusText})`;
    }
    throw new Error(message);
  }
}

// New function to match backend format exactly
export async function submitSingleAnswer(
  questionID: string,
  answer: string
): Promise<void> {
  const payload = {
    questionID: questionID,
    answer: answer
  };

  const res = await fetch(`${API_BASE}/api/v1/survey/`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to submit answer");
  }
}

// Legacy function for backward compatibility
export async function submitAnswer(
  qId: string,
  answerText: string
): Promise<void> {
  await submitSingleAnswer(qId, answerText);
}