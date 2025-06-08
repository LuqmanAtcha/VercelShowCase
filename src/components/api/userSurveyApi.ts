import { API_BASE, defaultHeaders } from "./config";
import { Question } from "../../types";

interface QuestionsResponse {
  statusCode: number;
  data: RawQuestion[];
  message: string;
  success: boolean;
}

interface RawQuestion {
  questionID: string;
  question: string;
  questionType: string;
  questionCategory: string;
  questionLevel: string;
  timesAnswered?: number;
  timesSkipped?: number;
  answers?: Array<{
    answerID?: string;
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
      questionID: raw.questionID,
      question: raw.question,
      questionType: raw.questionType || "Input",
      questionCategory: raw.questionCategory,
      questionLevel: raw.questionLevel,
      timesAnswered: raw.timesAnswered || 0,
      timesSkipped: raw.timesSkipped,
      answers: raw.answers?.map(ans => ({
        answerID: ans.answerID,
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

export async function submitAllAnswers(
  answers: { questionID: string; answerText: string }[]
): Promise<void> {
  const questions = answers.map(a => ({ questionID: a.questionID }));
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

export async function submitAnswer(
  qId: string,
  answerText: string
): Promise<void> {
  await submitSingleAnswer(qId, answerText);
}