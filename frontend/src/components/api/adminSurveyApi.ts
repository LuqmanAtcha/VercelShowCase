import { API_BASE, defaultHeaders } from "./config";
import { Question } from "../../types";

export async function fetchAllQuestions(page = 1): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/api/v1/questions?page=${page}`, {
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error("Failed to fetch questions");
  const { data } = await res.json();
  return data.map((q: any) => ({ ...q, id: q._id }));
}

export async function deleteQuestions(ids: string[]) {
  await Promise.all(
    ids.map((id) =>
      fetch(`${API_BASE}/api/v1/questions`, {
        method: "DELETE",
        headers: defaultHeaders,
        body: JSON.stringify({ questionID: id }),
      })
    )
  );
}

export async function clearAllAnswers() {
  await fetch(`${API_BASE}/api/v1/answers`, {
    method: "DELETE",
    headers: defaultHeaders,
    body: JSON.stringify({ _id: "ALL" }),
  });
}

export async function postSurveyQuestions(questions: Question[]) {
  await Promise.all(
    questions.map((q) =>
      fetch(`${API_BASE}/api/v1/questions/surveyQuestions`, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify({
          question: q.question,
          questionType: q.questionType,
          questionCategory: q.questionCategory,
          questionLevel: q.questionLevel,
        }),
      })
    )
  );
}
