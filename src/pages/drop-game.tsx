import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { wordList } from "@/lib/words";

interface Shape {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  rotation: number;
  word: string;
  isCorrect: boolean; // True if it's a word from the current category OR a common word
  type: "target" | "common" | "distractor"; // Helps in coloring or specific logic if needed
}

interface GameWord {
  text: string;
  isCorrect: boolean;
  type: "target" | "common" | "distractor";
}

const MAX_CONCURRENT_SHAPES = 10;
const SHAPE_SPAWN_INTERVAL = 2000; // milliseconds
const SHAPE_BASE_SPEED = 1;
const SHAPE_SPEED_VARIATION = 1;

export default function DropGame() {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentWordSetIndex, setCurrentWordSetIndex] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0); // 0 for first category, 1 for second
  const [gameWords, setGameWords] = useState<
    Array<{
      text: string;
      isCorrect: boolean;
      type: "target" | "common" | "distractor";
    }>
  >([]);
  // const [showWordListModal, setShowWordListModal] = useState(true); // Will be replaced by inline selectors

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const timerRef = useRef<NodeJS.Timeout>();
  const shapeSpawnIntervalRef = useRef<NodeJS.Timeout>();

  // Update game words when word set or category changes
  useEffect(() => {
    const selectedSet = wordList[currentWordSetIndex];
    if (!selectedSet) return;

    const targetCategoryWords: GameWord[] = selectedSet.words[
      currentCategoryIndex
    ].map((word) => ({
      text: word,
      isCorrect: true,
      type: "target",
    }));

    const commonWords: GameWord[] = (selectedSet.commonWords || []).map(
      (word) => ({
        text: word,
        isCorrect: true,
        type: "common",
      })
    );

    // Words from the *other* category in the same set act as distractors
    const distractorCategoryIndex = 1 - currentCategoryIndex;
    const distractorWords: GameWord[] = selectedSet.words[
      distractorCategoryIndex
    ]
      ? selectedSet.words[distractorCategoryIndex].map((word) => ({
          text: word,
          isCorrect: false,
          type: "distractor",
        }))
      : [];

    // Combine all words for the game
    // To make it more balanced, we can try to include a mix
    // For simplicity now, just concat. Consider a more balanced approach later if needed.
    const allGameWords: GameWord[] = [
      ...targetCategoryWords,
      ...commonWords,
      ...distractorWords,
    ];
    setGameWords(allGameWords.sort(() => Math.random() - 0.5)); // Shuffle them
    // Reset score and shapes when words change
    setScore(0);
    setShapes([]);
    // if (gameActive) startGame(); // Optionally restart game immediately
  }, [currentWordSetIndex, currentCategoryIndex]);

  // Create a new shape with a word
  const createNewShape = useCallback(
    (gameWidth: number): Shape | null => {
      if (gameWords.length === 0) {
        // This case should ideally not happen if UI prevents game start before word list is ready
        // Or, we can return a placeholder shape or null
        console.warn("Attempted to create shape with no game words loaded.");
        return null; // Or a default shape: { id: 'placeholder', ..., word: 'Loading...' }
      }

      // Get a random word
      const randomWordData =
        gameWords[Math.floor(Math.random() * gameWords.length)];
      if (!randomWordData) return null; // Should not happen if gameWords is populated

      // Create a canvas to measure text width
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        // Fallback if canvas is not available
        const newWidth = 150;
        const newHeight = 50;
        const newX = Math.floor(Math.random() * (gameWidth - newWidth));
        const newSpeed =
          Math.random() * SHAPE_SPEED_VARIATION + SHAPE_BASE_SPEED;

        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: newX,
          y: -50, // Start above the screen
          width: newWidth,
          height: newHeight,
          speed: newSpeed,
          color: randomWordData.isCorrect
            ? randomWordData.type === "common"
              ? "#F59E0B"
              : "#10B981"
            : "#EF4444", // Yellow for common, Green for target correct, Red for incorrect/distractor
          rotation: 0,
          word: randomWordData.text,
          isCorrect: randomWordData.isCorrect,
          type: randomWordData.type,
        };
      }

      // Measure text width
      context.font = "16px Arial";
      const textWidth = context.measureText(randomWordData.text).width;

      // Calculate shape dimensions based on text
      const padding = 20;
      const newWidth = Math.max(Math.min(textWidth + padding, 300), 100); // Min width 100px, max 300px
      const newHeight = 40; // Fixed height for better readability
      const newX = Math.floor(Math.random() * (gameWidth - newWidth));
      const newSpeed = Math.random() * SHAPE_SPEED_VARIATION + SHAPE_BASE_SPEED;

      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: newX,
        y: -newHeight - 20, // Start above the screen
        width: newWidth,
        height: newHeight,
        speed: newSpeed,
        color: randomWordData.isCorrect
          ? randomWordData.type === "common"
            ? "#F59E0B"
            : "#10B981"
          : "#EF4444", // Yellow for common, Green for target correct, Red for incorrect/distractor
        rotation: 0,
        word: randomWordData.text,
        isCorrect: randomWordData.isCorrect,
        type: randomWordData.type,
      };
    },
    [gameWords]
  );

  // Spawn shapes periodically
  useEffect(() => {
    if (gameActive && gameAreaRef.current) {
      const gameArea = gameAreaRef.current;
      shapeSpawnIntervalRef.current = setInterval(() => {
        const newShape = createNewShape(gameArea.clientWidth);
        if (newShape) {
          setShapes((prevShapes) => {
            if (prevShapes.length < MAX_CONCURRENT_SHAPES) {
              return [...prevShapes, newShape];
            }
            return prevShapes;
          });
        }
      }, SHAPE_SPAWN_INTERVAL);
    } else {
      if (shapeSpawnIntervalRef.current) {
        clearInterval(shapeSpawnIntervalRef.current);
      }
    }
    return () => {
      if (shapeSpawnIntervalRef.current) {
        clearInterval(shapeSpawnIntervalRef.current);
      }
    };
  }, [gameActive, createNewShape]);

  // Update game state (animation loop)
  const updateGame = useCallback(() => {
    if (!gameAreaRef.current || !gameActive) return;

    const gameArea = gameAreaRef.current;
    const gameHeight = gameArea.clientHeight;

    setShapes(
      (prevShapes) =>
        prevShapes
          .map((shape) => ({
            ...shape,
            y: shape.y + shape.speed,
            rotation: shape.rotation + 0.5, // Slower rotation
          }))
          .filter((shape) => shape.y < gameHeight + shape.height + 20) // Remove if way off screen
    );

    animationFrameRef.current = requestAnimationFrame(updateGame);
  }, [gameActive]);

  // Start/stop animation loop
  useEffect(() => {
    if (gameActive) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameActive, updateGame]);

  // Timer effect
  useEffect(() => {
    if (gameActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameActive]);

  // Handle user click on a shape
  const handleShapeClick = (shape: Shape) => {
    if (!gameActive) return;

    // Remove the clicked shape
    setShapes((prevShapes) => prevShapes.filter((s) => s.id !== shape.id));

    // Update score based on whether it was a correct word
    if (shape.isCorrect) {
      setScore((prevScore) => prevScore + (shape.type === "common" ? 15 : 10)); // More points for common words maybe?
    } else {
      // Penalty for clicking incorrect words
      setScore((prevScore) => Math.max(0, prevScore - 5)); // Penalty for wrong click
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimeElapsed(0);
    setShapes([]);
  };

  // Toggle game state
  const toggleGame = () => {
    if (!gameActive) {
      // Starting the game
      if (!wordList[currentWordSetIndex]) {
        // setShowWordListModal(true);
        return; // Don't start if no word list is selected
      }
      resetGame();
      setGameActive(true);
      // setShowWordListModal(false);
    } else {
      // Pausing the game
      setGameActive(false);
      // Animation and spawn intervals are cleared by their respective useEffects
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-dvh w-screen overflow-hidden">
      {/* Fixed Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Score
              </p>
              <p
                className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white"
                style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)" }}
              >
                {score}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Time
              </p>
              <p
                className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white"
                style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)" }}
              >
                {formatTime(timeElapsed)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={toggleGame}
                variant="outline"
                size="icon"
                className="w-10 h-10 sm:w-12 sm:h-12"
              >
                {gameActive ? (
                  <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>


        {/* Word Set and Category Selectors */}
        <div className="rounded-xl p-3 sm:p-6 transition-colors duration-300 z-10">
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {/* Category Toggle */}
              <div className="flex items-center">
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mr-2">
                  {wordList[currentWordSetIndex]?.name[0]}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={currentCategoryIndex === 1}
                    onChange={() =>
                      setCurrentCategoryIndex((prev) => (prev === 0 ? 1 : 0))
                    }
                    disabled={!gameActive && shapes.length > 0} // Disable if game paused mid-way, or handle reset
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 ml-2">
                  {wordList[currentWordSetIndex]?.name[1]}
                </span>
              </div>
              {/* Word Set Dropdown */}
              <div className="relative">
                <select
                  value={currentWordSetIndex}
                  onChange={(e) => {
                    setCurrentWordSetIndex(Number(e.target.value));
                    setCurrentCategoryIndex(0); // Reset to first category on new set
                  }}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 pr-8 text-sm sm:text-base text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  disabled={!gameActive && shapes.length > 0}
                >
                  {wordList.map((set, index) => (
                    <option key={index} value={index}>
                      {set.name.join(" / ")}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
      </header>

      {/* Main Content Area - Game Area + Instructions */}
      <main className="flex-grow flex flex-col">
        <div className="w-full mx-auto relative">
          

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            className="w-full h-screen bg-white/20 dark:bg-black/30 rounded-lg shadow-2xl overflow-hidden relative mb-4"
          >
            <AnimatePresence>
              {shapes.map((shape) => (
                <motion.div
                  key={shape.id}
                  initial={{
                    y: shape.y,
                    x: shape.x,
                    opacity: 0.8,
                    rotate: shape.rotation,
                  }}
                  animate={{
                    y: shape.y,
                    x: shape.x,
                    opacity: 1,
                    rotate: shape.rotation,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    transition: { duration: 0.3 },
                  }}
                  style={{
                    position: "absolute",
                    left: shape.x,
                    top: shape.y,
                    width: shape.width,
                    height: shape.height,
                    backgroundColor: shape.color,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: Math.min(
                      16,
                      shape.width / (shape.word.length * 0.6 + 2)
                    ), // Adjusted font size
                    padding: "0 5px",
                    overflow: "hidden",
                    textAlign: "center",
                    userSelect: "none",
                  }}
                  onClick={() => handleShapeClick(shape)}
                  className="shape-button"
                >
                  {shape.word}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Word List Selection Modal was here */}
    </div>
  );
}
