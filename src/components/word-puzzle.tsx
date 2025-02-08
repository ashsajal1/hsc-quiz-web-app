import React, { useState, useRef, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

// Your provided data
const puzzleData = {
  id: "2",
  question: "তত্ত্ব বলতে কী বোঝ?",
  answer:
    "বৈজ্ঞানিক গবেষণার ক্ষেত্রে একজন বিজ্ঞানী পরীক্ষাধীন বিষয়ের নির্ভুল ও সূক্ষ্ম পর্যবেক্ষণ, ঘটনার কার্যকারণ সম্পর্ক নির্ণয় এবং পরীক্ষার দ্বারা তথ্যের সত্যতা যাচাইপূর্বক ঘটনা সম্পর্কে বৈজ্ঞানিক প্রকল্প গ্রহণ করেন এর শক্তি অনেক বেশি আর তাকে তত্ত্ বলে।",
  type: "perceptual",
  subject: "physics-1",
  chapter: "1",
};

// Helper function to shuffle an array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Drag item type
interface DragWordItem {
  index: number;
  word: string;
  from: "available" | "selected";
  type: "WORD";
}

// ----------------------
// Sortable Word Component
// ----------------------
interface SortableWordProps {
  word: string;
  index: number;
  from: "available" | "selected";
  moveWord?: (dragIndex: number, hoverIndex: number) => void;
  onClick?: () => void;
}

const SortableWord: React.FC<SortableWordProps> = ({
  word,
  index,
  from,
  moveWord,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Setup drag
  const [{ isDragging }, drag] = useDrag<DragWordItem, unknown, { isDragging: boolean }>(
    () => ({
      type: "WORD",
      item: { index, word, from, type: "WORD" },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [word, index, from]
  );

  // Setup drop (only for items in the "selected" list to support reordering)
  const [, drop] = useDrop<DragWordItem>({
    accept: "WORD",
    hover(item, monitor) {
      if (!ref.current || !moveWord || from !== "selected") {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      // Get horizontal middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      // Only move when the mouse has crossed half of the item's width
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      // Perform the move
      moveWord(dragIndex, hoverIndex);
      // Note: mutating the item here to avoid flickering
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        display: "inline-block",
        marginRight: "5px",
        marginBottom: "5px",
        cursor: "move",
      }}
      onClick={onClick}
    >
      <Button>{word}</Button>
    </div>
  );
};

// ----------------------
// Word Puzzle Game Component
// ----------------------
const WordPuzzleGame: React.FC = () => {
  // Split the answer into words (using space as delimiter) and filter out any empty strings.
  const words = puzzleData.answer.split(" ").filter((w) => w.trim() !== "");
  // Create initial available words in a random order.
  const [availableWords, setAvailableWords] = useState<string[]>(() =>
    shuffleArray(words)
  );
  // Track the words selected by the user.
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Handler for clicking on an available word (fallback for non-drag)
  const handleSelectWord = (word: string, index: number) => {
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
    setSelectedWords((prev) => [...prev, word]);
  };

  // Handler for clicking on a word in the answer area (fallback for non-drag)
  const handleRemoveWord = (index: number) => {
    const removed = selectedWords[index];
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, removed]);
  };

  // Handler for reordering words in the answer area.
  const moveWord = useCallback((dragIndex: number, hoverIndex: number) => {
    setSelectedWords((prevWords) => {
      const newWords = [...prevWords];
      const [removed] = newWords.splice(dragIndex, 1);
      newWords.splice(hoverIndex, 0, removed);
      return newWords;
    });
  }, []);

  // Construct the answer from the selected words.
  const constructedAnswer = selectedWords.join(" ").trim();
  // Check if the constructed answer matches the correct answer.
  const isCorrect = constructedAnswer === puzzleData.answer.trim();

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2 className="font-bold text-xl my-4">{puzzleData.question}</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Your Answer (Drag & drop to reorder or click to remove):</h3>
        <Card className="mt-2">
          <CardContent
            style={{
              padding: "10px",
              minHeight: "50px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {selectedWords.map((word, index) => (
              <SortableWord
                key={index}
                word={word}
                index={index}
                from="selected"
                moveWord={moveWord}
                onClick={() => handleRemoveWord(index)}
              />
            ))}
          </CardContent>
        </Card>
        {isCorrect && selectedWords.length > 0 && (
          <div style={{ color: "green", fontWeight: "bold", marginTop: "10px" }}>
            Correct!
          </div>
        )}
      </div>

      <div className="my-2">
        <h3>Available Words (Drag to your answer or click to add):</h3>
        <Card className="my-2">
          <CardContent
            style={{
              padding: "10px",
              minHeight: "50px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {availableWords.map((word, index) => (
              <SortableWord
                key={index}
                word={word}
                index={index}
                from="available"
                // When clicked, add the word to the answer.
                onClick={() => handleSelectWord(word, index)}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Wrap the game with the DndProvider.
const WordPuzzleGameWithDnd: React.FC = () => (
  <DndProvider backend={HTML5Backend}>
    <WordPuzzleGame />
  </DndProvider>
);

export default WordPuzzleGameWithDnd;
