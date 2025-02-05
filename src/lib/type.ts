// Define the type for each option in a question
export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

// Define the type for each question
export interface Question {
  id: number;
  subject: string;
  question: string;
  options: Option[];
  chapter: string;
  label?: string;
  explanation?: string;
  hint?: string;
  description?: string;
}

// Define the type for an array of questions
export type Questions = Question[];
