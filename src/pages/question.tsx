import questionsData from "@/data/cq.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, VolumeXIcon, Search, Bookmark, BookmarkCheck, Play, StopCircle } from "lucide-react";
import { useSpeakerStore } from "@/store/useSpeakerStore";
import { useState, useMemo, useEffect, useCallback } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isReadingAll, setIsReadingAll] = useState(false);
  const [currentReadingIndex, setCurrentReadingIndex] = useState(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>(() => {
    const saved = localStorage.getItem("bookmarkedQuestions");
    return saved ? JSON.parse(saved) : [];
  });

  // Get unique subjects and chapters
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(questions.map((q) => q.subject).filter(Boolean));
    return Array.from(uniqueSubjects).map(subject => {
      if (!subject) return { value: '', label: '' };
      
      // Convert "biology-1" to "Biology 1st"
      const [name, number] = subject.split('-');
      if (!name || !number) return { value: subject, label: subject };
      
      const ordinal = {
        '1': '1st',
        '2': '2nd',
        '3': '3rd',
        '4': '4th',
        '5': '5th',
        '6': '6th',
        '7': '7th',
        '8': '8th',
        '9': '9th',
        '10': '10th',
        '11': '11th',
        '12': '12th'
      }[number] || number;
      
      return {
        value: subject,
        label: `${name.charAt(0).toUpperCase() + name.slice(1)} ${ordinal}`
      };
    }).filter(subject => subject.value !== '');
  }, []);

  const chapters = useMemo(() => {
    if (selectedSubject === "all") {
      return [];
    }
    const uniqueChapters = new Set(
      questions
        .filter((q) => q.subject === selectedSubject)
        .map((q) => q.chapter)
        .filter(Boolean)
    );
    return Array.from(uniqueChapters).sort() as string[];
  }, [selectedSubject]);

  // Reset chapter selection when subject changes
  useEffect(() => {
    setSelectedChapter("all");
  }, [selectedSubject]);

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

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector("input[type='search']") as HTMLInputElement;
        searchInput?.focus();
      }
      // Ctrl/Cmd + B to toggle bookmark
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        const activeQuestion = document.querySelector("[data-state='open']") as HTMLElement;
        if (activeQuestion) {
          const questionId = activeQuestion.getAttribute("data-value");
          if (questionId) toggleBookmark(questionId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleBookmark = useCallback((questionId: string) => {
    setBookmarkedQuestions((prev) => {
      const newBookmarks = prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      localStorage.setItem("bookmarkedQuestions", JSON.stringify(newBookmarks));
      
      // Show toast notification
      toast({
        title: prev.includes(questionId) ? "Bookmark removed" : "Bookmark added",
        description: prev.includes(questionId) 
          ? "Question removed from bookmarks" 
          : "Question added to bookmarks",
      });
      
      return newBookmarks;
    });
  }, [toast]);

  // Function to read all questions and answers
  const readAllQuestions = useCallback(() => {
    if (isReadingAll) {
      stop();
      setIsReadingAll(false);
      setCurrentReadingIndex(0);
      return;
    }

    setIsReadingAll(true);
    setCurrentReadingIndex(0);
    const readNext = () => {
      if (currentReadingIndex >= filteredQuestions.length) {
        setIsReadingAll(false);
        setCurrentReadingIndex(0);
        return;
      }

      const question = filteredQuestions[currentReadingIndex];
      const text = `Question ${currentReadingIndex + 1}: ${question.question}. Answer: ${question.answer}`;
      
      speak(text);
      setCurrentReadingIndex(prev => prev + 1);
    };

    readNext();
  }, [filteredQuestions, currentReadingIndex, isReadingAll, speak, stop]);

  // Effect to handle reading all questions
  useEffect(() => {
    if (isReadingAll && !isSpeaking) {
      const timer = setTimeout(() => {
        readAllQuestions();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isReadingAll, isSpeaking, readAllQuestions]);

  if (isLoading) {
    return (
      <div className="space-y-8 p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <Skeleton className="h-11 flex-1" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-[200px]" />
            <Skeleton className="h-11 w-[200px]" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 max-w-full mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Study Questions</h1>
          <p className="text-muted-foreground text-lg">
            Browse and study questions by category
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm px-4 py-1.5">
            {filteredQuestions.length} Questions
          </Badge>
          <Button
            variant={isReadingAll ? "destructive" : "default"}
            onClick={readAllQuestions}
            className="gap-2"
          >
            {isReadingAll ? (
              <>
                <StopCircle className="h-5 w-5" />
                Stop Reading
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Read All
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <Card className="border-2">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search questions... (Ctrl/Cmd + K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
                aria-label="Search questions"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[200px] h-12">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger className="w-[200px] h-12" disabled={selectedSubject === "all"}>
                  <SelectValue placeholder={selectedSubject === "all" ? "Select subject first" : "Select chapter"} />
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
        </CardContent>
      </Card>

      <Tabs defaultValue="জ্ঞানমূলক" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="জ্ঞানমূলক">জ্ঞানমূলক</TabsTrigger>
          <TabsTrigger value="অনুধাবনমূলক">অনুধাবনমূলক</TabsTrigger>
        </TabsList>
        <TabsContent value="জ্ঞানমূলক" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                {filteredQuestions
                  .filter((q) => q.type === "cognitive")
                  .map((q, index) => (
                    <AccordionItem
                      key={q.id}
                      value={q.id}
                      className="border-2 rounded-lg px-4 data-[state=open]:bg-muted/50 transition-colors"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-10 text-lg">#{index + 1}</span>
                          <span className="text-left font-medium text-lg">{q.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex items-center justify-between py-4">
                          <p className="text-muted-foreground text-lg">{q.answer}</p>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(q.id)}
                              aria-label={bookmarkedQuestions.includes(q.id) ? "Remove bookmark" : "Add bookmark"}
                              title="Toggle bookmark (Ctrl/Cmd + B)"
                              className="h-10 w-10 hover:bg-muted"
                            >
                              {bookmarkedQuestions.includes(q.id) ? (
                                <BookmarkCheck className="h-5 w-5 text-green-500" />
                              ) : (
                                <Bookmark className="h-5 w-5" />
                              )}
                            </Button>
                            {isSpeaking ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => stop()}
                                aria-label="Stop speaking"
                                className="h-10 w-10 hover:bg-muted"
                              >
                                <VolumeXIcon className="h-5 w-5" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSpeak(q.answer)}
                                aria-label="Speak answer"
                                className="h-10 w-10 hover:bg-muted"
                              >
                                <Volume2 className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        <TabsContent value="অনুধাবনমূলক" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                {filteredQuestions
                  .filter((q) => q.type === "perceptual")
                  .map((q, index) => (
                    <AccordionItem
                      key={q.id}
                      value={q.id}
                      className="border-2 rounded-lg px-4 data-[state=open]:bg-muted/50 transition-colors"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-10 text-lg">#{index + 1}</span>
                          <span className="text-left font-medium text-lg">{q.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex items-center justify-between py-4">
                          <p className="text-muted-foreground text-lg">{q.answer}</p>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(q.id)}
                              aria-label={bookmarkedQuestions.includes(q.id) ? "Remove bookmark" : "Add bookmark"}
                              title="Toggle bookmark (Ctrl/Cmd + B)"
                              className="h-10 w-10 hover:bg-muted"
                            >
                              {bookmarkedQuestions.includes(q.id) ? (
                                <BookmarkCheck className="h-5 w-5 text-green-500" />
                              ) : (
                                <Bookmark className="h-5 w-5" />
                              )}
                            </Button>
                            {isSpeaking ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => stop()}
                                aria-label="Stop speaking"
                                className="h-10 w-10 hover:bg-muted"
                              >
                                <VolumeXIcon className="h-5 w-5" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSpeak(q.answer)}
                                aria-label="Speak answer"
                                className="h-10 w-10 hover:bg-muted"
                              >
                                <Volume2 className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
