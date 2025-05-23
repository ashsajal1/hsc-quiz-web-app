import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Trophy, Timer } from 'lucide-react';

export default function DropGame() {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [dropActive, setDropActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shape, setShape] = useState({
    x: 0,
    y: -100,
    width: 80,
    height: 40,
    visible: true,
    speed: 3,
    color: '#3498db',
    rotation: 0
  });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();

  // Reset shape position and properties
  const resetShape = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current;
    const gameWidth = gameArea.clientWidth;
    
    // Generate random properties for the shape
    const newWidth = Math.floor(Math.random() * 80) + 40;
    const newHeight = Math.floor(Math.random() * 40) + 20;
    const newX = Math.floor(Math.random() * (gameWidth - newWidth));
    const newSpeed = Math.floor(Math.random() * 3) + 2;
    const newRotation = Math.floor(Math.random() * 360);
    
    // Generate random color with better contrast
    const colors = [
      '#3B82F6', // blue-500
      '#EF4444', // red-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#8B5CF6', // violet-500
      '#EC4899'  // pink-500
    ];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    
    setShape({
      x: newX,
      y: -100,
      width: newWidth,
      height: newHeight,
      visible: true,
      speed: newSpeed,
      color: newColor,
      rotation: newRotation
    });
    
    setDropActive(true);
  }, []);

  // Update game state
  const updateGame = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current;
    const gameHeight = gameArea.clientHeight;
    
    setShape(prevShape => {
      const newY = prevShape.y + prevShape.speed;
      const newRotation = prevShape.rotation + 1;
      
      if (newY > gameHeight) {
        setDropActive(false);
        
        timeoutRef.current = setTimeout(() => {
          resetShape();
        }, 1000);
        
        return { ...prevShape, visible: false };
      }
      
      return { ...prevShape, y: newY, rotation: newRotation };
    });
    
    if (dropActive) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
  }, [dropActive, resetShape]);

  // Initialize the game
  useEffect(() => {
    if (gameAreaRef.current) {
      resetShape();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetShape]);

  // Game animation loop
  useEffect(() => {
    if (gameActive && dropActive) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameActive, dropActive, updateGame]);

  // Timer effect
  useEffect(() => {
    if (gameActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameActive]);

  // Handle user click on the shape
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dropActive || !shape.visible) return;
    
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    if (
      clickX >= shape.x && 
      clickX <= shape.x + shape.width && 
      clickY >= shape.y && 
      clickY <= shape.y + shape.height
    ) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      
      setDropActive(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        resetShape();
      }, 500);
    }
  };

  // Toggle game state
  const toggleGame = () => {
    if (!gameActive) {
      setGameActive(true);
      resetShape();
    } else {
      setGameActive(false);
      setDropActive(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Drop Game</h1>
            <p className="text-muted-foreground">Test your reflexes!</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <Trophy className="w-4 h-4" />
              High Score: {highScore}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Timer className="w-4 h-4" />
              {formatTime(timeElapsed)}
            </Badge>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-2xl font-semibold">Score: {score}</div>
          <Button 
            onClick={toggleGame}
            variant={gameActive ? "destructive" : "default"}
            className="gap-2"
          >
            {gameActive ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </Button>
        </div>

        <div 
          ref={gameAreaRef}
          onClick={handleClick}
          className="w-full h-[600px] rounded-lg relative overflow-hidden bg-white dark:bg-gray-800 shadow-lg"
        >
          <AnimatePresence>
            {gameActive && shape.visible && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  position: 'absolute',
                  left: `${shape.x}px`,
                  top: `${shape.y}px`,
                  width: `${shape.width}px`,
                  height: `${shape.height}px`,
                  backgroundColor: shape.color,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transform: `rotate(${shape.rotation}deg)`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transition: 'transform 0.1s ease-out'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            )}
          </AnimatePresence>
          
          {!gameActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <div className="text-white text-2xl font-bold">Game Paused</div>
            </motion.div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Instructions:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">How to Play</h3>
              <p>Click on the falling shapes before they disappear to score points!</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Tips</h3>
              <p>The faster you click, the higher your score will be. Watch out for the rotation!</p>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}
