import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowLeftFromLine,
  ArrowRight,
  ArrowRightFromLine,
} from "lucide-react";
import { useQuizStore } from "@/store/useQuizStore";
import { Option } from "@/lib/type";
import { McqCard } from "./mcq-card";

interface QuizProps {
  initialTopic?: string;
  initialChapter?: string;
  onComplete?: (score: number, total: number) => void;
}

export function Quiz({ initialTopic, initialChapter, onComplete }: QuizProps) {
  const { questions, getChaptersBySubject } = useQuizStore();

  // Create a list of available topics from the questions.
  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      set.add(q.subject);
    });
    return Array.from(set);
  }, [questions]);

  // Use initial values if provided; otherwise, default to the first available value.
  const [selectedTopic, setSelectedTopic] = useState<string>(
    initialTopic || topics[0] || ""
  );
  const chapters = getChaptersBySubject(selectedTopic);
  const [selectedChapter, setSelectedChapter] = useState<string>(
    initialChapter || (chapters[0] ?? "0")
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedRange, setSelectedRange] = useState<
    "start" | "end" | "middle-to-start" | "middle-to-end"
  >("start");
  const [selectedQuestions, setSelectedQuestions] = useState<typeof questions>(
    []
  );
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  // Filter questions based on the currently selected topic and chapter.
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      return q.subject === selectedTopic && q.chapter === selectedChapter;
    });
  }, [questions, selectedTopic, selectedChapter]);

  // Based on the selected range, sort or set the starting index for the quiz.
  useEffect(() => {
    let sortedQuestions = [...filteredQuestions];
    const middleIndex = Math.floor(sortedQuestions.length / 2);

    switch (selectedRange) {
      case "start":
        setSelectedQuestions(sortedQuestions);
        setCurrentQuestionIndex(0);
        break;
      case "end":
        sortedQuestions = sortedQuestions.sort((q1, q2) => q2.id - q1.id);
        setSelectedQuestions(sortedQuestions);
        setCurrentQuestionIndex(0);
        break;
      case "middle-to-start":
        sortedQuestions = sortedQuestions.sort((q1, q2) => q2.id - q1.id);
        setSelectedQuestions(sortedQuestions);
        setCurrentQuestionIndex(middleIndex);
        break;
      case "middle-to-end":
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

  // Handle when a user clicks on an option.
  const handleOptionClick = (option: Option) => {
    setSelectedOptionId(option.id);
    if (showAnswer) return; // Prevent multiple selections
    if (option.isCorrect) {
      setIsCorrect(true);
      setScore((prev) => prev + 1);
    } else {
      setIsCorrect(false);
    }
    setShowAnswer(true);
  };

  // Handler for moving to the next question or finishing the quiz.
  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setIsCorrect(null);
    setShowAnswer(false);
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // When the quiz completes, either trigger a callback or show an alert.
      if (onComplete) {
        onComplete(score, filteredQuestions.length);
      } else {
        alert(
          `Quiz completed! Your score: ${score}/${filteredQuestions.length}`
        );
      }
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
    <div className="flex flex-col md:flex-row items-center justify-center mx-auto p-8 space-y-6 gap-2">
      {/* Topic, Chapter, and Range Selectors */}
      <div className="flex flex-col gap-2 w-full">
        <Label>Select subject and chapter.</Label>
        <div className="flex w-full sm:w-auto gap-2">
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
          <Label>Select range</Label>
          <div className="flex items-center justify-between w-full gap-2">
            {selectedRanges.map((range) => (
              <Button
                variant={selectedRange === range ? "default" : "secondary"}
                className="w-full"
                size={"sm"}
                key={range}
                onClick={() => setSelectedRange(range)}
              >
                {range === "start" ? (
                  <ArrowRight strokeWidth={"1"} className="h-5 w-5" />
                ) : range === "end" ? (
                  <ArrowLeft strokeWidth={"1"} className="h-5 w-5" />
                ) : range === "middle-to-start" ? (
                  <ArrowLeftFromLine strokeWidth={"1"} className="h-5 w-5" />
                ) : range === "middle-to-end" ? (
                  <ArrowRightFromLine strokeWidth={"1"} className="h-5 w-5" />
                ) : (
                  range
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Card */}
      {selectedQuestions.length > 0 && currentQuestion ? (
        <McqCard
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={filteredQuestions.length}
          score={score}
          selectedOptionId={selectedOptionId}
          showAnswer={showAnswer}
          isCorrect={isCorrect}
          onOptionClick={handleOptionClick}
          onNextQuestion={handleNextQuestion}
        />
      ) : (
        <p>No questions found for the selected topic and chapter.</p>
      )}
    </div>
  );
}
