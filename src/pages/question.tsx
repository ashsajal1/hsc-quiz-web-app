import { AnimatedList } from "@/components/magicui/animated-list";
import questions from "@/data/cq.json";
import { cn } from "@/lib/utils";

export default function QuestionPage() {
  return (
    <div className="p-4">
      <AnimatedList delay={5000}>
        {questions.map((q) => (
          <figure
            className={cn(
              "relative mx-auto min-h-fit w-full cursor-pointer overflow-hidden rounded-2xl p-4 flex flex-col",
              // animation styles
              "transition-all duration-200 ease-in-out hover:scale-[103%]",
              // light styles
              "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
              // dark styles
              "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
            )}
          >
            <span className="font-bold text-xl">{q.question}</span>
            <span className="text-lg">{q.answer}</span>
          </figure>
        ))}
      </AnimatedList>
    </div>
  );
}
