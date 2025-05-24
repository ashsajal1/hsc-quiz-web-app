import React, { useState, useEffect } from "react";

const wordList = [
  {
    name: ["শৈবাল", "ছত্রাক"],
    words: [
      [
        "এককোষী",
        "বহুকোষী",
        "খাদ্য শর্করা",
        "রেণুথলি সর্বদাই এককোষী",
        "জননাঙ্গে বন্ধ্যা কোষের আবরণী নেই",
        "সমাঙ্গদেহি",

        "কোষপ্রাচীর - সেলুলোজ",
        "সুস্পষ্ট জনুক্রম অনুপস্থিত",
        "৬০ ভাগ সালোকসংশ্লেষণ করে",
        "জলীয় বা আর্দ্র পরিবেশে জন্মায়।",
      ],
      [
        "অসবুজ",
        "মৃতজীবী",
        "পরজীবী",
        "মিথোজীবী",
        "খাদ্য - গ্লাইকজেন",
        "শোষণ প্রক্রিয়া",
        "কোষপ্রাচীর কাইতিন",
        "ক্লোরোফিল নেই",
        "জাইগোট এ মিয়োসিস ঘটে",
        "তীব্র অভিযোজন ক্ষমতা",
        "দেহ হাইফি দারা গঠিত",
        "কোষ দুইটি অংশে বিভক্ত",
        "কোষ ঝিল্লির প্রধান উপাদান ergosterol",
        "দেহ - দুইটি অংশে বিভক্ত",
        "দেহের জনন অংশ  ফ্রুটবডি",
      ],
    ],
    commonWords: [
      "ভাস্কুলার টিস্যু নেই",
      "জাইগোট বহুকোষী ভ্রূণে পরিণত হয় না",
      "অপুষ্পক",
      "জননাঙ্গ এককোষী",
      "সুকেন্দ্রিক",
      "স্পোরের মাধ্যমে বিস্তার",
      "থ্যালোফাইটা",
      "জনন - অঙ্গজ, যৌন, অযৌন",
    ],
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
  const [commonWordMode, setCommonWordMode] = useState(false);

  const initializeGame = () => {
    const allWords = [
      ...wordList[0].words[0],
      ...wordList[0].words[1],
      ...wordList[0].commonWords,
    ];
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    setGameWords(shuffledWords);
    setSelectedWords([]);
    setFeedback("");
    setGameOver(false);
    setProgress(0);
    setShowHint(false);
    setCommonWordMode(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleWordClick = (word: string) => {
    if (gameOver || selectedWords.includes(word)) return;

    const isCommonWord = wordList[0].commonWords.includes(word);
    
    // Check if word is correct based on mode
    let isCorrect = false;
    if (commonWordMode) {
      isCorrect = isCommonWord;
    } else {
      isCorrect = wordList[0].words[currentCategory].includes(word) || isCommonWord;
    }
    
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

      // Determine which words are considered correct based on the mode
      const correctWords = commonWordMode 
        ? [...wordList[0].commonWords]
        : [...wordList[0].words[currentCategory], ...wordList[0].commonWords];
      
      const foundCorrectWords = newSelectedWords.filter((w) =>
        correctWords.includes(w)
      );
      const newProgress =
        (foundCorrectWords.length / correctWords.length) * 100;
      setProgress(newProgress);

      if (foundCorrectWords.length === correctWords.length) {
        setGameOver(true);
        setFeedback(commonWordMode 
          ? `অভিনন্দন! আপনি সব সাধারণ বৈশিষ্ট্য খুঁজে পেয়েছেন!` 
          : `অভিনন্দন! আপনি সব বৈশিষ্ট্য খুঁজে পেয়েছেন!`);
      }
    } else {
      if (commonWordMode) {
        setFeedback(`ভুল! এটি সাধারণ বৈশিষ্ট্য নয়।`);
      } else {
        setFeedback(
          `ভুল! এটি ${wordList[0].name[currentCategory]} এর বৈশিষ্ট্য নয়।`
        );
      }
    }
  };

  const getBoxColor = (word: string) => {
    if (!selectedWords.includes(word)) {
      if (
        showHint &&
        (commonWordMode 
          ? wordList[0].commonWords.includes(word)
          : (wordList[0].words[currentCategory].includes(word) ||
             wordList[0].commonWords.includes(word)))
      ) {
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
    const correctWords = commonWordMode
      ? [...wordList[0].commonWords]
      : [...wordList[0].words[currentCategory], ...wordList[0].commonWords];
    
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900 p-3 sm:p-6 transition-colors duration-300">
          <div className="flex flex-col items-center mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-2 sm:mb-4 text-gray-800 dark:text-white">
             Word Game
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mr-2">শৈবাল</span>
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
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 ml-2">ছত্রাক</span>
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
                  {showHint ? 'ইঙ্গিত বন্ধ করুন' : 'ইঙ্গিত দেখুন'}
                </button>
                <button
                  onClick={toggleCommonWordMode}
                  className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full transition-colors ${
                    commonWordMode 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {commonWordMode ? 'সাধারণ শব্দ মোড বন্ধ করুন' : 'শুধু সাধারণ শব্দ খুঁজুন'}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
                {commonWordMode ? 'শৈবাল ও ছত্রাক এর সাধারণ বৈশিষ্ট্যগুলি বেছে নিন!' : `${wordList[0].name[currentCategory]} এর বৈশিষ্ট্যগুলি বেছে নিন!`}
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
                className={`${getBoxColor(word)} p-2 sm:p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-105 text-center transform hover:rotate-1`}
                onClick={() => handleWordClick(word)}
              >
                <p className="text-sm sm:text-base font-semibold">{word}</p>
              </div>
            ))}
          </div>

          {feedback && (
            <div className="mt-4 sm:mt-6 text-center">
              <p className={`text-base sm:text-xl font-semibold ${
                selectedWords.length > 0 && 
                (wordList[0].words[currentCategory].includes(selectedWords[selectedWords.length - 1]) || 
                wordList[0].commonWords.includes(selectedWords[selectedWords.length - 1]))
                  ? 'text-green-500 dark:text-green-400' 
                  : 'text-red-500 dark:text-red-400'
              }`}>
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
