import questionsJson from "../../public/data/questions.json"
export default function QuizPage() {
    const questions = JSON.parse(JSON.stringify(questionsJson));
  return (
    <div>
      <h1>Quiz Page</h1>
      <pre>{JSON.stringify(questions, null, 2)}</pre>
    </div>
  );
}
