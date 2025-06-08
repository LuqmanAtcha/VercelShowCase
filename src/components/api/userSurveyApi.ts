import { API_BASE, defaultHeaders } from "./config";
import { Question } from "../../types";

interface QuestionsResponse {
  statusCode: number;
  data: RawQuestion[];
  message: string;
  success: boolean;
}

interface RawQuestion {
  _id: string; // Backend uses _id, not questionID
  question: string;
  questionType: string;
  questionCategory: string;
  questionLevel: string;
  timesAnswered?: number;
  timesSkipped?: number;
  answers?: Array<{
    _id?: string; // Backend uses _id for answers too
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

  // FIX: Map _id to questionID correctly
  return body.data.map(
    (raw): Question => ({
      questionID: raw._id, // Map _id to questionID
      question: raw.question,
      questionType: raw.questionType || "Input",
      questionCategory: raw.questionCategory,
      questionLevel: raw.questionLevel,
      timesAnswered: raw.timesAnswered || 0,
      timesSkipped: raw.timesSkipped,
      answers: raw.answers?.map(ans => ({
        answerID: ans._id, // Map _id to answerID
        answer: ans.answer,
        responseCount: ans.responseCount || 0,
        isCorrect: ans.isCorrect || false
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

// FIX: Update to use the correct submission format
export async function submitAllAnswers(
  answers: { questionID: string; answerText: string }[]
): Promise<void> {
  // Transform to the correct format expected by the backend
  const payload = {
    questions: answers.map(a => ({ _id: a.questionID })), // Use _id instead of questionID
    answers: answers.map(a => ({ answer: a.answerText }))
  };

  console.log("Submitting payload:", JSON.stringify(payload, null, 2));

  const res = await fetch(`${API_BASE}/api/v1/survey/`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const text = await res.text();
    let message;
    try {
      const json = JSON.parse(text);
      message = json.message || "Failed to submit answers";
    } catch (e) {
      message = `Server error (${res.status} ${res.statusText})`;
    }
    throw new Error(message);
  }
}

// FIX: Update single answer submission format
export async function submitSingleAnswer(
  questionID: string,
  answer: string
): Promise<void> {
  const payload = {
    questions: [{ _id: questionID }], // Use _id format
    answers: [{ answer: answer }]
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

export async function submitAnswer(
  qId: string,
  answerText: string
): Promise<void> {
  await submitSingleAnswer(qId, answerText);
}