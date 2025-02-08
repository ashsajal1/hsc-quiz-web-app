import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useQuizStore } from "@/store/useQuizStore";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function McqCarousel() {
  const { questions } = useQuizStore();
  const randomQuestions = useMemo(() => {
    return questions
      .filter((q) => !q.question.includes("i"))
      .sort(() => Math.random() - 0.5);
  }, [questions]);

  const getRandomTen = useCallback(() => {
    // Make a shallow copy and randomize the order
    const randomSorted = [...randomQuestions].sort(() => Math.random() - 0.5);
    return randomSorted.slice(0, 10);
  }, [randomQuestions]);

  const [displayedQuestions, setDisplayedQuestions] = useState(getRandomTen());
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedQuestions(getRandomTen());
    }, 10000); // 10,000 milliseconds = 10 seconds

    return () => clearInterval(interval);
  }, [questions, getRandomTen]);

  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full h-[200px]"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {displayedQuestions.map((question, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex h-[180px] items-center justify-center ">
                  <div className="flex flex-col items-center">
                    <span className="text-xl text-center font-semibold">
                      {question.question}
                    </span>
                    <span className="text-green-600 font-bold text-center text-3xl">
                      {question.options.find((o) => o.isCorrect)?.text}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
