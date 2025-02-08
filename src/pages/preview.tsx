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
import { useMemo, useState } from "react";

export default function Preview() {
  const { questions } = useQuizStore();
  const randomQuestions = useMemo(() => {
    return questions
      .filter((q) => !q.question.includes("i"))
      .sort(() => Math.random() - 0.5);
  }, [questions]);

  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex justify-end w-full">
        <Button
          variant={showAnswer ? "destructive" : "outline"}
          onClick={() => setShowAnswer((prevState) => !prevState)}
        >
          Show Answer
        </Button>
      </div>

      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg  bg-background md:shadow-xl">
        <Marquee pauseOnHover className="[--duration:30000s]">
          {randomQuestions.map((question) => (
            <Card>
              <CardContent>
                <CardHeader>
                  <CardTitle>{question.question}</CardTitle>
                </CardHeader>
                <CardFooter>
                  {question.options.map((option) => (
                    <Button className="mr-1" size={"sm"} variant={"outline"}>
                      {option.text}
                    </Button>
                  ))}
                </CardFooter>
              </CardContent>
            </Card>
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:30000s]">
          {randomQuestions.map((question) => (
            <Card>
              <CardContent>
                <CardHeader>
                  <CardTitle>{question.question}</CardTitle>
                </CardHeader>
                <CardFooter>
                  {question.options.map((option) => (
                    <Button className="mr-1" size={"sm"} variant={"outline"}>
                      {option.text}
                    </Button>
                  ))}
                </CardFooter>
              </CardContent>
            </Card>
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
      </div>
    </div>
  );
}
