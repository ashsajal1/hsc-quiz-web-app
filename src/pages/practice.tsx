import { useCQStore } from "@/store/useCqStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  GripVertical,
  Eye,
  EyeOff,
  Wand2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PracticeState {
  [key: string]: {
    words: string[];
    isCorrect: boolean | null;
    isSubmitted: boolean;
  };
}

function SortableWord({
  word,
  index,
  isSubmitted,
  isMoving,
}: {
  word: string;
  index: number;
  isSubmitted: boolean;
  isMoving?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${word}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 px-3 py-2 rounded-md shadow-sm border transition-all duration-200 ${
        isDragging
          ? "bg-primary/10 border-primary shadow-lg scale-105 z-50"
          : isMoving
          ? "bg-primary/20 border-primary shadow-md scale-105 animate-pulse"
          : "bg-background hover:shadow-md"
      } ${
        isSubmitted
          ? "cursor-default opacity-50"
          : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <GripVertical
        className={`h-4 w-4 ${
          isDragging || isMoving ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <span className="select-none truncate">{word}</span>
    </div>
  );
}

export default function Practice() {
  const {
    topics,
    chapters,
    selectedSubject,
    selectedChapter,
    filteredQuestions,
    setSubject,
    setChapter,
  } = useCQStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [practiceState, setPracticeState] = useState<PracticeState>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAutoArranging, setIsAutoArranging] = useState(false);
  const [movingWordIndex, setMovingWordIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset practice state when questions change
  useEffect(() => {
    setPracticeState({});
    setCurrentQuestionIndex(0);
  }, [filteredQuestions]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const questionState = currentQuestion
    ? practiceState[currentQuestion.id]
    : null;

  // Split answer into words and shuffle them
  const getShuffledWords = (answer: string) => {
    return answer.split(" ").sort(() => Math.random() - 0.5);
  };

  // Initialize words for current question if not already done
  useEffect(() => {
    if (currentQuestion && !practiceState[currentQuestion.id]) {
      setPracticeState((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          words: getShuffledWords(currentQuestion.answer),
          isCorrect: null,
          isSubmitted: false,
        },
      }));
    }
  }, [currentQuestion, practiceState]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !currentQuestion || !questionState || active.id === over.id)
      return;

    const oldIndex = questionState.words.findIndex(
      (word, index) => `${word}-${index}` === active.id
    );
    const newIndex = questionState.words.findIndex(
      (word, index) => `${word}-${index}` === over.id
    );

    if (oldIndex === undefined || newIndex === undefined) return;

    const newWords = arrayMove(questionState.words, oldIndex, newIndex);

    setPracticeState((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        words: newWords,
      },
    }));
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion) return;

    const userAnswer = questionState?.words.join(" ") || "";
    const isCorrect =
      userAnswer.trim().toLowerCase() ===
      currentQuestion.answer.trim().toLowerCase();

    setPracticeState((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        isCorrect,
        isSubmitted: true,
      },
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setPracticeState({});
    setCurrentQuestionIndex(0);
  };

  const handleAutoArrange = async () => {
    if (!currentQuestion || !questionState || isAutoArranging) return;

    setIsAutoArranging(true);
    setMovingWordIndex(null);

    // Get the correct answer words
    const correctWords = currentQuestion.answer.split(" ");
    const currentWords = [...questionState.words];
    
    // Create a sequence of moves
    const moves: { word: string; to: number }[] = [];
    
    // Calculate all the moves needed
    correctWords.forEach((correctWord, targetIndex) => {
      moves.push({ word: correctWord, to: targetIndex });
    });

    // Execute moves one by one with delay
    for (const move of moves) {
      const { word, to } = move;
      
      // Find the current position of this word (case-insensitive)
      const fromIndex = currentWords.findIndex(
        (w) => w.toLowerCase() === word.toLowerCase()
      );
      
      if (fromIndex !== -1) {
        // Highlight the word being moved
        setMovingWordIndex(fromIndex);

        // Remove the word from its current position
        const [movedWord] = currentWords.splice(fromIndex, 1);
        // Insert it at the target position
        currentWords.splice(to, 0, movedWord);

        // Update state
        setPracticeState((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            ...prev[currentQuestion.id],
            words: [...currentWords],
          },
        }));

        // Wait for 500ms before next move
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setMovingWordIndex(null);
    setIsAutoArranging(false);
  };

  const progress =
    filteredQuestions.length > 0
      ? (Object.keys(practiceState).length / filteredQuestions.length) * 100
      : 0;

  const correctAnswers = Object.values(practiceState).filter(
    (state) => state.isCorrect
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Practice Questions</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Arrange the words to form the correct answer
          </p>
        </div>
        <Badge variant="secondary" className="text-sm w-fit">
          {correctAnswers} / {Object.keys(practiceState).length} Correct
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 mb-6">
        {/* Subject Selection */}
        <div className="flex-1">
          <label
            htmlFor="subject-select"
            className="block mb-2 text-sm font-medium"
          >
            Select Subject:
          </label>
          <Select
            value={selectedSubject}
            onValueChange={(value) => setSubject(value)}
          >
            <SelectTrigger id="subject-select">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chapter Selection */}
        <div className="flex-1">
          <label
            htmlFor="chapter-select"
            className="block mb-2 text-sm font-medium"
          >
            Select Chapter:
          </label>
          <Select
            value={selectedChapter}
            onValueChange={(value) => setChapter(value)}
          >
            <SelectTrigger id="chapter-select">
              <SelectValue placeholder="Select a chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((chapter) => (
                <SelectItem key={chapter} value={chapter}>
                  {chapter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredQuestions.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {Math.round(progress)}%
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-lg sm:text-xl">Question {currentQuestionIndex + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="gap-2"
                      >
                        {showAnswer ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            <span className="hidden sm:inline">Hide Answer</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Show Answer</span>
                          </>
                        )}
                      </Button>
                      <Badge variant="outline">
                        {currentQuestionIndex + 1} / {filteredQuestions.length}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-base sm:text-lg mt-2">
                    {currentQuestion?.question}
                  </CardDescription>
                  {showAnswer && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm font-medium">Correct Answer:</p>
                      <p className="text-sm">{currentQuestion?.answer}</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="p-3 sm:p-4 min-h-[120px] bg-muted/50 rounded-lg">
                      <SortableContext
                        items={
                          questionState?.words.map(
                            (word, index) => `${word}-${index}`
                          ) || []
                        }
                        strategy={horizontalListSortingStrategy}
                      >
                        <div className="flex flex-wrap gap-2">
                          {questionState?.words.map((word, index) => (
                            <SortableWord
                              key={`${word}-${index}`}
                              word={word}
                              index={index}
                              isSubmitted={questionState?.isSubmitted || false}
                              isMoving={index === movingWordIndex}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  </DndContext>

                  {questionState?.isSubmitted && (
                    <Alert
                      variant={
                        questionState.isCorrect ? "default" : "destructive"
                      }
                      className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
                    >
                      <AlertDescription className="flex items-center gap-2">
                        {questionState.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {questionState.isCorrect
                          ? "Correct answer!"
                          : `Incorrect. The correct answer is: ${currentQuestion?.answer}`}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex-1 sm:flex-none"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextQuestion}
                        disabled={
                          currentQuestionIndex === filteredQuestions.length - 1
                        }
                        className="flex-1 sm:flex-none"
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {!questionState?.isSubmitted ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleAutoArrange}
                            className="gap-2 flex-1 sm:flex-none"
                            disabled={isAutoArranging}
                          >
                            <Wand2 className={`h-4 w-4 ${isAutoArranging ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">{isAutoArranging ? "Arranging..." : "Auto Arrange"}</span>
                          </Button>
                          <Button 
                            onClick={handleAnswerSubmit}
                            disabled={isAutoArranging}
                            className="flex-1 sm:flex-none"
                          >
                            Submit Answer
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="gap-2 flex-1 sm:flex-none"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="hidden sm:inline">Reset Practice</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No questions available for this selection.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
