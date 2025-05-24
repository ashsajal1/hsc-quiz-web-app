import { AnimatePresence, motion } from "framer-motion";
import Search from "../custom-ui/search";
import Text from "../custom-ui/text";
import { HiOutlineXMark } from "react-icons/hi2";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ModeToggle } from "../mode-toggle";
import { Button } from "../ui/button";
import { Home, BookOpen, Lightbulb, User, LogIn, UserPlus, Gamepad2 } from "lucide-react";
import { useQuizStore } from "@/store/useQuizStore";
import { useCQStore } from "@/store/useCqStore";
import { useState, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";

interface SearchResult {
  type: "quiz" | "practice";
  id: number;
  title: string;
  path: string;
}

export default function SideNav({
  isOpen,
  handleClose,
}: {
  isOpen: boolean;
  handleClose: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions } = useQuizStore();
  const { filteredQuestions } = useCQStore();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

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
    handleClose();
    setSearchResults([]);
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/quiz", label: "Quiz", icon: BookOpen },
    { path: "/practice", label: "Practice", icon: Lightbulb },
    { path: "/word-game", label: "Word Game", icon: Gamepad2 },
    { path: "/about", label: "About", icon: User },
  ];

  const authItems = [
    { path: "/login", label: "Login", icon: LogIn },
    { path: "/signup", label: "Signup", icon: UserPlus },
  ];

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 select-none md:hidden bg-black z-10"
            onClick={handleClose}
          />
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 200,
            }}
            className="fixed inset-y-0 left-0 z-20 w-[280px] bg-background border-r dark:border-gray-800 overflow-y-auto md:hidden"
          >
            <div className="flex items-center justify-between h-[80px] border-b dark:border-b-gray-800 px-4">
              <Text className="text-xl font-bold" label="Logo" />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="hover:bg-muted"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 relative">
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

            <div className="px-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link key={item.path} to={item.path} onClick={handleClose}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-2 ${
                        isActive ? "bg-muted" : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <div className="px-4 mt-4 space-y-1">
              {authItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link key={item.path} to={item.path} onClick={handleClose}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-2 ${
                        isActive ? "bg-muted" : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-t-gray-800">
              <ModeToggle />
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
