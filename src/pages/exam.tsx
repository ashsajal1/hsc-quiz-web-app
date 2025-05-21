import React, { useState, useEffect, useCallback, Fragment } from "react";
import { useLocation } from "react-router-dom";
import questionsData from "@/data/questions.json"; // Import questions JSON
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn, shuffleArray } from "@/lib/utils"; // Utility to shuffle array
import { Option, Question, Questions } from "@/lib/type";
import { useQuizStore } from "@/store/useQuizStore";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ExamProps } from "./saved";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const EXAM_DURATION = 10 * 60; // 10 minutes in seconds

// ----------------------------------------------------
// ExamSetup Component
// ----------------------------------------------------
interface ExamSetupProps {
  subject: string;
  chapter: string;
  setSubject: (value: string) => void;
  setChapter: (value: string) => void;
  topics: string[];
  chaptersForSelectedSubject: string[];
  startExam: () => void;
}

const ExamSetup: React.FC<ExamSetupProps> = ({
  subject,
  chapter,
  setSubject,
  setChapter,
  topics,
  chaptersForSelectedSubject,
  startExam,
}) => {
  // Function to create and start a random exam
  const handleRandomExam = () => {
    // Create a map for unique subject-chapter pairs
    const uniqueExamsMap = new Map<
      string,
      { subject: string; chapter: string }
    >();
    questionsData.forEach((q: Question) => {
      const key = `${q.subject}-${q.chapter}`;
      if (!uniqueExamsMap.has(key)) {
        uniqueExamsMap.set(key, { subject: q.subject, chapter: q.chapter });
      }
    });
    const uniqueExams = Array.from(uniqueExamsMap.values());

    // Pick a random exam from the unique pairs
    const randomExam =
      uniqueExams[Math.floor(Math.random() * uniqueExams.length)];

    // Set the subject and chapter and start the exam
    setSubject(randomExam.subject);
    setChapter(randomExam.chapter);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Start Your Exam</h1>

      <Select value={subject} onValueChange={setSubject}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Subject" />
        </SelectTrigger>
        <SelectContent>
          {topics.map((topic) => (
            <SelectItem key={topic} value={topic}>
              {topic}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={chapter} onValueChange={setChapter}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Chapter" />
        </SelectTrigger>
        <SelectContent>
          {chaptersForSelectedSubject.map((ch) => (
            <SelectItem key={ch} value={ch}>
              {ch}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2 items-center">
        <Button onClick={startExam} disabled={!subject || !chapter}>
          Start Exam
        </Button>

        <Button variant="outline" onClick={handleRandomExam}>
          Try a Random Exam
        </Button>
      </div>
    </div>
  );
};
// ----------------------------------------------------
// ExamInProgress Component
// ----------------------------------------------------
interface ExamInProgressProps {
  subject: string;
  chapter: string;
  examQuestions: Questions;
  selectedAnswers: { [key: number]: number | null };
  handleAnswerSelect: (questionId: number, optionId: number) => void;
  finishExam: () => void;
  timeLeft: number;
  examDuration: number;
}

const ExamInProgress: React.FC<ExamInProgressProps> = ({
  subject,
  chapter,
  examQuestions,
  selectedAnswers,
  handleAnswerSelect,
  finishExam,
  timeLeft,
  examDuration,
}) => {
  const [showTimerWarning, setShowTimerWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 60) {
      setShowTimerWarning(true);
    } else {
      setShowTimerWarning(false);
    }
  }, [timeLeft]);

  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = (answeredCount / examQuestions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Exam in Progress</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-sm">
              Subject: {subject}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Chapter: {chapter}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {answeredCount}/{examQuestions.length} Answered
          </Badge>
        </div>
      </div>

      <div className="sticky top-20 p-4 flex flex-col gap-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-medium">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress
              value={(timeLeft / examDuration) * 100}
              className="w-[200px]"
            />
          </div>
        </div>
        <AnimatePresence>
          {showTimerWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-red-500 text-sm"
            >
              <AlertCircle className="h-4 w-4" />
              Less than 1 minute remaining!
            </motion.div>
          )}
        </AnimatePresence>
        <Progress value={progress} className="w-full" />
      </div>

      <div className="space-y-4">
        {examQuestions.map((q, index) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1">
                    {index + 1}
                  </Badge>
                  <div className="space-y-2">
                    {q.description && (
                      <p className="text-muted-foreground">{q.description}</p>
                    )}
                    <p className="font-medium">
                      {q.question.split("\n").map((line, idx) => (
                        <Fragment key={idx}>
                          {line}
                          <br />
                        </Fragment>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                {q.options.map((option: Option) => (
                  <Button
                    key={option.id}
                    variant={
                      selectedAnswers[q.id] === option.id
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleAnswerSelect(q.id, option.id)}
                    className="w-full justify-start text-left h-auto py-3 px-4"
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="lg" className="shadow-lg">
              Submit Exam
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
              <AlertDialogDescription>
                You have answered {answeredCount} out of {examQuestions.length}{" "}
                questions.
                {answeredCount < examQuestions.length && (
                  <p className="text-red-500 mt-2">
                    You still have {examQuestions.length - answeredCount}{" "}
                    unanswered questions.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Exam</AlertDialogCancel>
              <AlertDialogAction onClick={finishExam}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------
// ExamReview Component
// ----------------------------------------------------
interface ExamReviewProps {
  examQuestions: Questions;
  selectedAnswers: { [key: number]: number | null };
  score: number | null;
  restartExam: () => void;
  restartSameExam: () => void;
}

const ExamReview: React.FC<ExamReviewProps> = ({
  examQuestions,
  selectedAnswers,
  score,
  restartExam,
  restartSameExam,
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveExam = () => {
    const savedExams = JSON.parse(localStorage.getItem("savedExams") ?? "[]");
    const newExam = {
      id: savedExams.length + 1,
      questions: examQuestions,
      subject: examQuestions[0].subject,
      chapter: examQuestions[0].chapter,
    };

    const isDuplicate = savedExams.some(
      (exam: ExamProps) =>
        exam.subject === newExam.subject &&
        exam.chapter === newExam.chapter &&
        exam.questions.every((q) =>
          newExam.questions.some((newQ) => q.id === newQ.id)
        )
    );

    if (isDuplicate) {
      setIsSaved(true);
      alert("You have already saved this exam.");
      return;
    }

    savedExams.push(newExam);
    localStorage.setItem("savedExams", JSON.stringify(savedExams));
    setIsSaved(true);
  };

  const scorePercentage = score ? (score / examQuestions.length) * 100 : 0;
  const isPassing = scorePercentage >= 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Exam Finished!</h1>
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "text-4xl font-bold",
              isPassing ? "text-green-500" : "text-red-500"
            )}
          >
            {score} / {examQuestions.length}
          </div>
          <div className="text-muted-foreground">
            {scorePercentage.toFixed(1)}% {isPassing ? "Passed" : "Failed"}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Review Your Answers</h2>
        {examQuestions.map((q, index) => {
          const selectedOptionId = selectedAnswers[q.id];
          const correctOption = q.options.find((o: Option) => o.isCorrect);
          const isCorrect = correctOption?.id === selectedOptionId;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "p-6 space-y-4",
                  isCorrect ? "border-green-500" : "border-red-500"
                )}
              >
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-1">
                    {index + 1}
                  </Badge>
                  <div className="space-y-2">
                    {q.description && (
                      <p className="text-muted-foreground">{q.description}</p>
                    )}
                    <p className="font-medium">
                      {q.question.split("\n").map((line, idx) => (
                        <Fragment key={idx}>
                          {line}
                          <br />
                        </Fragment>
                      ))}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  {q.options.map((option: Option) => (
                    <Button
                      key={option.id}
                      disabled={
                        selectedOptionId !== option.id && !option.isCorrect
                      }
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left h-auto py-3 px-4",
                        selectedOptionId === option.id &&
                          isCorrect &&
                          "bg-green-500 text-white hover:bg-green-600",
                        selectedOptionId === option.id &&
                          !isCorrect &&
                          "bg-red-500 text-white hover:bg-red-600",
                        option.isCorrect && "border-green-500"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {selectedOptionId === option.id && isCorrect && (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {selectedOptionId === option.id && !isCorrect && (
                          <XCircle className="h-4 w-4" />
                        )}
                        {option.isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {option.text}
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="w-full" onClick={restartExam}>
          Start New Exam
        </Button>
        <Button className="w-full" variant="outline" onClick={restartSameExam}>
          Retry Same Chapter
        </Button>
        <Button
          onClick={handleSaveExam}
          variant="outline"
          className="w-full"
          disabled={isSaved}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="mr-2 h-5 w-5" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="mr-2 h-5 w-5" />
              Save Exam
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------
// Main ExamComponent
// ----------------------------------------------------
const ExamComponent: React.FC = () => {
  const { topics, getChaptersBySubject } = useQuizStore();
  const location = useLocation();

  const [subject, setSubject] = useState<string>("");
  const [chapter, setChapter] = useState<string>("");
  const [examStarted, setExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Questions>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number | null;
  }>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [examId, setExamId] = useState<null | string>(null);

  // Get query params (if any)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get("subject");
    const chapterParam = params.get("chapter");
    const examIdParam = params.get("examId");

    if (subjectParam) setSubject(subjectParam);
    if (chapterParam) setChapter(chapterParam);
    if (examIdParam) setExamId(examIdParam);
  }, [location]);

  useEffect(() => {
    if (examId) {
      const savedExams = localStorage.getItem("savedExams");
      let examQuestions: Questions = [];

      if (savedExams) {
        const examsArray = JSON.parse(savedExams);
        const examIdNumber = Number(examId); // Convert examId to a number
        examQuestions =
          examsArray.find(
            (e: { id: number; questions: Questions }) => e.id === examIdNumber
          )?.questions || [];
      } else {
        examQuestions = [];
      }

      if (examQuestions.length === 0)
        return console.log("No questions found for this exam");

      setSubject(examQuestions[0].subject);
      setChapter(examQuestions[0].chapter);
      setExamQuestions(examQuestions);
      setExamStarted(true);
      return;
    }
  }, [examId]);

  const chaptersForSelectedSubject = getChaptersBySubject(subject);

  // When finishing the exam, calculate score
  const finishExam = useCallback(() => {
    let correctCount = 0;
    examQuestions.forEach((q) => {
      const selectedOptionId = selectedAnswers[q.id];
      const correctOption = q.options.find((o: Option) => o.isCorrect);
      if (correctOption?.id === selectedOptionId) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setExamFinished(true);
  }, [examQuestions, selectedAnswers]);

  // Timer effect
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0) {
      finishExam();
    }
  }, [examStarted, finishExam, timeLeft]);

  // Start exam by filtering and shuffling questions
  const startExam = () => {
    const filteredQuestions = questionsData.filter(
      (q) => q.subject === subject && q.chapter === chapter
    );
    const selectedQuestions = shuffleArray(filteredQuestions).slice(0, 25);
    const questionsWithShuffledOptions = selectedQuestions.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    setExamQuestions(questionsWithShuffledOptions);
    setExamStarted(true);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Restart by reloading the page
  const restartExam = () => {
    window.location.reload();
  };

  // Restart exam keeping the same subject/chapter (and new questions)
  const restartSameExam = () => {
    setExamStarted(false);
    setSelectedAnswers({});
    setTimeLeft(EXAM_DURATION);
    setExamFinished(false);
    setScore(null);
    setExamStarted(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {!examStarted && !examFinished && (
        <ExamSetup
          subject={subject}
          chapter={chapter}
          setSubject={setSubject}
          setChapter={setChapter}
          topics={topics}
          chaptersForSelectedSubject={chaptersForSelectedSubject}
          startExam={startExam}
        />
      )}

      {examStarted && !examFinished && (
        <ExamInProgress
          subject={subject}
          chapter={chapter}
          examQuestions={examQuestions}
          selectedAnswers={selectedAnswers}
          handleAnswerSelect={handleAnswerSelect}
          finishExam={finishExam}
          timeLeft={timeLeft}
          examDuration={EXAM_DURATION}
        />
      )}

      {examFinished && (
        <ExamReview
          examQuestions={examQuestions}
          selectedAnswers={selectedAnswers}
          score={score}
          restartExam={restartExam}
          restartSameExam={restartSameExam}
        />
      )}
    </div>
  );
};

export default ExamComponent;
