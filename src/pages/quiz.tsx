import { Quiz } from "@/components/quiz";

export default function QuizPage() {
  const handleQuizComplete = (score: number, total: number) => {
    alert(`Quiz completed! Score: ${score} out of ${total}`);
  };

  return (
    <div className="container mx-auto">
      <Quiz onComplete={handleQuizComplete} />
    </div>
  );
}
