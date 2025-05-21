import { AnimatedList } from "@/components/magicui/animated-list";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import questions from "@/data/cq.json";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Volume2, VolumeXIcon, Search, Bookmark, BookmarkCheck } from "lucide-react";
import { useSpeakerStore } from "@/store/useSpeakerStore";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function QuestionPage() {
  const { speak, isSpeaking, stop } = useSpeakerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>(() => {
    const saved = localStorage.getItem("bookmarkedQuestions");
    return saved ? JSON.parse(saved) : [];
  });

  // Get unique subjects and chapters
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(questions.map((q) => q.subject).filter(Boolean));
    return Array.from(uniqueSubjects);
  }, []);

  const chapters = useMemo(() => {
    const uniqueChapters = new Set(questions.map((q) => q.chapter).filter(Boolean));
    return Array.from(uniqueChapters);
  }, []);

  // Filter questions based on search and filters
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = searchQuery
        ? q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesSubject =
        selectedSubject === "all" || q.subject === selectedSubject;

      const matchesChapter =
        selectedChapter === "all" || q.chapter === selectedChapter;

      return matchesSearch && matchesSubject && matchesChapter;
    });
  }, [searchQuery, selectedSubject, selectedChapter]);

  function handleSpeak(answer: string): void {
    if (isSpeaking) {
      stop();
      return;
    }
    speak(answer);
  }

  const toggleBookmark = (questionId: string) => {
    setBookmarkedQuestions((prev) => {
      const newBookmarks = prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      localStorage.setItem("bookmarkedQuestions", JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Questions</h1>
          <p className="text-muted-foreground">
            Browse and study questions by category
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredQuestions.length} Questions
        </Badge>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedChapter} onValueChange={setSelectedChapter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {chapters.map((chapter) => (
                <SelectItem key={chapter} value={chapter}>
                  {chapter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="জ্ঞানমূলক" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="জ্ঞানমূলক">জ্ঞানমূলক</TabsTrigger>
          <TabsTrigger value="অনুধাবনমূলক">অনুধাবনমূলক</TabsTrigger>
        </TabsList>
        <TabsContent value="জ্ঞানমূলক">
          <div className="p-4">
            <AnimatedList delay={5000}>
              {filteredQuestions
                .filter((q) => q.type === "cognitive")
                .map((q) => (
                  <motion.figure
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "relative mx-auto min-h-fit w-full cursor-pointer overflow-hidden rounded-2xl p-4 flex flex-col",
                      "transition-all duration-200 ease-in-out hover:scale-[103%]",
                      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
                      "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-transparent bg-gradient-to-br from-green-400 via-blue-500 to-green-700 bg-clip-text">
                          {q.question}
                        </p>
                        {q.subject && (
                          <Badge variant="outline">{q.subject}</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleBookmark(q.id)}
                      >
                        {bookmarkedQuestions.includes(q.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <TextAnimate
                      className="text-lg font-normal"
                      animation="slideLeft"
                      by={"word"}
                      segmentClassName="text-transparent bg-gradient-to-br from-green-300 via-green-500 to-green-700 bg-clip-text"
                    >
                      {q.answer}
                    </TextAnimate>
                  </motion.figure>
                ))}
            </AnimatedList>
          </div>
        </TabsContent>
        <TabsContent value="অনুধাবনমূলক">
          <div className="p-4">
            <AnimatedList delay={15000}>
              {filteredQuestions
                .filter((q) => q.type === "perceptual")
                .map((q) => (
                  <motion.figure
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "relative mx-auto min-h-fit w-full cursor-pointer overflow-hidden rounded-2xl p-4 flex flex-col",
                      "transition-all duration-200 ease-in-out hover:scale-[103%]",
                      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
                      "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xl">{q.question}</span>
                        {q.subject && (
                          <Badge variant="outline">{q.subject}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(q.id)}
                        >
                          {bookmarkedQuestions.includes(q.id) ? (
                            <BookmarkCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                        {isSpeaking ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => stop()}
                          >
                            <VolumeXIcon className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSpeak(q.answer)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <TypingAnimation className="text-lg font-normal text-transparent bg-gradient-to-br from-green-400 via-blue-500 to-green-700 bg-clip-text">
                      {q.answer}
                    </TypingAnimation>
                  </motion.figure>
                ))}
            </AnimatedList>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
