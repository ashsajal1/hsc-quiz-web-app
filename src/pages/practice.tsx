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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface PracticeState {
  [key: string]: {
    words: string[];
    isCorrect: boolean | null;
    isSubmitted: boolean;
  };
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !currentQuestion) return;

    const newWords = Array.from(questionState?.words || []);
    const [removed] = newWords.splice(result.source.index, 1);
    newWords.splice(result.destination.index, 0, removed);

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
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Practice Questions</h1>
          <p className="text-muted-foreground">
            Arrange the words to form the correct answer
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {correctAnswers} / {Object.keys(practiceState).length} Correct
        </Badge>
      </div>

      <div className="flex items-center gap-4 mb-6">
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
            <Progress value={progress} className="h-2" />
            <span className="text-sm text-muted-foreground">
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
                  <div className="flex items-center justify-between">
                    <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
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
                            Hide Answer
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Show Answer
                          </>
                        )}
                      </Button>
                      <Badge variant="outline">
                        {currentQuestionIndex + 1} / {filteredQuestions.length}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-lg mt-2">
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
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="words" direction="horizontal">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex flex-wrap gap-2 p-4 min-h-[60px] bg-muted/50 rounded-lg"
                        >
                          {questionState?.words.map((word, index) => (
                            <Draggable
                              key={`${word}-${index}`}
                              draggableId={`${word}-${index}`}
                              index={index}
                              isDragDisabled={questionState?.isSubmitted}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center gap-2 px-3 py-2 bg-background rounded-md shadow-sm border ${
                                    questionState?.isSubmitted
                                      ? "cursor-default"
                                      : "cursor-grab hover:shadow-md"
                                  }`}
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <span>{word}</span>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  {questionState?.isSubmitted && (
                    <Alert
                      variant={
                        questionState.isCorrect ? "default" : "destructive"
                      }
                      className="mt-4"
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

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
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
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {!questionState?.isSubmitted ? (
                        <Button onClick={handleAnswerSubmit}>
                          Submit Answer
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset Practice
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
