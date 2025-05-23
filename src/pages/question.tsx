import questionsData from "@/data/cq.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Question {
  id: string;
  question: string;
  answer: string;
  type: "cognitive" | "perceptual";
  subject?: string;
  chapter?: string;
}

const questions = questionsData as Question[];

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
    return Array.from(uniqueSubjects) as string[];
  }, []);

  const chapters = useMemo(() => {
    const uniqueChapters = new Set(questions.map((q) => q.chapter).filter(Boolean));
    return Array.from(uniqueChapters) as string[];
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
          <Accordion type="single" collapsible className="w-full">
            {filteredQuestions
              .filter((q) => q.type === "cognitive")
              .map((q) => (
                <AccordionItem
                  key={q.id}
                  value={q.id}
                  className="border-b border-gray-200 dark:border-gray-800"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-left font-medium">{q.question}</span>
                      {q.subject && (
                        <Badge variant="outline" className="ml-2">
                          {q.subject}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-muted-foreground">{q.answer}</p>
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
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="অনুধাবনমূলক">
          <Accordion type="single" collapsible className="w-full">
            {filteredQuestions
              .filter((q) => q.type === "perceptual")
              .map((q) => (
                <AccordionItem
                  key={q.id}
                  value={q.id}
                  className="border-b border-gray-200 dark:border-gray-800"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-left font-medium">{q.question}</span>
                      {q.subject && (
                        <Badge variant="outline" className="ml-2">
                          {q.subject}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-muted-foreground">{q.answer}</p>
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
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
