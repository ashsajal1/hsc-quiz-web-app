import React, { useState, useEffect } from 'react';

const wordList = [
    {
        name: ["শৈবাল", "ছত্রাক"],
        words: [["ভাস্কুলার টিস্যু নেই", "সুকেন্দ্রিক", "এককোষী", "বহুকোষী", "খাদ্য শর্করা"], ["অসবুজ", "মৃতজীবী", "পরজীবী", "খাদ্য - গ্লাইকজেন", "শোষণ প্রক্রিয়া"]]
    }
];

const WordGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [gameOver, setGameOver] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0); // 0 for শৈবাল, 1 for ছত্রাক

  const initializeGame = () => {
    // Get all words from both categories
    const allWords = [...wordList[0].words[0], ...wordList[0].words[1]];
    // Shuffle the words
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    setGameWords(shuffledWords);
    setSelectedWord(null);
    setFeedback('');
    setGameOver(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleWordClick = (word: string) => {
    if (gameOver) return;
    
    setSelectedWord(word);
    // Check if the word belongs to the current category
    const isCorrect = wordList[0].words[currentCategory].includes(word);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(`সঠিক! এটি ${wordList[0].name[currentCategory]} এর বৈশিষ্ট্য!`);
    } else {
      setFeedback(`ভুল! এটি ${wordList[0].name[currentCategory]} এর বৈশিষ্ট্য নয়।`);
    }
    setGameOver(true);
  };

  const getBoxColor = (word: string) => {
    if (!selectedWord) return 'bg-blue-100 hover:bg-blue-200';
    if (word === selectedWord) {
      return wordList[0].words[currentCategory].includes(word) 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white';
    }
    return 'bg-blue-100';
  };

  const switchCategory = () => {
    setCurrentCategory(prev => prev === 0 ? 1 : 0);
    initializeGame();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">
        শৈবাল ও ছত্রাকের বৈশিষ্ট্য
      </h1>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          স্কোর: {score}
        </h2>
        <p className="text-gray-600 mb-4">
          {wordList[0].name[currentCategory]} এর বৈশিষ্ট্যগুলি বেছে নিন!
        </p>
        <button
          onClick={switchCategory}
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 mb-4"
        >
          {currentCategory === 0 ? 'ছত্রাকের বৈশিষ্ট্য দেখুন' : 'শৈবালের বৈশিষ্ট্য দেখুন'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {gameWords.map((word, index) => (
          <div
            key={index}
            className={`${getBoxColor(word)} p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-105 text-center`}
            onClick={() => handleWordClick(word)}
          >
            <p className="text-lg font-semibold">{word}</p>
          </div>
        ))}
      </div>

      {feedback && (
        <div className="mt-6 text-center">
          <p className={`text-xl font-semibold ${selectedWord && wordList[0].words[currentCategory].includes(selectedWord) ? 'text-green-600' : 'text-red-600'}`}>
            {feedback}
          </p>
        </div>
      )}

      {gameOver && (
        <div className="mt-6 text-center">
          <button
            onClick={initializeGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            আবার খেলুন
          </button>
        </div>
      )}
    </div>
  );
};

export default WordGame;
