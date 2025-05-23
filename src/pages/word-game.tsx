import React, { useState, useEffect } from "react";

const wordList = [
  {
    name: ["শৈবাল", "ছত্রাক"],
    words: [
      ["সুকেন্দ্রিক", "এককোষী", "বহুকোষী", "খাদ্য শর্করা"],
      ["অসবুজ", "মৃতজীবী", "পরজীবী", "খাদ্য - গ্লাইকজেন", "শোষণ প্রক্রিয়া"],
    ],
    commonWords: ["ভাস্কুলার টিস্যু নেই"],
  },
];

const WordGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [gameOver, setGameOver] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const initializeGame = () => {
    const allWords = [
      ...wordList[0].words[0],
      ...wordList[0].words[1],
      ...wordList[0].commonWords
    ];
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    setGameWords(shuffledWords);
    setSelectedWords([]);
    setFeedback("");
    setGameOver(false);
    setProgress(0);
    setShowHint(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleWordClick = (word: string) => {
    if (gameOver || selectedWords.includes(word)) return;
    
    const isCommonWord = wordList[0].commonWords.includes(word);
    const isCorrect = wordList[0].words[currentCategory].includes(word) || isCommonWord;
    const newSelectedWords = [...selectedWords, word];
    setSelectedWords(newSelectedWords);
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (isCommonWord) {
        setFeedback(`সঠিক! এটি উভয়েরই সাধারণ বৈশিষ্ট্য!`);
      } else {
        setFeedback(
          `সঠিক! এটি ${wordList[0].name[currentCategory]} এর বৈশিষ্ট্য!`
        );
      }

      const correctWords = [...wordList[0].words[currentCategory], ...wordList[0].commonWords];
      const foundCorrectWords = newSelectedWords.filter((w) =>
        correctWords.includes(w)
      );
      const newProgress =
        (foundCorrectWords.length / correctWords.length) * 100;
      setProgress(newProgress);

      if (foundCorrectWords.length === correctWords.length) {
        setGameOver(true);
        setFeedback(`অভিনন্দন! আপনি সব বৈশিষ্ট্য খুঁজে পেয়েছেন!`);
      }
    } else {
      setFeedback(
        `ভুল! এটি ${wordList[0].name[currentCategory]} এর বৈশিষ্ট্য নয়।`
      );
    }
  };

  const getBoxColor = (word: string) => {
    if (!selectedWords.includes(word)) {
      if (showHint && (wordList[0].words[currentCategory].includes(word) || wordList[0].commonWords.includes(word))) {
        return "bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 border-2 border-blue-500 dark:border-blue-400";
      }
      return "bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100";
    }
    if (wordList[0].commonWords.includes(word)) {
      return "bg-yellow-500 text-white";
    }
    return wordList[0].words[currentCategory].includes(word)
      ? "bg-green-500 text-white"
      : "bg-red-500 text-white";
  };

  const switchCategory = () => {
    setCurrentCategory((prev) => (prev === 0 ? 1 : 0));
    initializeGame();
  };

  const getRemainingCount = () => {
    const correctWords = [...wordList[0].words[currentCategory], ...wordList[0].commonWords];
    const foundCorrectWords = selectedWords.filter((w) =>
      correctWords.includes(w)
    );
    return correctWords.length - foundCorrectWords.length;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 p-6 transition-colors duration-300">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-4xl font-bold text-center mb-4 text-gray-800 dark:text-white">
              Word Game
            </h1>
            <div className="flex items-center gap-4">
              <span
                className={`px-4 py-2 rounded-full text-white font-semibold ${
                  currentCategory === 0 ? "bg-green-500" : "bg-purple-500"
                }`}
              >
                {wordList[0].name[currentCategory]}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {getRemainingCount()}টি বৈশিষ্ট্য বাকি আছে
              </span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                  স্কোর: {score}
                </h2>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-sm px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {showHint ? "ইঙ্গিত বন্ধ করুন" : "ইঙ্গিত দেখুন"}
                </button>
              </div>
              <button
                onClick={switchCategory}
                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-teal-400 hover:border-teal-500"
              >
                {currentCategory === 0
                  ? "ছত্রাকের বৈশিষ্ট্য দেখুন"
                  : "শৈবালের বৈশিষ্ট্য দেখুন"}
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                {wordList[0].name[currentCategory]} এর বৈশিষ্ট্যগুলি বেছে নিন!
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progress)}% সম্পন্ন
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gameWords.map((word, index) => (
              <div
                key={index}
                className={`${getBoxColor(
                  word
                )} p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-105 text-center transform hover:rotate-1`}
                onClick={() => handleWordClick(word)}
              >
                <p className="text-lg font-semibold">{word}</p>
              </div>
            ))}
          </div>

          {feedback && (
            <div className="mt-6 text-center">
              <p
                className={`text-xl font-semibold ${
                  selectedWords.length > 0 &&
                  wordList[0].words[currentCategory].includes(
                    selectedWords[selectedWords.length - 1]
                  )
                    ? "text-green-500 dark:text-green-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
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
    </div>
  );
};

export default WordGame;
