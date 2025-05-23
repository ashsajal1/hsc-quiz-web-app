import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shuffle, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WordPuzzleProps {
  words?: string[];
}

const defaultWords = [
  "REACT",
  "TYPESCRIPT",
  "JAVASCRIPT",
  "HTML",
  "CSS",
  "NODE",
  "PYTHON",
  "JAVA",
];

export default function WordPuzzleGame({ words = defaultWords }: WordPuzzleProps) {
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [solvedWords, setSolvedWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const scrambleWord = (word: string) => {
    return word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const initializeGame = () => {
    const scrambled = words.map(scrambleWord);
    setScrambledWords(scrambled);
    setSelectedLetters([]);
    setSolvedWords([]);
    setCurrentWord("");
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleLetterClick = (letter: string, wordIndex: number) => {
    if (solvedWords.includes(words[wordIndex])) return;

    setSelectedLetters([...selectedLetters, letter]);
    setCurrentWord(currentWord + letter);

    // Check if the current word is complete
    if (currentWord.length + 1 === words[wordIndex].length) {
      const newWord = currentWord + letter;
      if (newWord === words[wordIndex]) {
        setSolvedWords([...solvedWords, words[wordIndex]]);
        setScore(score + 1);
        setCurrentWord("");
        setSelectedLetters([]);
      }
    }

    // Check if all words are solved
    if (solvedWords.length + 1 === words.length) {
      setGameOver(true);
    }
  };

  const resetCurrentWord = () => {
    setCurrentWord("");
    setSelectedLetters([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Word Puzzle</h2>
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
          <p className="text-lg font-semibold">Current Word:</p>
          <p className="text-2xl font-bold tracking-wider">{currentWord}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Score: {score}/{words.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scrambledWords.map((word, wordIndex) => (
          <Card
            key={wordIndex}
            className={`p-4 ${
              solvedWords.includes(words[wordIndex])
                ? "bg-green-50 dark:bg-green-900/20"
                : ""
            }`}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {word.split("").map((letter, letterIndex) => (
                <motion.button
                  key={letterIndex}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLetterClick(letter, wordIndex)}
                  disabled={solvedWords.includes(words[wordIndex])}
                  className={`w-10 h-10 rounded-lg font-bold text-lg
                    ${
                      solvedWords.includes(words[wordIndex])
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
            {solvedWords.includes(words[wordIndex]) && (
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
                You solved all the words with a score of {score}/{words.length}
              </p>
              <Button onClick={initializeGame}>Play Again</Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
