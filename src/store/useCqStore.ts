import { create } from "zustand";
import questionsJson from "../data/questions.json";
import { CQs } from "@/lib/type";

// Parse questions and filter out only those with type "cognitive"
const questions: CQs = JSON.parse(JSON.stringify(questionsJson));
const cqQuestions = questions.filter((q) => q.type === "cognitive");

interface CQStore {
  selectedSubject: string;
  selectedChapter: string;
  questions: CQs;
  topics: string[];
  chapters: string[];
  filteredQuestions: CQs;
  setSubject: (subject: string) => void;
  setChapter: (chapter: string) => void;
  getChaptersBySubject: (subject: string) => string[];
}

// Create the CQ store using Zustand
export const useCQStore = create<CQStore>((set, get) => {
  const topics = Array.from(new Set(cqQuestions.map((q) => q.subject)));

  const getChaptersBySubject = (subject: string): string[] => {
    return Array.from(
      new Set(
        cqQuestions.filter((q) => q.subject === subject).map((q) => q.chapter)
      )
    );
  };

  const initialSubject = topics[0] || "";
  const initialChapters = getChaptersBySubject(initialSubject);
  const initialChapter = initialChapters[0] || "";
  const initialFilteredQuestions = cqQuestions.filter(
    (q) => q.subject === initialSubject && q.chapter === initialChapter
  );

  return {
    selectedSubject: initialSubject,
    selectedChapter: initialChapter,
    questions: cqQuestions,
    topics,
    chapters: initialChapters,
    filteredQuestions: initialFilteredQuestions,

    setSubject: (subject: string) => {
      const newChapters = getChaptersBySubject(subject);
      const newChapter = newChapters[0] || "";
      set({
        selectedSubject: subject,
        selectedChapter: newChapter,
        chapters: newChapters,
        filteredQuestions: cqQuestions.filter(
          (q) => q.subject === subject && q.chapter === newChapter
        ),
      });
    },

    setChapter: (chapter: string) => {
      set({
        selectedChapter: chapter,
        filteredQuestions: cqQuestions.filter(
          (q) => q.subject === get().selectedSubject && q.chapter === chapter
        ),
      });
    },

    getChaptersBySubject,
  };
});
