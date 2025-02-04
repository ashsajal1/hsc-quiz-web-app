import { useState, useMemo } from "react";
import questionsJson from "../data/questions.json";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Option, Question } from "@/lib/type";


// Parse questions (if needed, here we assume they are valid JSON already)
const questions: Question[] = JSON.parse(JSON.stringify(questionsJson));

export default function QuizPage() {
  // Extract available topics and chapters from the subjects in your questions.
  // We assume subject is in the format "topic-chapter" (e.g., "physics-1st")
  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      const topic = q.subject
      set.add(topic);
    });
    return Array.from(set);
  }, []);

  const chapters = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      const chapter = q.chapter;
      set.add(chapter);
    });
    
    return Array.from(set);
  }, []);

  const [selectedTopic, setSelectedTopic] = useState<string>(topics[0] || "");
  const [selectedChapter, setSelectedChapter] = useState<string>(chapters[0] || "0");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // Filter questions based on selected topic and chapter
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const topic = q.subject
      const chapter = q.chapter;
      return topic === selectedTopic && chapter === selectedChapter;
    });
  }, [selectedTopic, selectedChapter]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  // Handler for option click
  const handleOptionClick = (option: Option) => {
    if (showAnswer) return; // prevent multiple answers
    if (option.isCorrect) {
      setScore((prev) => prev + 1);
    }
    setShowAnswer(true);
  };

  // Handler for moving to the next question
  const handleNextQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Reset for a new quiz or display results
      alert(`Quiz completed! Your score: ${score}/${filteredQuestions.length}`);
      setCurrentQuestionIndex(0);
      setScore(0);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Quiz Page</h1>

      {/* Selectors for Topic and Chapter */}
      <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4">
        <Select value={selectedTopic} onValueChange={(val) => { setSelectedTopic(val); setCurrentQuestionIndex(0); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((topic) => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedChapter} onValueChange={(val) => { setSelectedChapter(val); setCurrentQuestionIndex(0); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select chapter" />
          </SelectTrigger>
          <SelectContent>
            {chapters.map((chap) => (
              <SelectItem key={chap} value={chap}>
                {chap}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quiz Card */}
      {filteredQuestions.length > 0 ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>
              Question {currentQuestionIndex + 1} of {filteredQuestions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 font-semibold">{currentQuestion.question}</p>
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className={`w-full text-left ${
                    showAnswer &&
                    option.isCorrect &&
                    "bg-green-500 border-green-500"
                  } ${showAnswer && !option.isCorrect && "bg-red-500 border-red-500"}`}
                  onClick={() => handleOptionClick(option)}
                  disabled={showAnswer}
                >
                  {option.text}
                </Button>
              ))}
            </div>
            {showAnswer && (
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </p>
                <p>
                  <strong>Hint:</strong> {currentQuestion.hint}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {showAnswer && (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < filteredQuestions.length - 1 ? "Next" : "Finish"}
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <p>No questions found for the selected topic and chapter.</p>
      )}
    </div>
  );
}
