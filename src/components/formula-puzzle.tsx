import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shuffle,
  RotateCcw,
  HelpCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles

} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formula } from "@/lib/formula";
import "katex/dist/katex.min.css";
import katex from "katex";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import confetti from 'canvas-confetti';

interface FormulaPuzzleProps {
  chapter?: string;
}

export default function FormulaPuzzle({
  chapter: initialChapter,
}: FormulaPuzzleProps) {
  const [formulas, setFormulas] = useState(formula);
  const [scrambledFormulas, setScrambledFormulas] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [solvedFormulas, setSolvedFormulas] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState<string | null>(null);
  const [answerCooldown, setAnswerCooldown] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | null;
    message: string;
  }>({ type: null, message: "" });
  const [usedLetters, setUsedLetters] = useState<{
    [key: number]: Set<number>;
  }>({});
  const [currentFormulaIndex, setCurrentFormulaIndex] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<string>(
    initialChapter || "all"
  );
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Get unique chapters and topics
  const chapters = ["all", ...new Set(formula.map((f) => f.chapter))];
  const topics = ["all", ...new Set(formula.map((f) => f.topic))];

  useEffect(() => {
    // Filter formulas by chapter and topic if provided
    const filteredFormulas = formula.filter((f) => {
      const chapterMatch = selectedChapter === "all" || f.chapter === selectedChapter;
      const topicMatch = selectedTopic === "all" || f.topic === selectedTopic;
      return chapterMatch && topicMatch;
    });
    setFormulas(filteredFormulas);
    // Initialize scrambled formulas immediately
    const scrambled = filteredFormulas.map((f) => scrambleWord(f.formula));
    setScrambledFormulas(scrambled);
    // Reset game state when filters change
    setCurrentFormulaIndex(0);
    setScore(0);
    setSolvedFormulas([]);
    setCurrentWord("");
    setSelectedLetters([]);
    setUsedLetters({});
    setShowHint(null);
    setShowAnswer(null);
    setAnswerCooldown(0);
  }, [selectedChapter, selectedTopic]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (answerCooldown > 0) {
      timer = setInterval(() => {
        setAnswerCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [answerCooldown]);

  const scrambleWord = (word: string) => {
    // Remove whitespace and split the formula into parts (variables, operators, etc.)
    const cleanWord = word.replace(/\s+/g, "");
    const parts = cleanWord.match(/([a-zA-Z0-9]+|[^a-zA-Z0-9]+)/g) || [];
    return parts.sort(() => Math.random() - 0.5).join("");
  };

  const initializeGame = () => {
    const scrambled = formulas.map((f) => scrambleWord(f.formula));
    setScrambledFormulas(scrambled);
    setSelectedLetters([]);
    setSolvedFormulas([]);
    setCurrentWord("");
    setScore(0);
    setGameOver(false);
    setShowHint(null);
    setShowAnswer(null);
    setAnswerCooldown(0);
    setUsedLetters({});
    setCurrentFormulaIndex(0);
  };

  useEffect(() => {
    initializeGame();
  }, [formulas]);

  const handleLetterClick = (letter: string, letterIndex: number) => {
    if (solvedFormulas.includes(formulas[currentFormulaIndex].formula)) return;
    if (usedLetters[currentFormulaIndex]?.has(letterIndex)) return;

    const newWord = currentWord + letter;
    setSelectedLetters([...selectedLetters, letter]);
    setCurrentWord(newWord);

    // Mark this letter as used
    setUsedLetters((prev) => ({
      ...prev,
      [currentFormulaIndex]: new Set([
        ...(prev[currentFormulaIndex] || []),
        letterIndex,
      ]),
    }));

    // Check if the current word is complete
    if (
      newWord.length ===
      formulas[currentFormulaIndex].formula.replace(/\s+/g, "").length
    ) {
      if (
        newWord === formulas[currentFormulaIndex].formula.replace(/\s+/g, "")
      ) {
        setSolvedFormulas([
          ...solvedFormulas,
          formulas[currentFormulaIndex].formula,
        ]);
        setScore(score + 1);
        setFeedback({ type: "correct", message: "Correct! 🎉" });
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF69B4', '#00CED1', '#7B68EE', '#FF4500']
        });

        setTimeout(() => {
          setFeedback({ type: null, message: "" });
          setCurrentWord("");
          setSelectedLetters([]);
          setUsedLetters((prev) => ({
            ...prev,
            [currentFormulaIndex]: new Set(),
          }));
          // Move to next formula
          if (currentFormulaIndex < formulas.length - 1) {
            setCurrentFormulaIndex(currentFormulaIndex + 1);
          } else {
            setGameOver(true);
          }
        }, 1000);
      } else {
        setFeedback({ type: "incorrect", message: "Try again!" });
        setTimeout(() => {
          setFeedback({ type: null, message: "" });
          setCurrentWord("");
          setSelectedLetters([]);
          setUsedLetters((prev) => ({
            ...prev,
            [currentFormulaIndex]: new Set(),
          }));
        }, 1000);
      }
    }
  };

  const toggleHint = () => {
    setShowHint(
      showHint === formulas[currentFormulaIndex].formula
        ? null
        : formulas[currentFormulaIndex].formula
    );
  };

  const toggleAnswer = () => {
    if (answerCooldown > 0) return;
    setShowAnswer(
      showAnswer === formulas[currentFormulaIndex].formula
        ? null
        : formulas[currentFormulaIndex].formula
    );
    setAnswerCooldown(30); // 30 seconds cooldown
  };

  const handleAutoComplete = async () => {
    if (solvedFormulas.includes(formulas[currentFormulaIndex].formula)) return;
    
    const correctFormula = formulas[currentFormulaIndex].formula.replace(/\s+/g, "");
    
    // Simulate typing animation
    for (let i = 0; i < correctFormula.length; i++) {
      setCurrentWord(correctFormula.slice(0, i + 1));
      setSelectedLetters(correctFormula.slice(0, i + 1).split(""));
      
      // Add random delay between 50ms and 150ms for each character
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }
    
    // Mark all letters as used
    setUsedLetters((prev) => ({
      ...prev,
      [currentFormulaIndex]: new Set(Array.from({ length: correctFormula.length }, (_, i) => i)),
    }));

    // Add to solved formulas and update score
    setSolvedFormulas([...solvedFormulas, formulas[currentFormulaIndex].formula]);
    setScore(score + 1);
    setFeedback({ type: "correct", message: "Auto-completed! 🎉" });

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF69B4', '#00CED1', '#7B68EE', '#FF4500']
    });

    // Add a small delay before moving to next formula
    await new Promise(resolve => setTimeout(resolve, 1000));

    setFeedback({ type: null, message: "" });
    setCurrentWord("");
    setSelectedLetters([]);
    setUsedLetters((prev) => ({
      ...prev,
      [currentFormulaIndex]: new Set(),
    }));
    // Move to next formula
    if (currentFormulaIndex < formulas.length - 1) {
      setCurrentFormulaIndex(currentFormulaIndex + 1);
    } else {
      setGameOver(true);
    }
  };

  const renderFormula = (formula: string) => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (error) {
      return formula;
    }
  };

  const handlePreviousFormula = () => {
    if (currentFormulaIndex > 0) {
      setCurrentFormulaIndex((prev) => prev - 1);
      setCurrentWord("");
      setSelectedLetters([]);
      setUsedLetters((prev) => ({
        ...prev,
        [currentFormulaIndex - 1]: new Set(),
      }));
      setShowHint(null);
      setShowAnswer(null);
    }
  };

  const handleNextFormula = () => {
    if (currentFormulaIndex < formulas.length - 1) {
      setCurrentFormulaIndex((prev) => prev + 1);
      setCurrentWord("");
      setSelectedLetters([]);
      setUsedLetters((prev) => ({
        ...prev,
        [currentFormulaIndex + 1]: new Set(),
      }));
      setShowHint(null);
      setShowAnswer(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <h2 className="text-2xl font-bold">Physics Formula Puzzle</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic === "all" ? "All Topics" : topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Chapter" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter} value={chapter}>
                    {chapter === "all" ? "All Chapters" : `Chapter ${chapter}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={initializeGame}
            className="gap-2 flex-1 sm:flex-none"
          >
            <Shuffle className="h-4 w-4" />
            New Game
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCurrentWord("");
              setSelectedLetters([]);
              setUsedLetters((prev) => ({
                ...prev,
                [currentFormulaIndex]: new Set(),
              }));
            }}
            className="gap-2 flex-1 sm:flex-none"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-6 mb-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold mb-2">Current Formula:</p>
          <div
            className="text-2xl sm:text-3xl font-bold tracking-wider min-h-[3rem] flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: renderFormula(currentWord) }}
          />
          {feedback.type && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mt-2 text-sm font-medium ${
                feedback.type === "correct"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </div>
        <div className="flex justify-center gap-6 text-lg font-semibold">
          <p>
            Progress: {currentFormulaIndex + 1}/{formulas.length}
          </p>
          <p>
            Score: {score}/{formulas.length}
          </p>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 bg-white dark:bg-gray-900 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {formulas[currentFormulaIndex]?.name}
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleHint}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={toggleAnswer}
              disabled={answerCooldown > 0}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ${
                answerCooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Eye className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={handleAutoComplete}
              disabled={solvedFormulas.includes(formulas[currentFormulaIndex]?.formula)}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ${
                solvedFormulas.includes(formulas[currentFormulaIndex]?.formula) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Sparkles className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {showHint === formulas[currentFormulaIndex]?.formula && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300"
          >
            {formulas[currentFormulaIndex]?.description}
          </motion.div>
        )}

        {showAnswer === formulas[currentFormulaIndex]?.formula && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
          >
            <div
              className="text-sm font-mono"
              dangerouslySetInnerHTML={{
                __html: renderFormula(
                  formulas[currentFormulaIndex]?.formula || ""
                ),
              }}
            />
            {answerCooldown > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Answer will be hidden in {answerCooldown}s
              </p>
            )}
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {scrambledFormulas[currentFormulaIndex]
            ?.split("")
            .map((letter, letterIndex) => (
              <motion.button
                key={letterIndex}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLetterClick(letter, letterIndex)}
                disabled={usedLetters[currentFormulaIndex]?.has(letterIndex)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-bold text-lg
                ${
                  usedLetters[currentFormulaIndex]?.has(letterIndex)
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                }
                transition-all duration-200 shadow-sm
              `}
              >
                {letter}
              </motion.button>
            ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={handlePreviousFormula}
            disabled={currentFormulaIndex === 0}
            className="gap-2 w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] mx-auto">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
            <div
              ref={(el) => {
                if (el) {
                  const selectedButton = el.children[
                    currentFormulaIndex
                  ] as HTMLElement;
                  if (selectedButton) {
                    const containerRect = el.getBoundingClientRect();
                    const buttonRect = selectedButton.getBoundingClientRect();

                    // Check if button is outside visible area
                    if (
                      buttonRect.left < containerRect.left ||
                      buttonRect.right > containerRect.right
                    ) {
                      selectedButton.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                      });
                    }
                  }
                }
              }}
              className="flex gap-2 overflow-x-auto py-2 px-4 h-12 items-center scrollbar-hide scroll-smooth whitespace-nowrap"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                overflowX: "auto",
                overflowY: "hidden",
              }}
              onWheel={(e) => {
                e.preventDefault();
                const container = e.currentTarget;
                container.scrollLeft += e.deltaY;
              }}
            >
              {formulas.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFormulaIndex(index);
                    setCurrentWord("");
                    setSelectedLetters([]);
                    setUsedLetters((prev) => ({
                      ...prev,
                      [index]: new Set(),
                    }));
                    setShowHint(null);
                    setShowAnswer(null);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0
                    ${
                      index === currentFormulaIndex
                        ? "bg-blue-500 text-white ring-2 ring-blue-300 dark:ring-blue-700"
                        : solvedFormulas.includes(formulas[index]?.formula)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }
                    transition-all duration-200 hover:scale-110
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleNextFormula}
            disabled={currentFormulaIndex === formulas.length - 1}
            className="gap-2 w-full sm:w-auto"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          >
            <Card className="p-6 sm:p-8 text-center max-w-sm w-full">
              <h3 className="text-2xl font-bold mb-4">Congratulations! 🎉</h3>
              <p className="text-lg mb-6">
                You solved all the formulas with a score of {score}/
                {formulas.length}
              </p>
              <Button onClick={initializeGame} className="w-full sm:w-auto">
                Play Again
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
