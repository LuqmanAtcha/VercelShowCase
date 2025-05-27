// src/type.ts
export interface Question {
  id?: string;
  question: string;
  questionType: string;
  questionCategory: string; // <-- use backend field name
  questionLevel: string;    // <-- use backend field name

}


export interface User {
  name: string;
  isAnonymous: boolean;
  role: 'participant' | 'admin';
}

export interface Survey {
  id: string;
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
