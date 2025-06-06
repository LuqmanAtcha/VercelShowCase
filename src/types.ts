// src/types.ts
export interface Question {
  _id: string;
  question: string;
  questionType: string;
  questionCategory: string;
  questionLevel: string;
  timesSkipped?: number;
  timesAnswered: number;
  answers?: Array<{
    _id?: string;
    answer: string;
    responseCount: number;
    isCorrect: boolean;
  }>;
  timeStamp?: boolean;
}

export interface Answer {
  _id: string;
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
  _id: string;
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