import { create } from "zustand";
import questionsJson from "../data/questions.json";
import { Question } from "@/lib/type";

// Parse questions (assuming valid JSON)
const questions: Question[] = JSON.parse(JSON.stringify(questionsJson));

interface QuizStore {
  selectedSubject: string;
  selectedChapter: string;
  questions: Question[];
  topics: string[];
  chapters: string[];
  filteredQuestions: Question[];
  setSubject: (subject: string) => void;
  setChapter: (chapter: string) => void;
}

// Create the store
export const useQuizStore = create<QuizStore>((set, get) => {
  const topics = Array.from(new Set(questions.map((q) => q.subject)));
  const chapters = Array.from(new Set(questions.map((q) => q.chapter)));

  return {
    selectedSubject: topics[0] || "",
    selectedChapter: chapters[0] || "0",
    questions,
    topics,
    chapters,
    filteredQuestions: [],

    setSubject: (subject) => {
      set({ selectedSubject: subject });
      set({ filteredQuestions: get().questions.filter((q) => q.subject === subject && q.chapter === get().selectedChapter) });
    },

    setChapter: (chapter) => {
      set({ selectedChapter: chapter });
      set({ filteredQuestions: get().questions.filter((q) => q.subject === get().selectedSubject && q.chapter === chapter) });
    },
  };
});
