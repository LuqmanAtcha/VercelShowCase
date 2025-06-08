// src/types.ts
export interface Question {
  questionID: string; // Changed from _id
  question: string;
  questionType: string;
  questionCategory: string;
  questionLevel: string;
  timesSkipped?: number;
  timesAnswered: number;
  answers?: Array<{
    answerID?: string; // Changed from _id
    answer: string;
    responseCount?: number; // Optional for compatibility
    isCorrect: boolean;
  }>;
  timeStamp?: boolean;
}

export interface Answer {
  answerID: string; // Changed from _id
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
  _id: string; // Changed from _id
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
