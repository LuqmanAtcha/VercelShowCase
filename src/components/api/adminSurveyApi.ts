import { API_BASE, defaultHeaders } from "./config";
import { Question, Answer } from "../../types";

export async function fetchAllQuestions(page = 1): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/api/v1/admin/survey?page=${page}`, {
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error("Failed to fetch questions");
  const { data } = await res.json();
  return data.map((q: any) => ({ ...q, id: q._id }));
}

export async function deleteQuestionById(questionID: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/`, {
    method: "DELETE",
    headers: defaultHeaders,
    body: JSON.stringify({ questionID }),
  });
  if (!res.ok) throw new Error("Failed to delete question");
}

export async function deleteQuestions(ids: string[]): Promise<void> {
  await Promise.all(ids.map(id => deleteQuestionById(id)));
}

export async function updateQuestionById(question: Question): Promise<Question> {
  const payload = {
    questionID: question._id,
    question: question.question,
    questionType: question.questionType,
    questionCategory: question.questionCategory,
    questionLevel: question.questionLevel,
  };

  const res = await fetch(`${API_BASE}/api/v1/admin/`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to update question");
  }

  const { data } = await res.json();
  return { ...data, id: data._id };
}

export async function postSurveyQuestions(questions: Question[]): Promise<void> {
  // Filter out questions that already have IDs (existing questions)
  const newQuestions = questions.filter(q => !q._id || q._id === "");
  
  if (newQuestions.length === 0) return;

  const payload = {
    questions: newQuestions.map((q) => ({
      question: q.question,
      questionType: q.questionType,
      questionCategory: q.questionCategory,
      questionLevel: q.questionLevel,
    })),
  };

  const res = await fetch(`${API_BASE}/api/v1/admin/surveyQuestions`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to post survey questions");
  }
}

export async function fetchAllQuestionsAndAnswers(): Promise<{
  questions: Question[];
  answers: Answer[];
}> {
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    headers: defaultHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch questions");
  }

  const response = await res.json();
  const questions: Question[] = response.data || [];

  // Extract answers from the questions
  let allAnswers: Answer[] = [];
  questions.forEach((q: any) => {
    if (q.answers && Array.isArray(q.answers)) {
      q.answers.forEach((ans: any) => {
        // Create Answer objects from the response count data
        for (let i = 0; i < ans.responseCount; i++) {
          allAnswers.push({
            _id: ans._id || `${q._id}-${i}`,
            questionId: q._id,
            answer: ans.answer,
            createdAt: q.createdAt,
          });
        }
      });
    }
  });

  return { questions, answers: allAnswers };
}

export async function fetchAnswersByQuestionId(
  questionId: string
): Promise<Answer[]> {
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    headers: defaultHeaders,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch answers for question ${questionId}`);
  }

  const response = await res.json();
  const questions = response.data || [];

  const question = questions.find((q: any) => q._id === questionId);

  if (!question || !question.answers) {
    return [];
  }

  let answers: Answer[] = [];
  question.answers.forEach((ans: any) => {
    for (let i = 0; i < ans.responseCount; i++) {
      answers.push({
        _id: `${ans._id || questionId}-${i}`,
        questionId: questionId,
        answer: ans.answer,
        createdAt: question.createdAt,
      });
    }
  });

  return answers;
}