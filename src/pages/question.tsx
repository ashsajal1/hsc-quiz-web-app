import { AnimatedList } from "@/components/magicui/animated-list";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import questions from "@/data/cq.json";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Volume2, VolumeXIcon } from "lucide-react";
import useSpeaker from "@/hooks/useSpeaker";

export default function QuestionPage() {
  const { speak, isSpeaking, stop } = useSpeaker();
  function handleSpeak(answer: string): void {
    if (isSpeaking) {
      stop();
      return;
    }

    speak(answer);
  }

  return (
    <Tabs defaultValue="জ্ঞানমূলক" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="জ্ঞানমূলক">জ্ঞানমূলক</TabsTrigger>
        <TabsTrigger value="অনুধাবনমূলক">অনুধাবনমূলক</TabsTrigger>
      </TabsList>
      <TabsContent value="জ্ঞানমূলক">
        <div className="p-4">
          <AnimatedList delay={5000}>
            {questions
              .filter((q) => q.type === "cognitive")
              .map((q) => (
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
                  <p className="text-2xl font-bold text-transparent bg-gradient-to-br from-green-400 via-blue-500 to-green-700 bg-clip-text">
                    {q.question}
                  </p>

                  <TextAnimate
                    className="text-lg font-normal"
                    animation="slideLeft"
                    by={"word"}
                    segmentClassName="text-transparent bg-gradient-to-br from-green-300 via-green-500 to-green-700 bg-clip-text"
                  >
                    {q.answer}
                  </TextAnimate>
                </figure>
              ))}
          </AnimatedList>
        </div>
      </TabsContent>
      <TabsContent value="অনুধাবনমূলক">
        <div className="p-4">
          <AnimatedList delay={15000}>
            {questions
              .filter((q) => q.type === "perceptual")
              .map((q) => (
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
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl">{q.question}</span>
                    {isSpeaking ? (
                      <VolumeXIcon onClick={stop} />
                    ) : (
                      <Volume2 onClick={() => handleSpeak(q.answer)} />
                    )}
                  </div>
                  <TypingAnimation className="text-lg font-normal text-transparent bg-gradient-to-br from-green-400 via-blue-500 to-green-700 bg-clip-text">
                    {q.answer}
                  </TypingAnimation>
                </figure>
              ))}
          </AnimatedList>
        </div>
      </TabsContent>
    </Tabs>
  );
}
