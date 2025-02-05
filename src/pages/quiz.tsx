import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Option, Questions } from "@/lib/type";
import React from "react";
import { useQuizStore } from "@/store/useQuizStore";
import {
  ArrowLeft,
  ArrowLeftFromLine,
  ArrowRight,
  ArrowRightFromLine,
} from "lucide-react";

export default function QuizPage() {
  // Parse questions (if needed, here we assume they are valid JSON already)
  const { questions, getChaptersBySubject } = useQuizStore();
  // Extract available topics and chapters from the subjects in your questions.
  // We assume subject is in the format "topic-chapter" (e.g., "physics-1st")
  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      const topic = q.subject;
      set.add(topic);
    });
    return Array.from(set);
  }, [questions]);

  const [selectedTopic, setSelectedTopic] = useState<string>(topics[0] || "");
  const chapters = getChaptersBySubject(selectedTopic);
  const [selectedChapter, setSelectedChapter] = useState<string>(
    chapters[0] || "0"
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedRange, setSelectedRange] = useState<
    "start" | "end" | "middle-to-start" | "middle-to-end"
  >("start");
  const [selectedQuestions, setSelectedQuestions] = useState<Questions>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  // Filter questions based on selected topic and chapter
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const topic = q.subject;
      const chapter = q.chapter;
      return topic === selectedTopic && chapter === selectedChapter;
    });
  }, [questions, selectedTopic, selectedChapter]);

  useEffect(() => {
    let sortedQuestions = [...filteredQuestions]; // Create a new array to avoid mutating state directly
    const middleIndex = Math.floor(sortedQuestions.length / 2);

    switch (selectedRange) {
      case "start":
        setSelectedQuestions(sortedQuestions);
        setCurrentQuestionIndex(0);
        break;
      case "end":
        sortedQuestions = sortedQuestions
          .slice()
          .sort((q1, q2) => q2.id - q1.id);
        setSelectedQuestions(sortedQuestions);
        setCurrentQuestionIndex(0);
        break;
      case "middle-to-start":
        setSelectedQuestions(sortedQuestions);
        setCurrentQuestionIndex(middleIndex);
        break;
      case "middle-to-end":
        sortedQuestions = sortedQuestions
          .slice()
          .sort((q1, q2) => q2.id - q1.id);
        setSelectedQuestions(sortedQuestions);
        setCurrentQuestionIndex(middleIndex);
        break;
      default:
        setSelectedQuestions(sortedQuestions);
        setCurrentQuestionIndex(0);
        break;
    }
  }, [filteredQuestions, selectedRange]);

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  // Handler for option click
  const handleOptionClick = (option: Option) => {
    setSelectedOptionId(option.id);
    if (showAnswer) return; // prevent multiple answers
    if (option.isCorrect) {
      setIsCorrect(true);
      setScore((prev) => prev + 1);
    } else {
      setIsCorrect(false);
    }
    setShowAnswer(true);
  };

  // Handler for moving to the next question
  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setIsCorrect(null);
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

  const selectedRanges = [
    "start",
    "middle-to-start",
    "middle-to-end",
    "end",
  ] as const;

  return (
    <div className="container flex flex-col md:flex-row items-center justify-center mx-auto p-8 space-y-6 gap-2">
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-3xl font-bold">Quiz Page</h1>

        {/* Selectors for Topic and Chapter */}
        <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4">
          <Select
            value={selectedTopic}
            onValueChange={(val) => {
              setSelectedTopic(val);
              setCurrentQuestionIndex(0);
            }}
          >
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

          <Select
            value={selectedChapter}
            onValueChange={(val) => {
              setSelectedChapter(val);
              setCurrentQuestionIndex(0);
            }}
          >
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

        <div>
          <span>Select range</span>
          <div className="flex items-center justify-between w-full gap-2">
            {selectedRanges.map((range) => (
              <Button
                variant={selectedRange === range ? "default" : "secondary"}
                className="w-full"
                key={range}
                onClick={() => setSelectedRange(range)}
              >
                {range === "start" ? (
                  <ArrowRight />
                ) : range === "end" ? (
                  <ArrowLeft />
                ) : range === "middle-to-start" ? (
                  <ArrowLeftFromLine />
                ) : range === "middle-to-end" ? (
                  <ArrowRightFromLine />
                ) : (
                  range
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Card */}
      {selectedQuestions.length > 0 ? (
        <Card
          className={`w-full mx-auto ${
            showAnswer
              ? isCorrect
                ? "border border-green-600"
                : "border border-red-600"
              : ""
          }`}
        >
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center">
                <span>
                  Question {currentQuestionIndex + 1} of{" "}
                  {filteredQuestions.length}
                </span>
                <span>Score : {score}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 font-semibold">
              {currentQuestion.description && (
                <>
                  <p>{currentQuestion.description}</p>
                  <br />
                </>
              )}
              {currentQuestion.question.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>

            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <Button
                  disabled={
                    selectedOptionId !== option.id &&
                    !option.isCorrect &&
                    showAnswer
                  }
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  variant={
                    !showAnswer
                      ? "outline"
                      : option.id === selectedOptionId || option.isCorrect
                      ? "link"
                      : "outline"
                  }
                  className={`w-full text-black dark:text-white text-left ${
                    selectedOptionId === option.id && showAnswer
                      ? isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : ""
                  } ${option.isCorrect && showAnswer ? "bg-green-500" : ""}`}
                >
                  {option.text}
                </Button>
              ))}
            </div>
            {showAnswer && currentQuestion.explanation && (
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {showAnswer && (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < filteredQuestions.length - 1
                  ? "Next"
                  : "Finish"}
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
