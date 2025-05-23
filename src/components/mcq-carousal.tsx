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
import { useSpeakerStore } from "@/store/useSpeakerStore";
import { motion, AnimatePresence } from "framer-motion";
import { VolumeX, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  options: Option[];
}

export function McqCarousel() {
  const { questions } = useQuizStore();
  const randomQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        const optionTexts = q.options.map((o) => o.text);

        return (
          !["i", "ii", "iii"].some((val) => q.question.includes(val)) &&
          !q.question.includes("উদ্দীপক") &&
          !q.description &&
          !optionTexts.includes("সবগুলো") &&
          !optionTexts.includes("সঠিক উত্তর")
        );
      })
      .sort(() => Math.random() - 0.5);
  }, [questions]);

  const { speak, isSpeaking, stop } = useSpeakerStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const getRandomTen = useCallback(() => {
    const randomSorted = [...randomQuestions].sort(() => Math.random() - 0.5);
    return randomSorted.slice(0, 10);
  }, [randomQuestions]);

  const [displayedQuestions, setDisplayedQuestions] = useState(getRandomTen());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedQuestions(getRandomTen());
    }, 10000);

    return () => clearInterval(interval);
  }, [questions, getRandomTen]);

  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const handleQuestionClick = (question: Question, index: number) => {
    setActiveIndex(index);
    if (!isSpeaking) {
      speak(
        `${question.question}, "উত্তর ", ${
          question.options.find((o) => o.isCorrect)?.text
        }`
      );
    } else {
      stop();
    }
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Carousel
        plugins={[plugin.current]}
        className="w-full h-[320px] select-none"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {displayedQuestions.map((question, index) => (
            <CarouselItem key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-2"
              >
                <Card 
                  className={cn(
                    "transition-all duration-300 hover:shadow-xl cursor-pointer bg-gradient-to-br from-background to-muted/50",
                    activeIndex === index && "ring-2 ring-primary/50 shadow-lg",
                    "border-2"
                  )}
                  onClick={() => handleQuestionClick(question, index)}
                >
                  <CardContent className="flex h-[280px] items-center justify-center p-8">
                    <div className="flex flex-col items-center space-y-8">
                      <div className="relative">
                        <span className="text-2xl text-center font-semibold leading-relaxed">
                          <TextAnimate animation="slideLeft" by="word">
                            {question.question}
                          </TextAnimate>
                        </span>
                        <AnimatePresence>
                          {isSpeaking && activeIndex === index && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="absolute -right-10 -top-2"
                            >
                              <VolumeX className="h-6 w-6 text-primary animate-pulse" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="relative">
                        <span className="text-green-600 font-bold text-center">
                          <SparklesText
                            sparklesCount={5}
                            className="text-4xl font-black text-center"
                            text={question.options.find((o) => o.isCorrect)?.text || ""}
                            colors={{ first: "#0de560", second: "#92e50d" }}
                          />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm",
                          "hover:bg-primary/10 hover:text-primary transition-colors",
                          "border-2 border-muted-foreground/20",
                          activeIndex === index && isSpeaking && "text-primary border-primary/50"
                        )}
                      >
                        {isSpeaking && activeIndex === index ? (
                          <VolumeX className="h-6 w-6" />
                        ) : (
                          <Volume2 className="h-6 w-6" />
                        )}
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Carousel>
    </div>
  );
}
