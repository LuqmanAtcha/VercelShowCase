import { API_BASE, defaultHeaders } from "./config";
import { Question, Answer } from "../../types";

export async function fetchAllQuestionsAdmin(): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error("Failed to fetch questions for Admin Page");
  const { data } = await res.json();
  
  return data.map((q: any) => ({
    questionID: q._id, // Backend uses _id, map to questionID for frontend
    question: q.question,
    questionType: q.questionType,
    questionCategory: q.questionCategory,
    questionLevel: q.questionLevel,
    timesAnswered: q.timesAnswered || 0,
    timesSkipped: q.timesSkipped,
    answers: q.answers ? q.answers.map((a: any) => ({
      answerID: a._id, // Backend uses _id, map to answerID for frontend
      answer: a.answer,
      isCorrect: a.isCorrect,
      responseCount: a.responseCount,
      rank: a.rank,
      score: a.score
    })) : [],
    timeStamp: q.timeStamp
  }));
}

export async function deleteQuestionByIdAdmin(
  questionID: string
 ): Promise<void> {
  const payload = {
    questions: [{ questionID }]
  };
  
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    method: "DELETE",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("Failed to delete question");
  }
 }
 
 export async function deleteAllQuestionsAdmin(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  
  const payload = {
    questions: ids.map(questionID => ({ questionID }))
  };
  
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    method: "DELETE",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("Failed to delete questions");
  }
 }

export async function updateSurveyQuestionsBatch(
  questions: Question[]
): Promise<void> {
  // Use the exact format that works in Postman
  const payload = {
    questions: questions.map((q) => {
      const questionData = {
        questionID: q.questionID, // This should be included!
        question: q.question,
        questionType: q.questionType,
        questionCategory: q.questionCategory,
        questionLevel: q.questionLevel,
        answers: [] as any[],
      };

      if (q.questionType === "Mcq" && q.answers && q.answers.length > 0) {
        questionData.answers = q.answers.map((a) => ({
          answer: a.answer,
          isCorrect: a.isCorrect,
          answerID: a.answerID, // This should be included!
        }));
      }

      return questionData;
    }),
  };

  console.log("🚀 PUT payload:", JSON.stringify(payload, null, 2));
  console.log("🔍 Input questions received:", questions.map(q => ({ 
    questionID: q.questionID, 
    question: q.question.substring(0, 20) + '...', 
    hasAnswers: q.answers?.length || 0 
  })));
  
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("🚨 PUT request failed:", res.status, errorText);
    throw new Error(`Bulk update failed (${res.status}): ${errorText}`);
  }
}

export async function postSurveyQuestions(
  questions: Question[]
): Promise<void> {
  const newQuestions = questions.filter((q) => !q.questionID);

  if (newQuestions.length === 0) return;

  const payload = {
    questions: newQuestions.map((q) => {
      const questionData: any = {
        question: q.question,
        questionType: q.questionType,
        questionCategory: q.questionCategory,
        questionLevel: q.questionLevel,
        answers: [],
      };

      if (q.questionType === "Mcq" && q.answers && q.answers.length > 0) {
        questionData.answers = q.answers.map((a) => ({
          answer: a.answer,
          isCorrect: a.isCorrect || false,
        }));
      }

      return questionData;
    }),
  };

  console.log("📝 POST payload:", JSON.stringify(payload, null, 2));
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("🚨 POST request failed:", res.status, errorText);
    throw new Error(`Failed to post survey questions (${res.status}): ${errorText}`);
  }
}

export async function fetchAllQuestionsAndAnswersAdmin(): Promise<{
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

  const transformedQuestions = questions.map((q) => ({
    questionID: q.questionID, // Backend uses _id, map to questionID
    question: q.question,
    questionType: q.questionType,
    questionCategory: q.questionCategory,
    questionLevel: q.questionLevel,
    timesAnswered: q.timesAnswered || 0,
    timesSkipped: q.timesSkipped,
    answers: q.answers ? q.answers.map((ans: any) => ({
      answerID: ans._id, // Backend uses _id, map to answerID
      answer: ans.answer || "",
      responseCount: ans.responseCount || 0,
      isCorrect: ans.isCorrect || false
    })) : [],
    timeStamp: q.timeStamp,
    createdAt: q.createdAt
  }));

  let allAnswers: Answer[] = [];

  transformedQuestions.forEach((q: any) => {
    if (q.answers && Array.isArray(q.answers)) {
      q.answers.forEach((ans: any) => {
        for (let i = 0; i < (ans.responseCount || 1); i++) {
          allAnswers.push({
            answerID: ans.answerID,
            questionId: q.questionID,
            answer: ans.answer || "",
            createdAt: q.createdAt,
          });
        }
      });
    }
  });

  return { questions: transformedQuestions, answers: allAnswers };
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
    const responseCount = ans.responseCount || 1;
    for (let i = 0; i < responseCount; i++) {
      answers.push({
        answerID: ans._id,
        questionId: questionId,
        answer: ans.answer || "",
        createdAt: question.createdAt,
      });
    }
  });

  return answers;
}