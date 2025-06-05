import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Play, Pause, X } from 'lucide-react';
import { wordList } from '@/lib/words';

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
  isCorrect: boolean;
  category: string;
}

const MAX_CONCURRENT_SHAPES = 10;
const SHAPE_SPAWN_INTERVAL = 2000; // milliseconds
const SHAPE_BASE_SPEED = 1;
const SHAPE_SPEED_VARIATION = 1;

// Get all available word lists
const wordLists = wordList.map(category => ({
  id: category.topic ? `${category.topic}-${category.chapter}-${category.name.join('-')}` : category.name.join('-'),
  name: category.name.join(' vs '),
  description: category.topic ? `${category.topic} (Chapter ${category.chapter})` : '',
  words: category.words.flat(),
  incorrectWords: category.commonWords || []
}));

// Add some common words as incorrect options
const commonIncorrectWords = [
  'ক্লোরোফিল আছে',
  'ফুল ফোটে',
  'বীজ উৎপন্ন করে',
  'ফল ধারণ করে',
  'মূল, কান্ড, পাতা আছে'
];

export default function DropGame() {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedWordList, setSelectedWordList] = useState<string | null>(null);
  const [showWordListModal, setShowWordListModal] = useState(true);
  const [gameWords, setGameWords] = useState<Array<{text: string, isCorrect: boolean, category: string}>>([]);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const timerRef = useRef<NodeJS.Timeout>();
  const shapeSpawnIntervalRef = useRef<NodeJS.Timeout>();

  // Update game words when word list changes
  useEffect(() => {
    if (selectedWordList) {
      const list = wordLists.find(list => list.id === selectedWordList);
      if (list) {
        const correctWords = list.words.map(word => ({
          text: word,
          isCorrect: true,
          category: list.name
        }));
        
        const incorrectWords = [
          ...(list.incorrectWords || []),
          ...commonIncorrectWords
        ].map(word => ({
          text: word,
          isCorrect: false,
          category: 'Incorrect'
        }));
        
        setGameWords([...correctWords, ...incorrectWords]);
      }
    }
  }, [selectedWordList]);
  
  // Create a new shape with a word
  const createNewShape = useCallback((gameWidth: number): Shape => {
    if (gameWords.length === 0) {
      return {
        id: 'default',
        x: 50,
        y: -50,
        width: 200,
        height: 40,
        speed: 1,
        color: '#888',
        rotation: 0,
        word: 'Select a word list to start',
        isCorrect: false,
        category: 'system'
      };
    }
    
    // Get a random word
    const randomWord = gameWords[Math.floor(Math.random() * gameWords.length)];
    
    // Create a canvas to measure text width
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      // Fallback if canvas is not available
      const newWidth = 150;
      const newHeight = 50;
      const newX = Math.floor(Math.random() * (gameWidth - newWidth));
      const newSpeed = Math.random() * SHAPE_SPEED_VARIATION + SHAPE_BASE_SPEED;
      
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: newX,
        y: -50, // Start above the screen
        width: newWidth,
        height: newHeight,
        speed: newSpeed,
        color: randomWord.isCorrect ? '#10B981' : '#EF4444', // Green for correct, red for incorrect
        rotation: 0,
        word: randomWord.text,
        isCorrect: randomWord.isCorrect,
        category: randomWord.category
      };
    }
    
    // Measure text width
    context.font = '16px Arial';
    const textWidth = context.measureText(randomWord.text).width;
    
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
      color: randomWord.isCorrect ? '#10B981' : '#EF4444', // Green for correct, red for incorrect
      rotation: 0,
      word: randomWord.text,
      isCorrect: randomWord.isCorrect,
      category: randomWord.category
    };
  }, [gameWords]);

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

    const clickedShape = shapes.find(s => s.id === shapeId);
    if (!clickedShape) return;

    // Remove the clicked shape
    setShapes(prevShapes => prevShapes.filter(s => s.id !== shapeId));
    
    // Update score based on whether it was a correct word
    if (clickedShape.isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
    } else {
      // Penalty for clicking incorrect words
      setScore(prevScore => Math.max(0, prevScore - 1));
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
      if (!selectedWordList) {
        setShowWordListModal(true);
        return; // Don't start if no word list is selected
      }
      resetGame();
      setGameActive(true);
      setShowWordListModal(false);
    } else { // Pausing the game
      setGameActive(false);
      // Animation and spawn intervals are cleared by their respective useEffects
    }
  };
  
  // Handle word list selection
  const handleWordListSelect = (listId: string) => {
    setSelectedWordList(listId);
    setGameActive(false);
    resetGame();
    setShowWordListModal(false);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-dvh w-screen overflow-hidden">
      {/* Fixed Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>Drop Game</h1>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Score</p>
              <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>{score}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Time</p>
              <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>{formatTime(timeElapsed)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">High Score</p>
              <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>{highScore}</p>
            </div>
            <Button onClick={toggleGame} variant="outline" size="icon" className="w-10 h-10 sm:w-12 sm:h-12">
              {gameActive ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Game Area + Instructions */}
      <main className="flex-grow flex flex-col "> {/* pt should be approx height of header */}
        <div 
          ref={gameAreaRef} 
          className="flex-grow h-screen relative w-full overflow-hidden"
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                }}
                onClick={() => handleShapeClick(shape.id)}
              >
                <span className="text-white font-medium text-center text-sm">
                  {shape.word}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Game State Message & Instructions Area */}
        <div className="py-4 px-4">
          {!gameActive && shapes.length === 0 && (
            <div className="text-center mb-6">
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
                {timeElapsed > 0 ? 'Game Paused. Click Play to resume.' : 'Select a word list and click Play to start!'}
              </p>
              
              {/* Word List Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Select a Word List:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto mb-4">
                  {wordLists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => handleWordListSelect(list.id)}
                      className={`p-4 rounded-lg text-left transition-all ${
                        selectedWordList === list.id
                          ? 'bg-blue-100 border-2 border-blue-500 dark:bg-blue-900/30'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white">{list.name}</h4>
                      {list.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{list.description}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {list.words.length} words • {list.incorrectWords?.length || 0} incorrect options
                      </p>
                    </button>
                  ))}
                </div>
                
                {selectedWordList && (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-md inline-block">
                    Selected: {wordLists.find(l => l.id === selectedWordList)?.name}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold mb-2">How to Play:</h2>
                <ul className="text-left list-disc pl-5 space-y-1">
                  <li>Select a word list from the options above</li>
                  <li>Click on the correct words (green) to score points</li>
                  <li>Avoid clicking incorrect words (red)</li>
                  <li>+1 point for each correct word</li>
                  <li>-1 point for each incorrect word</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Word List Selection Modal */}
      {showWordListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select a Word List</h2>
                <button 
                  onClick={() => setShowWordListModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {wordLists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => handleWordListSelect(list.id)}
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      selectedWordList === list.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 hover:border-blue-300 bg-white dark:bg-gray-700 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{list.name}</h3>
                        {list.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{list.description}</p>
                        )}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                        {list.words.length} words
                      </span>
                    </div>
                    {list.incorrectWords && list.incorrectWords.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        + {list.incorrectWords.length} incorrect options
                      </p>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How to Play:</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc pl-5">
                  <li>Select a word list above to get started</li>
                  <li>Click on green words to score points</li>
                  <li>Avoid clicking red words</li>
                  <li>+1 point for correct words, -1 for incorrect</li>
                  <li>Try to beat your high score!</li>
                </ul>
              </div>
              
              {selectedWordList && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      setShowWordListModal(false);
                      if (!gameActive) toggleGame();
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Start Game with {wordLists.find(l => l.id === selectedWordList)?.name}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
