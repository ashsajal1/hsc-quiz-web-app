import React, { useState, useEffect } from 'react';

const wordList = [
    {
        name: ["শৈবাল", "ছত্রাক"],
        words: [["ভাস্কুলার টিস্যু নেই", "সুকেন্দ্রিক", "এককোষী", "বহুকোষী", "খাদ্য শর্করা"], ["অসবুজ", "মৃতজীবী", "পরজীবী", "খাদ্য - গ্লাইকজেন", "শোষণ প্রক্রিয়া"]]
    }
];

const WordGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [gameOver, setGameOver] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [progress, setProgress] = useState(0);

  const initializeGame = () => {
    const allWords = [...wordList[0].words[0], ...wordList[0].words[1]];
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    setGameWords(shuffledWords);
    setSelectedWords([]);
    setFeedback('');
    setGameOver(false);
    setProgress(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleWordClick = (word: string) => {
    if (gameOver || selectedWords.includes(word)) return;
    
    const isCorrect = wordList[0].words[currentCategory].includes(word);
    const newSelectedWords = [...selectedWords, word];
    setSelectedWords(newSelectedWords);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(`সঠিক! এটি ${wordList[0].name[currentCategory]} এর বৈশিষ্ট্য!`);
      
      // Calculate progress
      const correctWords = wordList[0].words[currentCategory];
      const foundCorrectWords = newSelectedWords.filter(w => correctWords.includes(w));
      const newProgress = (foundCorrectWords.length / correctWords.length) * 100;
      setProgress(newProgress);

      // Check if all correct words are found
      if (foundCorrectWords.length === correctWords.length) {
        setGameOver(true);
        setFeedback(`অভিনন্দন! আপনি সব বৈশিষ্ট্য খুঁজে পেয়েছেন!`);
      }
    } else {
      setFeedback(`ভুল! এটি ${wordList[0].name[currentCategory]} এর বৈশিষ্ট্য নয়।`);
    }
  };

  const getBoxColor = (word: string) => {
    if (!selectedWords.includes(word)) {
      return 'bg-blue-100 hover:bg-blue-200';
    }
    return wordList[0].words[currentCategory].includes(word)
      ? 'bg-green-500 text-white'
      : 'bg-red-500 text-white';
  };

  const switchCategory = () => {
    setCurrentCategory(prev => prev === 0 ? 1 : 0);
    initializeGame();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          শৈবাল ও ছত্রাকের বৈশিষ্ট্য
        </h1>
        
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              স্কোর: {score}
            </h2>
            <button
              onClick={switchCategory}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              {currentCategory === 0 ? 'ছত্রাকের বৈশিষ্ট্য দেখুন' : 'শৈবালের বৈশিষ্ট্য দেখুন'}
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 text-lg mb-2">
              {wordList[0].name[currentCategory]} এর বৈশিষ্ট্যগুলি বেছে নিন!
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {Math.round(progress)}% সম্পন্ন
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gameWords.map((word, index) => (
            <div
              key={index}
              className={`${getBoxColor(word)} p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-105 text-center transform hover:rotate-1`}
              onClick={() => handleWordClick(word)}
            >
              <p className="text-lg font-semibold">{word}</p>
            </div>
          ))}
        </div>

        {feedback && (
          <div className="mt-6 text-center">
            <p className={`text-xl font-semibold ${
              selectedWords.length > 0 && 
              wordList[0].words[currentCategory].includes(selectedWords[selectedWords.length - 1]) 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {feedback}
            </p>
          </div>
        )}

        {gameOver && (
          <div className="mt-6 text-center">
            <button
              onClick={initializeGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              আবার খেলুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordGame;
