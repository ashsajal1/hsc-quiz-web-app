import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { CiMenuFries } from "react-icons/ci";
import Text from "../custom-ui/text";
import SideNav from "./side-nav";
import { ModeToggle } from "../mode-toggle";
import { Button } from "../ui/button";
import { useSpeakerStore } from "@/store/useSpeakerStore";
import Search from "../custom-ui/search";
import { useQuizStore } from "@/store/useQuizStore";
import { useCQStore } from "@/store/useCqStore";
import { useDebounce } from "../hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Lightbulb, BookOpenCheck, BookOpenText, BookOpenIcon, ClipboardList, Puzzle, HelpCircle } from "lucide-react";

interface SearchResult {
  type: "quiz" | "practice";
  id: number;
  title: string;
  path: string;
}

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const { questions } = useQuizStore();
  const { filteredQuestions } = useCQStore();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const handleSearch = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setSearchResults([]);
        return;
      }

      const searchTerm = value.toLowerCase();
      const results: SearchResult[] = [];

      // Search in quiz questions
      questions.forEach((question) => {
        if (
          question.question.toLowerCase().includes(searchTerm) ||
          question.options.some((opt) =>
            opt.text.toLowerCase().includes(searchTerm)
          )
        ) {
          results.push({
            type: "quiz",
            id: question.id,
            title: question.question,
            path: `/quiz?questionId=${question.id}&subject=${question.subject}&chapter=${question.chapter}`,
          });
        }
      });

      // Search in practice questions
      filteredQuestions.forEach((question) => {
        if (
          question.question.toLowerCase().includes(searchTerm) ||
          question.answer.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            type: "practice",
            id: question.id,
            title: question.question,
            path: `/practice?questionId=${question.id}&subject=${question.subject}&chapter=${question.chapter}`,
          });
        }
      });

      setSearchResults(results.slice(0, 5)); // Limit to 5 results
    },
    [questions, filteredQuestions]
  );

  const debouncedSearch = useDebounce(handleSearch, 300);

  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchResults([]);
  };

  const { stop } = useSpeakerStore();
  return (
    <>
      <SideNav handleClose={toggleOpen} isOpen={isOpen} />
      <nav
        className={`flex items-center justify-between px-6 lg:px-8 py-4 w-full h-[72px] top-0 bg-white md:dark:border-none border-b dark:bg-black dark:border-b-gray-800 z-10 fixed transition-all duration-200 ${
          scrollY > 150 ? "bg-opacity-90 dark:bg-opacity-90 backdrop-blur-md shadow-sm" : ""
        }`}
        onClick={handleNavClick}
      >
        <div className="flex items-center gap-8">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Text label="HSC Quiz" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/quiz">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 transition-colors h-9 px-3">
                <ClipboardList className="h-4 w-4" />
                Quiz
              </Button>
            </Link>
            <Link to="/practice">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 transition-colors h-9 px-3">
                <BookOpenText className="h-4 w-4" />
                Practice
              </Button>
            </Link>
            <Link to="/word-game">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 transition-colors h-9 px-3">
                <BookOpenCheck className="h-4 w-4" />
                Word Game
              </Button>
            </Link>
            <Link to="/puzzle">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 transition-colors h-9 px-3">
                <Puzzle className="h-4 w-4" />
                Puzzle
              </Button>
            </Link>
            <Link to="/question">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 transition-colors h-9 px-3">
                <HelpCircle className="h-4 w-4" />
                Questions
              </Button>
            </Link>
            <Link to="/saved">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 transition-colors h-9 px-3">
                <BookOpenIcon className="h-4 w-4" />
                Saved
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block relative w-[280px]">
            <Search onSearch={debouncedSearch} />

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-30 overflow-hidden"
                >
                  <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result.path)}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2 group"
                      >
                        {result.type === "quiz" ? (
                          <BookOpen className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                        ) : (
                          <Lightbulb className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                        )}
                        <span className="truncate">{result.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/exam">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors h-9 px-4">
                Exam
              </Button>
            </Link>
            <ModeToggle />
            <CiMenuFries
              onClick={() => {
                toggleOpen();
                stop();
              }}
              className="h-6 w-6 md:hidden dark:text-white text-black hover:opacity-80 transition-opacity cursor-pointer"
            />
          </div>
        </div>
      </nav>
    </>
  );
}
