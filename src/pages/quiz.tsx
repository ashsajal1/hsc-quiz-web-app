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

  const [selectedTopic, setSelectedTopic] = useState<string>(subjectParam || "1");
  const [selectedChapter, setSelectedChapter] = useState<string>(chapterParam ||"0");

  useEffect(() => {
    const searchParam = new URLSearchParams(location.search);
    const subjectParam = searchParam.get("subject");
    const chapterParam = searchParam.get("chapter");
    if (subjectParam) setSelectedTopic(subjectParam);
    if (chapterParam) setSelectedChapter(chapterParam);
  }, [location.search]);

  return (
    <div className="container mx-auto">
      <Quiz
        onComplete={handleQuizComplete}
        initialTopic={selectedTopic}
        initialChapter={selectedChapter}
      />
    </div>
  );
}
