import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shuffle, RotateCcw, CheckCircle2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formula } from "@/lib/formula";

interface FormulaPuzzleProps {
  chapter?: string;
}

export default function FormulaPuzzle({ chapter }: FormulaPuzzleProps) {
  const [formulas, setFormulas] = useState(formula);
  const [scrambledFormulas, setScrambledFormulas] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [solvedFormulas, setSolvedFormulas] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState<string | null>(null);

  useEffect(() => {
    // Filter formulas by chapter if provided
    const filteredFormulas = chapter 
      ? formula.filter(f => f.chapter === chapter)
      : formula;
    setFormulas(filteredFormulas);
  }, [chapter]);

  const scrambleWord = (word: string) => {
    return word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const initializeGame = () => {
    const scrambled = formulas.map(f => scrambleWord(f.name));
    setScrambledFormulas(scrambled);
    setSelectedLetters([]);
    setSolvedFormulas([]);
    setCurrentWord("");
    setScore(0);
    setGameOver(false);
    setShowHint(null);
  };

  useEffect(() => {
    initializeGame();
  }, [formulas]);

  const handleLetterClick = (letter: string, formulaIndex: number) => {
    if (solvedFormulas.includes(formulas[formulaIndex].name)) return;

    setSelectedLetters([...selectedLetters, letter]);
    setCurrentWord(currentWord + letter);

    // Check if the current word is complete
    if (currentWord.length + 1 === formulas[formulaIndex].name.length) {
      const newWord = currentWord + letter;
      if (newWord === formulas[formulaIndex].name) {
        setSolvedFormulas([...solvedFormulas, formulas[formulaIndex].name]);
        setScore(score + 1);
        setCurrentWord("");
        setSelectedLetters([]);
      }
    }

    // Check if all formulas are solved
    if (solvedFormulas.length + 1 === formulas.length) {
      setGameOver(true);
    }
  };

  const resetCurrentWord = () => {
    setCurrentWord("");
    setSelectedLetters([]);
  };

  const toggleHint = (formulaIndex: number) => {
    setShowHint(showHint === formulas[formulaIndex].name ? null : formulas[formulaIndex].name);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Physics Formula Puzzle</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={initializeGame}
            className="gap-2"
          >
            <Shuffle className="h-4 w-4" />
            New Game
          </Button>
          <Button
            variant="outline"
            onClick={resetCurrentWord}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-center mb-4">
          <p className="text-lg font-semibold">Current Formula:</p>
          <p className="text-2xl font-bold tracking-wider">{currentWord}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Score: {score}/{formulas.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scrambledFormulas.map((word, formulaIndex) => (
          <Card
            key={formulaIndex}
            className={`p-4 ${
              solvedFormulas.includes(formulas[formulaIndex].name)
                ? "bg-green-50 dark:bg-green-900/20"
                : ""
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formulas[formulaIndex].formula}
              </div>
              <button
                onClick={() => toggleHint(formulaIndex)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <HelpCircle className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            {showHint === formulas[formulaIndex].name && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-gray-700 dark:text-gray-300">
                {formulas[formulaIndex].description}
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center">
              {word.split("").map((letter, letterIndex) => (
                <motion.button
                  key={letterIndex}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLetterClick(letter, formulaIndex)}
                  disabled={solvedFormulas.includes(formulas[formulaIndex].name)}
                  className={`w-10 h-10 rounded-lg font-bold text-lg
                    ${
                      solvedFormulas.includes(formulas[formulaIndex].name)
                        ? "bg-green-500 text-white"
                        : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                    }
                    transition-colors duration-200
                  `}
                >
                  {letter}
                </motion.button>
              ))}
            </div>
            {solvedFormulas.includes(formulas[formulaIndex].name) && (
              <div className="flex justify-center mt-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            )}
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
          >
            <Card className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Congratulations! 🎉</h3>
              <p className="text-lg mb-6">
                You solved all the formulas with a score of {score}/{formulas.length}
              </p>
              <Button onClick={initializeGame}>Play Again</Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 