import { API_BASE, defaultHeaders } from "./config";
import { Question, Answer } from "../../types";

export async function fetchAllQuestionsAdmin(): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error("Failed to fetch questions for Admin Page");
  const { data } = await res.json();
  return data.map((q: any) => ({
    ...q,
    // Ensure backward compatibility by mapping _id to questionID if needed
    questionID: q.questionID || q._id,
  }));
}

export async function deleteQuestionByIdAdmin(
  questionID: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    method: "DELETE",
    headers: defaultHeaders,
    body: JSON.stringify({ questionID }),
  });
  if (!res.ok) throw new Error("Failed to delete question");
}

export async function deleteAllQuestionsAdmin(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteQuestionByIdAdmin(id)));
}

export async function updateSurveyQuestionsBatch(
  questions: Question[]
): Promise<void> {
  const payload = {
    questions: questions.map((q) => ({
      questionID: q.questionID,
      question: q.question,
      questionType: q.questionType,
      questionCategory: q.questionCategory,
      questionLevel: q.questionLevel,
      answers:
        q.questionType === "Mcq" && q.answers?.length
          ? q.answers.map((a) => ({
              answer: a.answer,
              isCorrect: a.isCorrect,
              answerID: a.answerID!,
            }))
          : [],
    })),
  };

  console.log("Bulk PUT payload:", JSON.stringify(payload, null, 2));
  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    method: "PUT",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Bulk update failed (${res.status})`);
  }
}

export async function postSurveyQuestions(
  questions: Question[]
): Promise<void> {
  // Filter out questions that already have IDs (existing questions)
  const newQuestions = questions.filter((q) => !q.questionID);

  if (newQuestions.length === 0) return;

  const payload = {
    questions: newQuestions.map((q) => {
      const questionData: any = {
        question: q.question,
        questionType: q.questionType,
        questionCategory: q.questionCategory,
        questionLevel: q.questionLevel,
      };

      // Add answers array for MCQ questions
      if (q.questionType === "Mcq" && q.answers && q.answers.length > 0) {
        questionData.answers = q.answers.map((a) => ({
          answer: a.answer,
          isCorrect: a.isCorrect || false,
        }));
      }

      return questionData;
    }),
  };

  const res = await fetch(`${API_BASE}/api/v1/admin/survey`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to post survey questions");
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

  // Transform the data to ensure skip counting works properly
  const transformedQuestions = questions.map((q) => {
    // Ensure questionID is available
    const questionID = q.questionID || (q as any)._id;

    if (q.answers && Array.isArray(q.answers)) {
      // Ensure each answer entry has proper structure for skip detection
      const processedAnswers = q.answers.map((ans) => ({
        ...ans,
        // Ensure answerID is available
        answerID: ans.answerID || (ans as any)._id,
        // Normalize empty answers to be consistent
        answer: ans.answer || "",
        responseCount: ans.responseCount || 0,
      }));

      return {
        ...q,
        questionID,
        answers: processedAnswers,
      };
    }
    return { ...q, questionID };
  });

  // Create a flat answers array for backward compatibility
  let allAnswers: Answer[] = [];

  transformedQuestions.forEach((q: any) => {
    if (q.answers && Array.isArray(q.answers)) {
      q.answers.forEach((ans: any) => {
        // Create individual answer records based on responseCount
        for (let i = 0; i < (ans.responseCount || 1); i++) {
          allAnswers.push({
            answerID: ans.answerID || `${q.questionID}-${ans.answer}-${i}`,
            questionId: q.questionID,
            answer: ans.answer || "", // Ensure empty answers are properly handled
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

  const question = questions.find(
    (q: any) => q.questionID === questionId || (q as any)._id === questionId
  );

  if (!question || !question.answers) {
    return [];
  }

  let answers: Answer[] = [];
  question.answers.forEach((ans: any) => {
    const responseCount = ans.responseCount || 1;
    for (let i = 0; i < responseCount; i++) {
      answers.push({
        answerID: ans.answerID || `${questionId}-${i}`,
        questionId: questionId,
        answer: ans.answer || "", // Handle empty answers properly
        createdAt: question.createdAt,
      });
    }
  });

  return answers;
}