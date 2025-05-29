// src/types.ts
export interface Question {
  _id: string; // Changed from 'id' to '_id'
  question: string;
  questionType: string;
  questionCategory: string;
  questionLevel: string;
}

export interface Answer {
  _id: string; // Changed from 'id' to '_id'
  questionId: string;
  answer: string;
}

export interface User {
  name: string;
  isAnonymous: boolean;
  role: "participant" | "admin";
}

export interface Survey {
  _id: string; // Changed from 'id' to '_id'  
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}