import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { wordList } from "@/lib/words";

const WordGame: React.FC = () => {
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [gameOver, setGameOver] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentWordSet, setCurrentWordSet] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [commonWordMode, setCommonWordMode] = useState(false);

  const initializeGame = useCallback(() => {
    // Reset confetti if any is still running
    confetti.reset();
    const allWords = [
      ...wordList[currentWordSet].words[0],
      ...wordList[currentWordSet].words[1],
      ...wordList[currentWordSet].commonWords,
    ];
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    setGameWords(shuffledWords);
    setSelectedWords([]);
    setFeedback("");
    setGameOver(false);
    setProgress(0);
    setShowHint(false);
    setCommonWordMode(false);
  }, [currentWordSet]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleWordClick = (word: string) => {
    if (gameOver || selectedWords.includes(word)) return;

    const isCommonWord = wordList[currentWordSet].commonWords.includes(word);

    // Check if word is correct based on mode
    let isCorrect = false;
    if (commonWordMode) {
      isCorrect = isCommonWord;
    } else {
      isCorrect =
        wordList[currentWordSet].words[currentCategory].includes(word) || isCommonWord;
    }

    const newSelectedWords = [...selectedWords, word];
    setSelectedWords(newSelectedWords);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (isCommonWord) {
        setFeedback(`সঠিক! এটি উভয়েরই সাধারণ বৈশিষ্ট্য!`);
      } else {
        setFeedback(
          `সঠিক! এটি ${wordList[currentWordSet].name[currentCategory]} এর বৈশিষ্ট্য!`
        );
      }

      // Determine which words are considered correct based on the mode
      const correctWords = commonWordMode
        ? [...wordList[currentWordSet].commonWords]
        : [...wordList[currentWordSet].words[currentCategory], ...wordList[currentWordSet].commonWords];

      const foundCorrectWords = newSelectedWords.filter((w) =>
        correctWords.includes(w)
      );
      const newProgress =
        (foundCorrectWords.length / correctWords.length) * 100;
      setProgress(newProgress);

      if (foundCorrectWords.length === correctWords.length) {
        setGameOver(true);
        setFeedback(
          commonWordMode
            ? `অভিনন্দন! আপনি সব সাধারণ বৈশিষ্ট্য খুঁজে পেয়েছেন!`
            : `অভিনন্দন! আপনি সব বৈশিষ্ট্য খুঁজে পেয়েছেন!`
        );

        // Trigger confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: [
            "#ff0000",
            "#00ff00",
            "#0000ff",
            "#ffff00",
            "#ff00ff",
            "#00ffff",
          ],
        });
      }
    } else {
      if (commonWordMode) {
        setFeedback(`ভুল! এটি সাধারণ বৈশিষ্ট্য নয়।`);
      } else {
        setFeedback(
          `ভুল! এটি ${wordList[currentWordSet].name[currentCategory]} এর বৈশিষ্ট্য নয়।`
        );
      }
    }
  };

  const getBoxColor = (word: string) => {
    if (!selectedWords.includes(word)) {
      if (
        showHint &&
        (commonWordMode
          ? wordList[currentWordSet].commonWords.includes(word)
          : wordList[currentWordSet].words[currentCategory].includes(word) ||
            wordList[currentWordSet].commonWords.includes(word))
      ) {
        return "bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 border-2 border-blue-500 dark:border-blue-400";
      }
      return "bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100";
    }
    if (wordList[currentWordSet].commonWords.includes(word)) {
      return "bg-yellow-500 text-white";
    }
    return wordList[currentWordSet].words[currentCategory].includes(word)
      ? "bg-green-500 text-white"
      : "bg-red-500 text-white";
  };

  const switchCategory = () => {
    setCurrentCategory((prev) => (prev === 0 ? 1 : 0));
    initializeGame();
  };

  const getRemainingCount = () => {
    const correctWords = commonWordMode
      ? [...wordList[currentWordSet].commonWords]
      : [...wordList[currentWordSet].words[currentCategory], ...wordList[currentWordSet].commonWords];

    const foundCorrectWords = selectedWords.filter((w) =>
      correctWords.includes(w)
    );
    return correctWords.length - foundCorrectWords.length;
  };

  const toggleCommonWordMode = () => {
    setCommonWordMode(!commonWordMode);
    setSelectedWords([]);
    setFeedback("");
    setProgress(0);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 p-3 sm:p-6 transition-colors duration-300">
          <div className="flex flex-col items-center mb-3 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-2 sm:mb-3 text-gray-800 dark:text-white">
              Word Game
            </h1>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <div className="flex items-center">
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mr-2">
                  {wordList[currentWordSet].name[0]}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={currentCategory === 1}
                    onChange={() => switchCategory()}
                    disabled={commonWordMode}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 ml-2">
                  {wordList[currentWordSet].name[1]}
                </span>
              </div>
              <div className="relative">
                <select
                  value={currentWordSet}
                  onChange={(e) => {
                    setCurrentWordSet(Number(e.target.value));
                    setCurrentCategory(0);
                    setCommonWordMode(false);
                  }}
                  className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 pr-8 text-sm sm:text-base text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {wordList.map((set, index) => (
                    <option key={index} value={index}>
                      {set.name.join(" / ")}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {getRemainingCount()}টি বৈশিষ্ট্য বাকি আছে
              </span>
            </div>
          </div>

          <div className="text-center mb-4 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200">
                  স্কোর: {score}
                </h2>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {showHint ? "ইঙ্গিত বন্ধ করুন" : "ইঙ্গিত দেখুন"}
                </button>
                <button
                  onClick={toggleCommonWordMode}
                  className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full transition-colors ${
                    commonWordMode
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {commonWordMode
                    ? "সাধারণ শব্দ মোড বন্ধ করুন"
                    : "শুধু সাধারণ শব্দ খুঁজুন"}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
                {commonWordMode
                  ? `${wordList[currentWordSet].name[0]} ও ${wordList[currentWordSet].name[1]} এর সাধারণ বৈশিষ্ট্যগুলি বেছে নিন!`
                  : `${wordList[currentWordSet].name[currentCategory]} এর বৈশিষ্ট্যগুলি বেছে নিন!`}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-4 mb-2">
                <div
                  className="bg-green-500 h-2 sm:h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progress)}% সম্পন্ন
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {gameWords.map((word, index) => (
              <div
                key={index}
                className={`${getBoxColor(
                  word
                )} p-2 sm:p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-105 text-center transform hover:rotate-1`}
                onClick={() => handleWordClick(word)}
              >
                <p className="text-sm sm:text-base font-semibold">{word}</p>
              </div>
            ))}
          </div>

          {feedback && (
            <div className="mt-4 sm:mt-6 text-center">
              <p
                className={`text-base sm:text-xl font-semibold ${
                  selectedWords.length > 0 &&
                  (wordList[currentWordSet].words[currentCategory].includes(
                    selectedWords[selectedWords.length - 1]
                  ) ||
                    wordList[currentWordSet].commonWords.includes(
                      selectedWords[selectedWords.length - 1]
                    ))
                    ? "text-green-500 dark:text-green-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {feedback}
              </p>
            </div>
          )}

          {gameOver && (
            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={initializeGame}
                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-teal-400 hover:border-teal-500 text-sm sm:text-base"
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
