import { useState, useMemo, useEffect, useCallback } from "react";
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
  BookOpen,
  Lightbulb,
  Timer,
  Volume2,
  VolumeX,
  Play,
  StopCircle,
} from "lucide-react";
import { useQuizStore } from "@/store/useQuizStore";
import { Option } from "@/lib/type";
import { McqCard } from "./mcq-card";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQueryState } from "nuqs";
import Confetti from "react-confetti";
import { useWindowSize } from "../hooks/useWindowSize";
import { useSounds } from "@/hooks/useSounds";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSpeakerStore } from "@/store/useSpeakerStore";

interface QuizProps {
  initialTopic?: string;
  initialChapter?: string;
  onComplete?: (score: number, total: number) => void;
  questionId?: string | null;
}

export function Quiz({
  initialTopic,
  initialChapter,
  onComplete,
  questionId,
}: QuizProps) {
  const { playSound } = useSounds();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const { questions, getChaptersBySubject } = useQuizStore();
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isReadingAll, setIsReadingAll] = useState(false);
  const { speak, isSpeaking, stop } = useSpeakerStore();

  // Create a list of available topics from the questions.
  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      set.add(q.subject);
    });
    return Array.from(set);
  }, [questions]);

  // Use nuqs for URL state management
  const [topic, setTopic] = useQueryState("subject", {
    defaultValue: initialTopic || topics[0] || "",
    parse: (value) => value,
    serialize: (value) => value,
  });

  const [chapter, setChapter] = useQueryState("chapter", {
    defaultValue: initialChapter || "0",
    parse: (value) => value,
    serialize: (value) => value,
  });

  const [selectedQuestionId, setSelectedQuestionId] = useQueryState(
    "questionId",
    {
      defaultValue: questionId || null,
      parse: (value) => value,
      serialize: (value) => value || "",
    }
  );

  const chapters = getChaptersBySubject(topic);

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
      return q.subject === topic && q.chapter === chapter;
    });
  }, [questions, topic, chapter]);

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

  // Find the specific question if questionId is provided and set initial index
  useEffect(() => {
    if (selectedQuestionId) {
      const questionIndex = filteredQuestions.findIndex(
        (q) => q.id.toString() === selectedQuestionId
      );
      if (questionIndex !== -1) {
        setCurrentQuestionIndex(questionIndex);
      }
    }
  }, [selectedQuestionId, filteredQuestions]);

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  // Handle when a user clicks on an option.
  const handleOptionClick = useCallback(
    async (option: Option) => {
      // Prevent multiple selections if answer already revealed.
      if (showAnswer) return;
      setSelectedOptionId(option.id);
      if (option.isCorrect) {
        setIsCorrect(true);
        setScore((prev) => prev + 1);
        setShowConfetti(true);
        // Play happy sound for correct answer if sound is enabled
        if (isSoundEnabled) {
          playSound("happy");
        }
        // Hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
      } else {
        setIsCorrect(false);
        // Play sad sound for incorrect answer if sound is enabled
        if (isSoundEnabled) {
          playSound("sad");
        }
      }
      setShowAnswer(true);
    },
    [showAnswer, isSoundEnabled, playSound]
  );

  // Handler for moving to the next question or finishing the quiz.
  const handleNextQuestion = useCallback(async () => {
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
  }, [currentQuestionIndex, filteredQuestions.length, onComplete, score]);

  // Handler for "See Answer" button click.
  const handleSeeAnswer = () => {
    // If the user hasn't selected an option, we simply reveal the correct answer.
    // (Assuming McqCard will iterate over currentQuestion.options to highlight the correct one.)
    setShowAnswer(true);
  };

  // Function to read all questions and answers
  const readAllQuestions = useCallback(() => {
    if (isReadingAll && isSpeaking) {
      stop();
      setIsReadingAll(false);
      return;
    }

    setIsReadingAll(true);

    const readNext = async () => {
      const question = selectedQuestions[currentQuestionIndex];
      const options = question.options
        .map((opt, idx) => `${String.fromCharCode(97 + idx)}: ${opt.text}`)
        .join(". ");

      // Task 1: Read question and options
      const text = `Question ${currentQuestionIndex + 1}: ${
        question.question
      }. Options: ${options}.`;
      await speak(text);

      // Wait for 1 second after reading question
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Task 2: Read answer
      const ans = `Correct Answer: ${
        question.options.find((opt) => opt.isCorrect)?.text
      }`;
      await speak(ans);

      // Wait for 1 second after reading answer
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await handleOptionClick(
        question.options.find((opt) => opt.isCorrect) as Option
      );

      // Wait for 2 seconds before moving to next question
      await new Promise((resolve) => setTimeout(resolve, 2000));
      handleNextQuestion();
    };

    readNext();
  }, [
    isReadingAll,
    isSpeaking,
    stop,
    selectedQuestions,
    currentQuestionIndex,
    speak,
    handleOptionClick,
    handleNextQuestion,
  ]);

  // // Effect to handle reading all questions
  // useEffect(() => {
  //   if (isReadingAll && !isSpeaking) {
  //     const timer = setTimeout(() => {
  //       if (currentReadingIndex < selectedQuestions.length) {
  //         readAllQuestions();
  //         // Move to next question after reading
  //         if (currentQuestionIndex < selectedQuestions.length - 1) {
  //           setCurrentQuestionIndex(prev => prev + 1);
  //         }
  //       } else {
  //         setIsReadingAll(false);
  //         setCurrentReadingIndex(0);
  //       }
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isReadingAll, isSpeaking, readAllQuestions, currentQuestionIndex, selectedQuestions.length, currentReadingIndex]);

  const selectedRanges = [
    "start",
    "middle-to-start",
    "middle-to-end",
    "end",
  ] as const;

  const SoundControl = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                isSoundEnabled ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
            >
              {isSoundEnabled ? (
                <Volume2 className="h-5 w-5 text-blue-500" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-500" />
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              {isSoundEnabled ? "Sound On" : "Sound Off"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isSoundEnabled
              ? "Click to mute sound effects"
              : "Click to enable sound effects"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center mx-auto space-y-8"
    >
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}

      {/* Quiz Header */}
      <Card className="w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Quiz Session</h2>
            <p className="text-muted-foreground">
              Test your knowledge with these questions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <BookOpen className="w-4 h-4" />
              {selectedQuestions.length} Questions
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Timer className="w-4 h-4" />
              {Math.ceil(selectedQuestions.length * 1.5)} mins
            </Badge>
          </div>
        </div>

        {/* Topic, Chapter, and Range Selectors */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label className="text-base">Select subject and chapter</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={topic}
                onValueChange={(val) => {
                  setTopic(val);
                  setCurrentQuestionIndex(0);
                  setSelectedQuestionId(null);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
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
                value={chapter}
                onValueChange={(val) => {
                  setChapter(val);
                  setCurrentQuestionIndex(0);
                  setSelectedQuestionId(null);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
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
          </div>

          <div className="space-y-2">
            <Label className="text-base">Question Range</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedRanges.map((range) => (
                <Button
                  variant={selectedRange === range ? "default" : "secondary"}
                  className="w-full gap-2"
                  size="sm"
                  key={range}
                  onClick={() => setSelectedRange(range)}
                >
                  {range === "start" ? (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Start
                    </>
                  ) : range === "end" ? (
                    <>
                      <ArrowLeft className="h-4 w-4" />
                      End
                    </>
                  ) : range === "middle-to-start" ? (
                    <>
                      <ArrowLeftFromLine className="h-4 w-4" />
                      Middle to Start
                    </>
                  ) : (
                    <>
                      <ArrowRightFromLine className="h-4 w-4" />
                      Middle to End
                    </>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Quiz Content */}
      <AnimatePresence mode="wait">
        {selectedQuestions.length > 0 && currentQuestion ? (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-6"
          >
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} of{" "}
                  {selectedQuestions.length}
                </span>
                <div className="flex items-center gap-4">
                  <Button
                    variant={
                      isReadingAll && isSpeaking ? "destructive" : "outline"
                    }
                    size="sm"
                    onClick={readAllQuestions}
                    className="gap-2"
                  >
                    {isReadingAll && isSpeaking ? (
                      <>
                        <StopCircle className="h-4 w-4" />
                        Stop Reading
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Read All
                      </>
                    )}
                  </Button>
                  <SoundControl />
                  <span className="font-medium">
                    Score: {score}/{selectedQuestions.length}
                  </span>
                </div>
              </div>
              <Progress
                value={(currentQuestionIndex / selectedQuestions.length) * 100}
                className="h-2"
              />
            </div>

            {/* Question Card */}
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

            {/* See Answer Button */}
            {!showAnswer && selectedOptionId === null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <Button
                  variant="outline"
                  onClick={handleSeeAnswer}
                  className="gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  See Answer
                </Button>
              </motion.div>
            )}

            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedQuestions.map((q, index) => (
                <Button
                  key={q.id}
                  variant={
                    currentQuestionIndex === index
                      ? "default"
                      : showAnswer && index < currentQuestionIndex
                      ? "secondary"
                      : "outline"
                  }
                  size="sm"
                  className="w-10 h-10"
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setSelectedOptionId(null);
                    setIsCorrect(null);
                    setShowAnswer(false);
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : (
          <Card className="w-full p-6 text-center">
            <p className="text-muted-foreground">
              No questions found for the selected topic and chapter.
            </p>
          </Card>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
