import questions from "@/data/cq.json";

export default function QuestionPage() {
  return (
    <div>
      {questions.map((q) => (
        <span>{q.question}</span>
      ))}
    </div>
  );
}
