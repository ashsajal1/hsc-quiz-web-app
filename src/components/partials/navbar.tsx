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

// Reusable NavItem component
const NavItem = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Link to={to} className="h-full flex items-center">
    <Button 
      variant="ghost" 
      className="h-10 px-3 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-primary/5 transition-colors flex items-center gap-2 group"
    >
      <span className="text-foreground/60 group-hover:text-primary transition-colors">
        {icon}
      </span>
      {children}
    </Button>
  </Link>
);

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
        className={`w-full h-[72px] fixed top-0 left-0 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50 transition-all duration-300 ${
          scrollY > 150 ? "shadow-sm" : ""
        }`}
        onClick={handleNavClick}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-8">
              <Link to="/" className="group transition-all duration-200">
                <Text 
                  label="HSC Quiz" 
                  className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity" 
                />
              </Link>

              <div className="hidden md:flex items-center space-x-1 h-full">
                <NavItem to="/quiz" icon={<ClipboardList className="h-4 w-4" />}>
                  Quiz
                </NavItem>
                <NavItem to="/practice" icon={<BookOpenText className="h-4 w-4" />}>
                  Practice
                </NavItem>
                <NavItem to="/word-game" icon={<BookOpenCheck className="h-4 w-4" />}>
                  Word Game
                </NavItem>
                <NavItem to="/puzzle" icon={<Puzzle className="h-4 w-4" />}>
                  Puzzle
                </NavItem>
                <NavItem to="/question" icon={<HelpCircle className="h-4 w-4" />}>
                  Questions
                </NavItem>
                <NavItem to="/saved" icon={<BookOpenIcon className="h-4 w-4" />}>
                  Saved
                </NavItem>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative w-64">
                <Search onSearch={debouncedSearch} />

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

              <div className="flex items-center space-x-4">
                <Link to="/exam">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all h-10 px-5 font-medium"
                  >
                    Start Exam
                  </Button>
                </Link>
                <div className="flex items-center">
                  <ModeToggle />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    toggleOpen();
                    stop();
                  }}
                  className="md:hidden h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <CiMenuFries className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
