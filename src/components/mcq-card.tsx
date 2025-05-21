import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Option } from "@/lib/type";
import { InteractiveHoverButton } from "./magicui/interactive-hover-button";
import { Volume2, VolumeX } from "lucide-react";
import { useSpeakerStore } from "@/store/useSpeakerStore";
import { Progress } from "@/components/ui/progress";

interface QuestionCardProps {
  question: {
    id: number;
    question: string;
    description?: string;
    explanation?: string;
    options: Option[];
  };
  questionIndex: number;
  totalQuestions: number;
  score: number;
  selectedOptionId: number | null;
  showAnswer: boolean;
  isCorrect: boolean | null;
  onOptionClick: (option: Option) => void;
  onNextQuestion: () => void;
}

export function McqCard({
  question,
  questionIndex,
  totalQuestions,
  score,
  selectedOptionId,
  showAnswer,
  isCorrect,
  onOptionClick,
  onNextQuestion,
}: QuestionCardProps) {
  const { speak, stop, isSpeaking } = useSpeakerStore();
  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <Card
      className={`w-full mx-auto transition-all duration-200 ${
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
            <span className="text-lg">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-lg font-semibold">Score: {score}</span>
          </div>
        </CardTitle>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-6">
          <div className="flex-1 space-y-2">
            {question.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {question.description}
              </p>
            )}
            <p className="font-semibold text-lg leading-relaxed">
              {question.question.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </div>
          <button
            onClick={() => (isSpeaking ? stop() : speak(question.question))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label={isSpeaking ? "Stop speaking" : "Speak question"}
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Volume2 className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
        <div className="gap-3 grid md:grid-cols-2">
          {question.options.map((option: Option) => (
            <Button
              disabled={!option.isCorrect && showAnswer}
              key={option.id}
              onClick={() => onOptionClick(option)}
              variant={
                !showAnswer
                  ? "outline"
                  : option.id === selectedOptionId || option.isCorrect
                  ? "link"
                  : "outline"
              }
              className={`w-full text-wrap text-black dark:text-white text-left transition-all duration-200 hover:scale-[1.02] ${
                selectedOptionId === option.id && showAnswer
                  ? isCorrect
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-red-500 text-white hover:bg-red-600"
                  : ""
              } ${
                option.isCorrect && showAnswer 
                  ? "bg-green-500 text-white hover:bg-green-600" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {option.text}
            </Button>
          ))}
        </div>
        {showAnswer && question.explanation && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Explanation: </span>
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {showAnswer && (
          <InteractiveHoverButton 
            onClick={onNextQuestion}
            className="min-w-[100px]"
          >
            {questionIndex < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}
          </InteractiveHoverButton>
        )}
      </CardFooter>
    </Card>
  );
}