import { Quiz } from "@/components/quiz";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function QuizPage() {
  
  const handleQuizComplete = (score: number, total: number) => {
    alert(`Quiz completed! Score: ${score} out of ${total}`);
  };

  const location = useLocation();
  const searchParam = new URLSearchParams(location.search);
  const subjectParam = searchParam.get("subject");
  const chapterParam = searchParam.get("chapter");
  const questionIdParam = searchParam.get("questionId");

  const [selectedTopic, setSelectedTopic] = useState<string>(subjectParam || "1");
  const [selectedChapter, setSelectedChapter] = useState<string>(chapterParam || "0");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(questionIdParam);

  useEffect(() => {
    const searchParam = new URLSearchParams(location.search);
    const subjectParam = searchParam.get("subject");
    const chapterParam = searchParam.get("chapter");
    const questionIdParam = searchParam.get("questionId");
    
    if (subjectParam) setSelectedTopic(subjectParam);
    if (chapterParam) setSelectedChapter(chapterParam);
    if (questionIdParam) setSelectedQuestionId(questionIdParam);
  }, [location.search]);

  return (
    <div className="p-1">
      <Quiz
        onComplete={handleQuizComplete}
        initialTopic={selectedTopic}
        initialChapter={selectedChapter}
        questionId={selectedQuestionId}
      />
    </div>
  );
}
