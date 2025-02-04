import { useState, useEffect, useCallback } from "react";
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
import { shuffleArray } from "@/lib/utils"; // Utility to shuffle array
import { Option, Questions } from "@/lib/type";
import { useQuizStore } from "@/store/useQuizStore";
import { useLocation } from "react-router-dom";

const EXAM_DURATION = 10 * 60; // 10 minutes in seconds

export default function ExamPage() {
  const { topics, getChaptersBySubject } = useQuizStore();

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

  const location = useLocation();

  // Extract subject and chapter from query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get("subject");
    const chapterParam = params.get("chapter");

    if (subjectParam) setSubject(subjectParam);
    if (chapterParam) setChapter(chapterParam);
    // setExamStarted(true)
  }, [location]);

  const chaptersForSelectedSubject = getChaptersBySubject(subject);

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

  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {!examStarted && !examFinished && (
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
              {chaptersForSelectedSubject.map((chapter) => (
                <SelectItem value={chapter} key={chapter}>
                  {chapter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={startExam} disabled={!subject || !chapter}>
            Start Exam
          </Button>
        </div>
      )}

      {examStarted && !examFinished && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Exam</h1>
            <p>Subject : {subject}</p>
            <p>Chapter : {chapter}</p>
          </div>
          <Progress value={(timeLeft / EXAM_DURATION) * 100} />
          <p>
            Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}s
          </p>
          {examQuestions.map((q, index) => (
            <Card key={q.id} className="p-4 space-y-2">
              <p className="font-medium">
                {index + 1}. {q.question}
              </p>
              {q.options.map((option: Option) => (
                <Button
                  key={option.id}
                  variant={"outline"}
                  onClick={() => handleAnswerSelect(q.id, option.id)}
                  className={`w-full text-left ${
                    selectedAnswers[q.id] === option.id
                      ? "bg-blue-500 text-white"
                      : ""
                  }`}
                >
                  {option.text}
                </Button>
              ))}
            </Card>
          ))}
          <Button onClick={finishExam}>Submit Exam</Button>
        </div>
      )}

      {examFinished && (
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
                    isCorrect
                      ? "border border-green-600"
                      : "border border-red-600"
                  }`}
                >
                  <p className="font-medium">
                    {index + 1}. {q.question}
                  </p>
                  {q.options.map((option: Option) => (
                    <Button
                      // disabled
                      key={option.id}
                      variant={"secondary"}
                      className={`w-full text-left ${
                        selectedOptionId === option.id
                          ? isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : ""
                      } ${option.isCorrect ? "bg-green-500" : ""}`}
                    >
                      {option.text}
                    </Button>
                  ))}
                </Card>
              );
            })}
          </div>

          <div className="flex items-center gap-2 w-full">
            <Button className="w-full" onClick={() => window.location.reload()}>
              Restart
            </Button>
            <Button
              className="w-full"
              variant={"outline"}
              onClick={() => window.location.reload()}
            >
              Restart with same subject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
