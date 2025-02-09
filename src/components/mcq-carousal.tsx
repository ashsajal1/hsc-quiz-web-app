import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useQuizStore } from "@/store/useQuizStore";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TextAnimate } from "./magicui/text-animate";
import { SparklesText } from "./magicui/sparkles-text";

export function McqCarousel() {
  const { questions } = useQuizStore();
  const randomQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        const optionTexts = q.options.map((o) => o.text);

        return (
          !["i", "ii", "iii"].some((val) => q.question.includes(val)) && // Exclude if question contains "i", "ii", "iii"
          !q.question.includes("উদ্দীপক") && // Exclude if question contains "উদ্দীপক"
          !q.description && // Ensure description not exists (null or empty)
          !optionTexts.includes("সবগুলো") && // Exclude if an option is "সবগুলো"
          !optionTexts.includes("সঠিক উত্তর") // Exclude if an option is "সঠিক উত্তর"
        );
      })
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
      className="w-full h-[200px] select-none"
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
                      <TextAnimate animation="slideLeft" by="word">
                        {question.question}
                      </TextAnimate>
                    </span>
                    <span className="text-green-600 font-bold text-center text-3xl">
                      <SparklesText
                        sparklesCount={5}
                        className="text-3xl font-black text-center mt-4"
                        text={
                          question.options.find((o) => o.isCorrect)?.text || ""
                        }
                        colors={{ first: "#0de560", second: "#92e50d" }}
                      ></SparklesText>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
