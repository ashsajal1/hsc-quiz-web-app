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
import { Option, Questions } from "@/lib/type";
import { useQuizStore } from "@/store/useQuizStore";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { ExamProps } from "./saved";

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

      <Button onClick={startExam} disabled={!subject || !chapter}>
        Start Exam
      </Button>
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Exam</h1>
        <p>Subject: {subject}</p>
        <p>Chapter: {chapter}</p>
      </div>
      <Progress value={(timeLeft / examDuration) * 100} />
      <p>
        Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}s
      </p>
      {examQuestions.map((q, index) => (
        <Card key={q.id} className="p-4 space-y-2">
          <p className="font-medium">
            {q.description && (
              <>
                <p>{q.description}</p>
                <br />
              </>
            )}
            {index + 1}.{" "}
            <span className="mb-4 font-semibold">
              {q.question.split("\n").map((line, idx) => (
                <Fragment key={idx}>
                  {line}
                  <br />
                </Fragment>
              ))}
            </span>
          </p>
          {q.options.map((option: Option) => (
            <Button
              key={option.id}
              variant={
                selectedAnswers[q.id] === option.id ? "default" : "outline"
              }
              onClick={() => handleAnswerSelect(q.id, option.id)}
              className="w-full text-left"
            >
              {option.text}
            </Button>
          ))}
        </Card>
      ))}
      <Button onClick={finishExam}>Submit Exam</Button>
    </div>
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
    // Retrieve savedExams from localStorage, defaulting to an empty array if not present.
    const savedExams = JSON.parse(localStorage.getItem("savedExams") ?? "[]");

    // Create a new exam object. Use savedExams.length to determine the new ID.
    const newExam = {
      id: savedExams.length + 1,
      questions: examQuestions,
      subject: examQuestions[0].subject,
      chapter: examQuestions[0].chapter,
    };

    //check is duplicate or not
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
    // Add the new exam to the savedExams array.
    savedExams.push(newExam);

    // Save the updated array back to localStorage.
    localStorage.setItem("savedExams", JSON.stringify(savedExams));
    setIsSaved(true);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Exam Finished!</h1>
      <p>Your Score: {score} / 25</p>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Review Your Answers</h2>
        {examQuestions.map((q, index) => {
          const selectedOptionId = selectedAnswers[q.id];
          const correctOption = q.options.find((o: Option) => o.isCorrect);
          const isCorrect = correctOption?.id === selectedOptionId;

          return (
            <Card
              key={q.id}
              className={`p-4 space-y-2 ${
                isCorrect ? "border border-green-600" : "border border-red-600"
              }`}
            >
              <p className="font-medium">
                {index + 1}.{" "}
                <span className="mb-4 font-semibold">
                  {q.description && (
                    <>
                      <p>{q.description}</p>
                      <br />
                    </>
                  )}
                  {q.question.split("\n").map((line, idx) => (
                    <Fragment key={idx}>
                      {line}
                      <br />
                    </Fragment>
                  ))}
                </span>
              </p>
              {q.options.map((option: Option) => (
                <Button
                  key={option.id}
                  disabled={selectedOptionId !== option.id && !option.isCorrect}
                  variant={
                    selectedOptionId !== option.id && !option.isCorrect
                      ? "secondary"
                      : "link"
                  }
                  className={cn(
                    `w-full text-black dark:text-white text-left ${
                      selectedOptionId === option.id
                        ? isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : ""
                    } ${option.isCorrect ? "bg-green-500" : ""}`
                  )}
                >
                  {option.text}
                </Button>
              ))}
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-2 w-full">
        <Button className="w-full" onClick={restartExam}>
          Restart
        </Button>
        <Button className="w-full" variant="outline" onClick={restartSameExam}>
          Restart with same questions
        </Button>
      </div>
      <Button
        onClick={handleSaveExam}
        variant={"destructive"}
        className="w-full"
        disabled={isSaved}
      >
        {isSaved ? (
          <BookmarkCheck className="mr-2 h-5 w-5" />
        ) : (
          <Bookmark className="mr-2 h-5 w-5" />
        )}{" "}
        Save
      </Button>
    </div>
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
