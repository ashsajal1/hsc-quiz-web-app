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
import { CheckCheck, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Preview() {
  const { questions } = useQuizStore();
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");

  // Get unique subjects and chapters
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(questions.map((q) => q.subject).filter(Boolean));
    return Array.from(uniqueSubjects).map(subject => {
      if (!subject) return { value: '', label: '' };
      
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
  }, [questions]);

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
  }, [selectedSubject, questions]);

  // Reset chapter selection when subject changes
  useEffect(() => {
    setSelectedChapter("all");
  }, [selectedSubject]);

  // Filter questions based on selected subject and chapter
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSubject = selectedSubject === "all" || q.subject === selectedSubject;
      const matchesChapter = selectedChapter === "all" || q.chapter === selectedChapter;
      return matchesSubject && matchesChapter && !q.question.includes("i");
    });
  }, [questions, selectedSubject, selectedChapter]);

  // Helper function to get a random selection of 10 questions.
  const getRandomTen = useCallback(() => {
    const randomSorted = [...filteredQuestions].sort(() => Math.random() - 0.5);
    return randomSorted.slice(0, 10);
  }, [filteredQuestions]);

  // Initialize state with 10 random questions.
  const [displayedQuestions, setDisplayedQuestions] = useState(getRandomTen());
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set an interval to update the random 10 questions every 10 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedQuestions(getRandomTen());
      setTimeUntilRefresh(10);
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    }, 10000);

    return () => clearInterval(interval);
  }, [filteredQuestions, getRandomTen]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilRefresh((prev) => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setDisplayedQuestions(getRandomTen());
    setTimeUntilRefresh(10);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-4xl gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold">Question Preview</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Random questions from your selected topics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Badge variant="secondary" className="text-sm">
            {displayedQuestions.length} Questions
          </Badge>
          <Button
            variant={showAnswer ? "destructive" : "outline"}
            onClick={() => setShowAnswer((prev) => !prev)}
            className="gap-2 flex-1 sm:flex-none"
          >
            {showAnswer ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline">Hide Answers</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Show Answers</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleManualRefresh}
            className={`${isRefreshing ? "animate-spin" : ""} flex-1 sm:flex-none`}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
            <SelectTrigger className="w-full sm:w-[200px]" disabled={selectedSubject === "all"}>
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

        <div className="flex items-center gap-2">
          <Progress value={(timeUntilRefresh / 10) * 100} className="h-1 flex-1" />
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            Refreshing in {timeUntilRefresh}s
          </span>
        </div>
      </div>

      <div className="relative flex h-[500px] w-full max-w-4xl flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={isRefreshing ? "refreshing" : "stable"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Marquee pauseOnHover className="[--duration:100s]">
              {displayedQuestions
                .slice(0, Math.floor(displayedQuestions.length / 2))
                .map((question) => (
                  <Card
                    className="w-[400px] mx-2 hover:shadow-lg transition-shadow"
                    key={question.id}
                  >
                    <CardContent>
                      <CardHeader>
                        <CardTitle className="text-lg">{question.question}</CardTitle>
                      </CardHeader>
                      <CardFooter>
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option) => (
                            <Button
                              key={option.id}
                              className={`mr-1 transition-colors ${
                                showAnswer && option.isCorrect
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : ""
                              }`}
                              size="sm"
                              variant="outline"
                            >
                              {option.isCorrect && showAnswer && (
                                <CheckCheck
                                  className="h-4 w-4 mr-2"
                                  strokeWidth={"1"}
                                />
                              )}
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      </CardFooter>
                    </CardContent>
                  </Card>
                ))}
            </Marquee>

            <Marquee reverse pauseOnHover className="[--duration:100s]">
              {displayedQuestions
                .slice(Math.floor(displayedQuestions.length / 2))
                .map((question) => (
                  <Card
                    className="w-[400px] mx-2 hover:shadow-lg transition-shadow"
                    key={question.id}
                  >
                    <CardContent>
                      <CardHeader>
                        <CardTitle className="text-lg">{question.question}</CardTitle>
                      </CardHeader>
                      <CardFooter>
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option) => (
                            <Button
                              key={option.id}
                              className={`mr-1 transition-colors ${
                                showAnswer && option.isCorrect
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : ""
                              }`}
                              size="sm"
                              variant="outline"
                            >
                              {option.isCorrect && showAnswer && (
                                <CheckCheck
                                  className="h-4 w-4 mr-2"
                                  strokeWidth={"1"}
                                />
                              )}
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      </CardFooter>
                    </CardContent>
                  </Card>
                ))}
            </Marquee>
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background"></div>
      </div>
    </motion.div>
  );
}
