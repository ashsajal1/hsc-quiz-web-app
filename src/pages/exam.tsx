"use client";

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

const EXAM_DURATION = 10 * 60; // 10 minutes in seconds

export default function ExamPage() {
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
      (q) => q.subject === subject
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

          <Select onValueChange={setSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physics-1st">Physics 1st</SelectItem>
              <SelectItem value="math">Math</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setChapter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Chapter 1</SelectItem>
              <SelectItem value="2">Chapter 2</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={startExam} disabled={!subject || !chapter}>
            Start Exam
          </Button>
        </div>
      )}

      {examStarted && !examFinished && (
        <div className="space-y-6">
          <h1 className="text-xl font-bold">Exam</h1>
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
                <label key={option.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={option.id}
                    onChange={() => handleAnswerSelect(q.id, option.id)}
                    checked={selectedAnswers[q.id] === option.id}
                  />
                  <span>{option.text}</span>
                </label>
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
          <Button onClick={() => location.reload()}>Restart</Button>
        </div>
      )}
    </div>
  );
}
