import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shuffle, RotateCcw, CheckCircle2, HelpCircle, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formula } from "@/lib/formula";
import 'katex/dist/katex.min.css';
import katex from 'katex';

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
  const [showAnswer, setShowAnswer] = useState<string | null>(null);
  const [answerCooldown, setAnswerCooldown] = useState<number>(0);

  useEffect(() => {
    // Filter formulas by chapter if provided
    const filteredFormulas = chapter 
      ? formula.filter(f => f.chapter === chapter)
      : formula;
    setFormulas(filteredFormulas);
  }, [chapter]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (answerCooldown > 0) {
      timer = setInterval(() => {
        setAnswerCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [answerCooldown]);

  const scrambleWord = (word: string) => {
    // Split the formula into parts (variables, operators, etc.)
    const parts = word.match(/([a-zA-Z0-9]+|[^a-zA-Z0-9]+)/g) || [];
    return parts.sort(() => Math.random() - 0.5).join("");
  };

  const initializeGame = () => {
    const scrambled = formulas.map(f => scrambleWord(f.formula));
    setScrambledFormulas(scrambled);
    setSelectedLetters([]);
    setSolvedFormulas([]);
    setCurrentWord("");
    setScore(0);
    setGameOver(false);
    setShowHint(null);
    setShowAnswer(null);
    setAnswerCooldown(0);
  };

  useEffect(() => {
    initializeGame();
  }, [formulas]);

  const handleLetterClick = (letter: string, formulaIndex: number) => {
    if (solvedFormulas.includes(formulas[formulaIndex].formula)) return;

    setSelectedLetters([...selectedLetters, letter]);
    setCurrentWord(currentWord + letter);

    // Check if the current word is complete
    if (currentWord.length + 1 === formulas[formulaIndex].formula.length) {
      const newWord = currentWord + letter;
      if (newWord === formulas[formulaIndex].formula) {
        setSolvedFormulas([...solvedFormulas, formulas[formulaIndex].formula]);
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
    setShowHint(showHint === formulas[formulaIndex].formula ? null : formulas[formulaIndex].formula);
  };

  const toggleAnswer = (formulaIndex: number) => {
    if (answerCooldown > 0) return;
    setShowAnswer(showAnswer === formulas[formulaIndex].formula ? null : formulas[formulaIndex].formula);
    setAnswerCooldown(30); // 30 seconds cooldown
  };

  const renderFormula = (formula: string) => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: true
      });
    } catch (error) {
      return formula;
    }
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
          <div 
            className="text-2xl font-bold tracking-wider"
            dangerouslySetInnerHTML={{ __html: renderFormula(currentWord) }}
          />
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
              solvedFormulas.includes(formulas[formulaIndex].formula)
                ? "bg-green-50 dark:bg-green-900/20"
                : ""
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm font-medium">
                {formulas[formulaIndex].name}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleHint(formulaIndex)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <HelpCircle className="h-4 w-4 text-gray-500" />
                </button>
                <button
                  onClick={() => toggleAnswer(formulaIndex)}
                  disabled={answerCooldown > 0}
                  className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full ${
                    answerCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {showHint === formulas[formulaIndex].formula && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-gray-700 dark:text-gray-300">
                {formulas[formulaIndex].description}
              </div>
            )}

            {showAnswer === formulas[formulaIndex].formula && (
              <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <div 
                  className="text-sm font-mono"
                  dangerouslySetInnerHTML={{ __html: renderFormula(formulas[formulaIndex].formula) }}
                />
                {answerCooldown > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Answer will be hidden in {answerCooldown}s
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center">
              {word.split("").map((letter, letterIndex) => (
                <motion.button
                  key={letterIndex}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLetterClick(letter, formulaIndex)}
                  disabled={solvedFormulas.includes(formulas[formulaIndex].formula)}
                  className={`w-10 h-10 rounded-lg font-bold text-lg
                    ${
                      solvedFormulas.includes(formulas[formulaIndex].formula)
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
            {solvedFormulas.includes(formulas[formulaIndex].formula) && (
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