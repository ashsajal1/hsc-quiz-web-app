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
import { useRef } from "react";

export function McqCarousel() {
  const { filteredQuestions } = useQuizStore();
  const questions = filteredQuestions.filter((q) => !q.question.includes("i"));
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full h-[200px]"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {questions.map((question, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex h-[180px] items-center justify-center ">
                  <div className="flex flex-col items-center">
                    <span className="text-xl text-center font-semibold">
                      {question.question}
                    </span>
                    <span className="text-green-600 font-bold text-3xl">
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
