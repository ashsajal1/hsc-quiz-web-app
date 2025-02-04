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
  getChaptersBySubject: (subject: string) => string[];
}

// Create the store
export const useQuizStore = create<QuizStore>((set, get) => {
  const topics = Array.from(new Set(questions.map((q) => q.subject)));

  const getChaptersBySubject = (subject: string): string[] => {
    return Array.from(new Set(questions.filter((q) => q.subject === subject).map((q) => q.chapter)));
  };

  const initialSubject = topics[0] || "";
  const initialChapters = getChaptersBySubject(initialSubject);
  const initialChapter = initialChapters[0] || "";
  const initialFilteredQuestions = questions.filter(
    (q) => q.subject === initialSubject && q.chapter === initialChapter
  );

  return {
    selectedSubject: initialSubject,
    selectedChapter: initialChapter,
    questions,
    topics,
    chapters: initialChapters,
    filteredQuestions: initialFilteredQuestions,

    setSubject: (subject) => {
      const newChapters = getChaptersBySubject(subject);
      const newChapter = newChapters[0] || "";
      set({
        selectedSubject: subject,
        selectedChapter: newChapter,
        chapters: newChapters,
        filteredQuestions: questions.filter((q) => q.subject === subject && q.chapter === newChapter),
      });
    },

    setChapter: (chapter) => {
      set({
        selectedChapter: chapter,
        filteredQuestions: questions.filter((q) => q.subject === get().selectedSubject && q.chapter === chapter),
      });
    },

    getChaptersBySubject,
  };
});
