import { Marquee } from "@/components/magicui/marquee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuizStore } from "@/store/useQuizStore";

export default function Preview() {
  const { questions } = useQuizStore();
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <Marquee pauseOnHover className="[--duration:30000s]">
        {questions.map((question) => (
          <Card>
            <CardContent>
              <CardHeader>
                <CardTitle>{question.question}</CardTitle>
              </CardHeader>
            </CardContent>
          </Card>
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:30000s]">
        {questions.map((question) => (
          <Card>
            <CardContent>
              <CardHeader>
                <CardTitle>{question.question}</CardTitle>
              </CardHeader>
            </CardContent>
          </Card>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
    </div>
  );
}
