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
  return (
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
              {questionIndex + 1} of {totalQuestions}
            </span>
            <span>Score: {score}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <p className="font-semibold">
            {question.description && (
              <>
                <p>{question.description}</p>
                <br />
              </>
            )}
            {question.question.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
          {isSpeaking ? (
            <VolumeX onClick={stop} strokeWidth={1} />
          ) : (
            <Volume2 onClick={() => speak(question.question)} strokeWidth={1} />
          )}
        </div>
        <div className="gap-2 grid md:grid-cols-2">
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
              className={`w-full text-wrap text-black dark:text-white text-left ${
                selectedOptionId === option.id && showAnswer
                  ? isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  : ""
              } ${
                option.isCorrect && showAnswer ? "bg-green-500 text-white" : ""
              }`}
            >
              {option.text}
            </Button>
          ))}
        </div>
        {showAnswer && question.explanation && (
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Explanation:</strong> {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {showAnswer && (
          <InteractiveHoverButton onClick={onNextQuestion}>
            {questionIndex < totalQuestions - 1 ? "Next" : "Finish"}
          </InteractiveHoverButton>
        )}
      </CardFooter>
    </Card>
  );
}
