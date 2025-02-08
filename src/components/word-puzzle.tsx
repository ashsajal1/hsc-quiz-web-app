import React, { useState } from "react";

// Your provided data (you could also pass this as props)
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

const WordPuzzleGame: React.FC = () => {
  // Split the answer into words (using space as delimiter) and filter out any empty strings.
  const words = puzzleData.answer.split(" ").filter((w) => w.trim() !== "");
  // Create initial available words in a random order.
  const [availableWords, setAvailableWords] = useState<string[]>(() =>
    shuffleArray(words)
  );
  // Track the words selected by the user.
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // When a user clicks on an available word, remove it from availableWords and add it to selectedWords.
  const handleSelectWord = (word: string, index: number) => {
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
    setSelectedWords([...selectedWords, word]);
  };

  // When a user clicks on a word in their answer, remove it from selectedWords and return it to availableWords.
  const handleRemoveWord = (index: number) => {
    const newSelected = [...selectedWords];
    const removed = newSelected.splice(index, 1)[0];
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, removed]);
  };

  // Construct the answer from the selected words.
  const constructedAnswer = selectedWords.join(" ").trim();
  // Check if the constructed answer matches the correct answer.
  const isCorrect = constructedAnswer === puzzleData.answer.trim();

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>{puzzleData.question}</h2>

      <div style={{ margin: "20px 0" }}>
        <h3>Your Answer:</h3>
        <div
          style={{
            border: "1px solid #ccc",
            minHeight: "50px",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "4px",
          }}
        >
          {selectedWords.map((word, index) => (
            <span
              key={index}
              onClick={() => handleRemoveWord(index)}
              style={{
                marginRight: "5px",
                cursor: "pointer",
                padding: "5px 8px",
                border: "1px solid #333",
                borderRadius: "3px",
                backgroundColor: "#f0f0f0",
              }}
            >
              {word}
            </span>
          ))}
        </div>
        {isCorrect && selectedWords.length > 0 && (
          <div style={{ color: "green", fontWeight: "bold" }}>Correct!</div>
        )}
      </div>

      <div>
        <h3>Available Words:</h3>
        <div
          style={{
            border: "1px solid #ccc",
            minHeight: "50px",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {availableWords.map((word, index) => (
            <span
              key={index}
              onClick={() => handleSelectWord(word, index)}
              style={{
                marginRight: "5px",
                cursor: "pointer",
                padding: "5px 8px",
                border: "1px solid #333",
                borderRadius: "3px",
                backgroundColor: "#e0e0e0",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordPuzzleGame;
