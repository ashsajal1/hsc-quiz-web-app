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
import { Volume2, VolumeX, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { useSpeakerStore } from "@/store/useSpeakerStore";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        className={cn(
          "w-full mx-auto transition-all duration-300",
          showAnswer && isCorrect && "border-green-500/50 shadow-green-500/20",
          showAnswer && !isCorrect && "border-red-500/50 shadow-red-500/20"
        )}
      >
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">
                Question {questionIndex + 1} of {totalQuestions}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Score: {score} points
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-[100px] h-2" />
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-3">
              {question.description && (
                <p className="text-sm text-muted-foreground italic">
                  {question.description}
                </p>
              )}
              <p className="text-lg font-medium leading-relaxed">
                {question.question.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (isSpeaking ? stop() : speak(question.question))}
              className="h-10 w-10 rounded-full hover:bg-muted"
              aria-label={isSpeaking ? "Stop speaking" : "Speak question"}
            >
              <AnimatePresence mode="wait">
                {isSpeaking ? (
                  <motion.div
                    key="stop"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <VolumeX className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Volume2 className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <AnimatePresence mode="wait">
              {question.options.map((option: Option) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    disabled={showAnswer && !option.isCorrect}
                    onClick={() => onOptionClick(option)}
                    variant="outline"
                    className={cn(
                      "w-full h-auto min-h-[60px] p-4 text-left justify-start gap-3 transition-all duration-200 group",
                      showAnswer && option.isCorrect && "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50",
                      showAnswer && option.id === selectedOptionId && !option.isCorrect && "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50",
                      !showAnswer && "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {showAnswer && option.isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {showAnswer && option.id === selectedOptionId && !option.isCorrect && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {!showAnswer && (
                        <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                      )}
                      <span className="flex-1">{option.text}</span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showAnswer && question.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm">
                    <span className="font-medium">Explanation: </span>
                    {question.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-end pt-4">
          <AnimatePresence mode="wait">
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <InteractiveHoverButton
                  onClick={onNextQuestion}
                  className="min-w-[120px]"
                >
                  {questionIndex < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}
                </InteractiveHoverButton>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}