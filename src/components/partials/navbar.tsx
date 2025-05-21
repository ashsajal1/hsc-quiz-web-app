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
import { BookOpen, Lightbulb } from "lucide-react";

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
        className={`flex items-center justify-between p-2 w-full h-[80px] top-0 bg-white md:dark:border-none border-b dark:bg-black dark:border-b-gray-800 z-10 fixed ${
          scrollY > 150 ? "bg-opacity-60 dark:bg-opacity-60 backdrop-blur" : ""
        }`}
        onClick={handleNavClick}
      >
        <Link to="/">
          <Text label="HSC Quiz" className="text-xl font-bold" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden md:block relative">
            <Search onSearch={debouncedSearch} />

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-30"
                >
                  <div className="p-2 space-y-1">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result.path)}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        {result.type === "quiz" ? (
                          <BookOpen className="h-4 w-4 text-primary" />
                        ) : (
                          <Lightbulb className="h-4 w-4 text-primary" />
                        )}
                        <span className="truncate">{result.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to={"/saved"}>
            <Button variant={"link"}>Saved</Button>
          </Link>
          <Link to={"/exam"}>
            <Button>Exam</Button>
          </Link>
          <ModeToggle />

          <CiMenuFries
            onClick={() => {
              toggleOpen();
              stop();
            }}
            className="h-6 w-6 md:hidden dark:text-white text-black"
          />

          {/* <div className="hidden md:flex items-center gap-2">
            <Search />
            <Link to='/login'><Button>Login</Button></Link>
          </div> */}
        </div>
      </nav>
    </>
  );
}
