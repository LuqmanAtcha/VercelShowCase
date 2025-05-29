import { API_BASE, defaultHeaders } from "./config";
import { Question, Answer } from "../../types";

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

export async function fetchAllQuestionsAndAnswers(): Promise<{
  questions: Question[];
  answers: Answer[];
}> {
  const res = await fetch(`${API_BASE}/api/v1/questions?page=1`, {
    headers: defaultHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch questions");
  }

  const qData = await res.json();
  const questions: Question[] = qData.data || qData.questions || [];

  let allAnswers: Answer[] = [];

  for (const q of questions) {
    try {
      const ansRes = await fetch(
        `${API_BASE}/api/v1/answers/answers/${q._id}`,
        {
          headers: defaultHeaders,
        }
      );

      if (ansRes.ok) {
        const ansData = await ansRes.json();
        if (Array.isArray(ansData.data)) {
          allAnswers.push(
            ...ansData.data.map((a: any) => ({
              _id: a._id,
              questionId: q._id,
              answer: a.answer,
              createdAt: a.createdAt,
            }))
          );
        }
      } else {
        console.warn(`Failed to fetch answers for question ${q._id}`);
      }
    } catch (err) {
      console.warn(`Error fetching answers for question ${q._id}:`, err);
    }
  }

  return { questions, answers: allAnswers };
}

export async function fetchAnswersByQuestionId(questionId: string): Promise<Answer[]> {
  const res = await fetch(`${API_BASE}/api/v1/answers/answers/${questionId}`, {
    headers: defaultHeaders,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch answers for question ${questionId}`);
  }

  const data = await res.json();

  if (Array.isArray(data.data)) {
    return data.data.map((a: any) => ({
      _id: a._id,
      questionId: questionId,
      answer: a.answer,
      createdAt: a.createdAt,
    }));
  }

  return [];
}
