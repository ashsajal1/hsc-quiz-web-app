import React, { useState } from "react";
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

// Define the drag item type
interface DragWordItem {
  type: "WORD";
  word: string;
  from: "available" | "selected";
}

// Draggable word component
const DraggableWord: React.FC<{
  word: string;
  from: "available" | "selected";
}> = ({ word, from }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "WORD",
    item: { word, from },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        display: "inline-block",
        marginRight: "5px",
        marginBottom: "5px",
        cursor: "move",
      }}
    >
      <Button>{word}</Button>
    </div>
  );
};

// Drop zone for the "Your Answer" area
const AnswerDropZone: React.FC<{
  selectedWords: string[];
  onDropWord: (item: DragWordItem) => void;
}> = ({ selectedWords, onDropWord }) => {
  const [, drop] = useDrop({
    accept: "WORD",
    drop: (item: DragWordItem) => {
      if (item.from === "available") {
        onDropWord(item);
      }
    },
  });
  return (
    <Card>
      <CardContent
        ref={drop}
        className="p-3"
        style={{ minHeight: "50px", display: "flex", flexWrap: "wrap" }}
      >
        {selectedWords.map((word, index) => (
          <DraggableWord key={index} word={word} from="selected" />
        ))}
      </CardContent>
    </Card>
  );
};

// Drop zone for the "Available Words" area
const AvailableDropZone: React.FC<{
  availableWords: string[];
  onDropWord: (item: DragWordItem) => void;
}> = ({ availableWords, onDropWord }) => {
  const [, drop] = useDrop({
    accept: "WORD",
    drop: (item: DragWordItem) => {
      if (item.from === "selected") {
        onDropWord(item);
      }
    },
  });
  return (
    <Card>
      <CardContent
        ref={drop}
        className="p-3"
        style={{ minHeight: "50px", display: "flex", flexWrap: "wrap" }}
      >
        {availableWords.map((word, index) => (
          <DraggableWord key={index} word={word} from="available" />
        ))}
      </CardContent>
    </Card>
  );
};

const WordPuzzleGame: React.FC = () => {
  // Split the answer into words and filter out empty strings
  const words = puzzleData.answer.split(" ").filter((w) => w.trim() !== "");
  // Initialize available words in a random order
  const [availableWords, setAvailableWords] = useState<string[]>(() =>
    shuffleArray(words)
  );
  // Track the words selected by the user
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // When a word is dropped into the Answer area from available words
  const handleDropToAnswer = (item: DragWordItem) => {
    if (item.from === "available") {
      setAvailableWords((prev) => prev.filter((w) => w !== item.word));
      setSelectedWords((prev) => [...prev, item.word]);
    }
  };

  // When a word is dropped into the Available area from the Answer zone
  const handleDropToAvailable = (item: DragWordItem) => {
    if (item.from === "selected") {
      setSelectedWords((prev) => prev.filter((w) => w !== item.word));
      setAvailableWords((prev) => [...prev, item.word]);
    }
  };

  // Construct the answer from selected words
  const constructedAnswer = selectedWords.join(" ").trim();
  const isCorrect = constructedAnswer === puzzleData.answer.trim();

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2 className="font-bold text-xl my-4">{puzzleData.question}</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Your Answer (Drag words here):</h3>
        <AnswerDropZone
          selectedWords={selectedWords}
          onDropWord={handleDropToAnswer}
        />
        {isCorrect && selectedWords.length > 0 && (
          <div
            style={{
              color: "green",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            Correct!
          </div>
        )}
      </div>

      <div>
        <h3>Available Words (Drag words here):</h3>
        <AvailableDropZone
          availableWords={availableWords}
          onDropWord={handleDropToAvailable}
        />
      </div>
    </div>
  );
};

const WordPuzzleGameWithDnd: React.FC = () => (
  <DndProvider backend={HTML5Backend}>
    <WordPuzzleGame />
  </DndProvider>
);

export default WordPuzzleGameWithDnd;
