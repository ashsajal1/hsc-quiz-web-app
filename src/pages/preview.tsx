import { Marquee } from "@/components/magicui/marquee";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuizStore } from "@/store/useQuizStore";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Preview() {
  const { questions } = useQuizStore();

  // Filter out questions with "i" in the text.
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => !q.question.includes("i"));
  }, [questions]);

  // Helper function to get a random selection of 10 questions.
  const getRandomTen = useCallback(() => {
    // Make a shallow copy and randomize the order
    const randomSorted = [...filteredQuestions].sort(() => Math.random() - 0.5);
    return randomSorted.slice(0, 10);
  }, [filteredQuestions]);

  // Initialize state with 10 random questions.
  const [displayedQuestions, setDisplayedQuestions] = useState(getRandomTen());

  // Set an interval to update the random 10 questions every 10 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedQuestions(getRandomTen());
    }, 10000); // 10,000 milliseconds = 10 seconds

    return () => clearInterval(interval);
  }, [filteredQuestions, getRandomTen]);

  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Button to toggle the "Show Answer" state */}
      <div className="flex justify-end w-full">
        <Button
          variant={showAnswer ? "destructive" : "outline"}
          onClick={() => setShowAnswer((prev) => !prev)}
        >
          Show Answer
        </Button>
      </div>

      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl">
        {/* Marquee with the current set of 10 random questions */}
        <Marquee pauseOnHover className="[--duration:100s]">
          {displayedQuestions
            .slice(0, Math.floor(displayedQuestions.length / 2))
            .map((question) => (
              <Card key={question.id}>
                <CardContent>
                  <CardHeader>
                    <CardTitle>{question.question}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    {question.options.map((option) => (
                      <Button
                        key={option.id}
                        className={`mr-1 ${
                          showAnswer && option.isCorrect ? "bg-green-600" : ""
                        }`}
                        size="sm"
                        variant="outline"
                      >
                        {option.text}
                      </Button>
                    ))}
                  </CardFooter>
                </CardContent>
              </Card>
            ))}
        </Marquee>

        {/* Reverse marquee for extra effect */}
        <Marquee reverse pauseOnHover className="[--duration:100s]">
          {displayedQuestions
            .slice(Math.floor(displayedQuestions.length / 2))
            .map((question) => (
              <Card key={question.id}>
                <CardContent>
                  <CardHeader>
                    <CardTitle>{question.question}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    {question.options.map((option) => (
                      <Button
                        key={option.id}
                        className={`mr-1 ${
                          showAnswer && option.isCorrect ? "bg-green-600" : ""
                        }`}
                        size="sm"
                        variant="outline"
                      >
                        {option.text}
                      </Button>
                    ))}
                  </CardFooter>
                </CardContent>
              </Card>
            ))}
        </Marquee>

        {/* Gradient overlays on the left and right */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
      </div>
    </div>
  );
}
