export interface Question {
  questionID: string;
  question: string;
  questionType: string;
  questionCategory: string;
  questionLevel: string;
  timesSkipped?: number;
  timesAnswered: number;
  answers?: Array<{
    answerID?: string;
    answer: string;
    responseCount?: number;
    isCorrect: boolean;
  }>;
  timeStamp?: boolean;
  createdAt?: string;
}

export interface Answer {
  answerID: string;
  questionId: string;
  answer: string;
  createdAt?: string;
}

export interface User {
  name: string;
  isAnonymous: boolean;
  role: "participant" | "admin" | "super_admin";
}

export interface Survey {
  surveyID: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}