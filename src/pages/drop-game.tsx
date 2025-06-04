import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Play, Pause } from 'lucide-react';

interface Shape {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  rotation: number;
}

const MAX_CONCURRENT_SHAPES = 100;
const SHAPE_SPAWN_INTERVAL = 400; // milliseconds
const SHAPE_BASE_SPEED = 1.5;
const SHAPE_SPEED_VARIATION = 2;
const SHAPE_MIN_WIDTH = 30;
const SHAPE_WIDTH_VARIATION = 50;
const SHAPE_MIN_HEIGHT = 20;
const SHAPE_HEIGHT_VARIATION = 30;

const GAME_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899'  // pink-500
];

export default function DropGame() {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false); // Start paused
  const [highScore, setHighScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shapes, setShapes] = useState<Shape[]>([]);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const timerRef = useRef<NodeJS.Timeout>();
  const shapeSpawnIntervalRef = useRef<NodeJS.Timeout>();

  // Create a new shape
  const createNewShape = useCallback((gameWidth: number): Shape => {
    const newWidth = Math.floor(Math.random() * SHAPE_WIDTH_VARIATION) + SHAPE_MIN_WIDTH;
    const newHeight = Math.floor(Math.random() * SHAPE_HEIGHT_VARIATION) + SHAPE_MIN_HEIGHT;
    const newX = Math.floor(Math.random() * (gameWidth - newWidth));
    const newSpeed = Math.random() * SHAPE_SPEED_VARIATION + SHAPE_BASE_SPEED;
    const newRotation = Math.floor(Math.random() * 360);
    const newColor = GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: newX,
      y: -newHeight - 20, // Start above the screen
      width: newWidth,
      height: newHeight,
      speed: newSpeed,
      color: newColor,
      rotation: newRotation,
    };
  }, []); // GAME_COLORS is now stable, so it's not needed in deps

  // Spawn shapes periodically
  useEffect(() => {
    if (gameActive && gameAreaRef.current) {
      const gameArea = gameAreaRef.current;
      shapeSpawnIntervalRef.current = setInterval(() => {
        setShapes(prevShapes => {
          if (prevShapes.length < MAX_CONCURRENT_SHAPES) {
            return [...prevShapes, createNewShape(gameArea.clientWidth)];
          }
          return prevShapes;
        });
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
    
    setShapes(prevShapes => 
      prevShapes
        .map(shape => ({
          ...shape,
          y: shape.y + shape.speed,
          rotation: shape.rotation + 0.5, // Slower rotation
        }))
        .filter(shape => shape.y < gameHeight + shape.height + 20) // Remove if way off screen
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
        setTimeElapsed(prev => prev + 1);
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
  const handleShapeClick = (shapeId: string) => {
    if (!gameActive) return;

    setShapes(prevShapes => prevShapes.filter(s => s.id !== shapeId));
    
    const newScore = score + 1;
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
    }
  };
  
  const resetGame = () => {
    setScore(0);
    setTimeElapsed(0);
    setShapes([]);
    // High score persists
  };

  // Toggle game state
  const toggleGame = () => {
    if (!gameActive) { // Starting the game
      resetGame();
      setGameActive(true);
    } else { // Pausing the game
      setGameActive(false);
      // Animation and spawn intervals are cleared by their respective useEffects
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      {/* Fixed Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Drop Game</h1>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Score</p>
              <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Time</p>
              <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white">{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">High Score</p>
              <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white">{highScore}</p>
            </div>
            <Button onClick={toggleGame} variant="outline" size="icon" className="w-10 h-10 sm:w-12 sm:h-12">
              {gameActive ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Game Area + Instructions */}
      <main className="flex-grow flex flex-col pt-20 sm:pt-24"> {/* pt should be approx height of header */}
        <div 
          ref={gameAreaRef} 
          className="flex-grow relative w-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
          // Removed shadow-inner and rounded-lg as it's full screen now
        >
          <AnimatePresence>
            {shapes.map(shape => (
              <motion.div
                key={shape.id}
                layout
                initial={{ y: shape.y, x: shape.x, rotate: shape.rotation, opacity: 0, scale: 0.5 }}
                animate={{ y: shape.y, x: shape.x, rotate: shape.rotation, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                  position: 'absolute',
                  width: shape.width,
                  height: shape.height,
                  backgroundColor: shape.color,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                }}
                onClick={() => handleShapeClick(shape.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Game State Message & Instructions Area */}
        <div className="py-4 px-4">
          {!gameActive && shapes.length === 0 && (
            <div className="text-center mb-6">
              <p className="text-xl text-gray-700 dark:text-gray-300">
                {timeElapsed > 0 ? 'Game Paused. Click Play to resume.' : 'Click Play to start!'}
              </p>
            </div>
          )}

         
        </div>
      </main>
    </div>
  );
}
