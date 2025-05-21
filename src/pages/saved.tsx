import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Questions } from "@/lib/type";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Trash2, BookOpen } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export interface ExamProps {
  id: number;
  subject: string;
  chapter: string;
  questions: Questions;
}

export default function SavedPage() {
  const [savedExams, setSavedExams] = useState<ExamProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const exams = JSON.parse(localStorage.getItem("savedExams") ?? "[]");
      if (Array.isArray(exams)) {
        setSavedExams(exams);
      } else {
        console.error("Expected savedExams to be an array but got:", exams);
        setSavedExams([]);
      }
    } catch (error) {
      console.error("Error parsing savedExams from localStorage:", error);
      setSavedExams([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = (examId: number) => {
    const updatedExams = savedExams.filter((exam) => exam.id !== examId);
    localStorage.setItem("savedExams", JSON.stringify(updatedExams));
    setSavedExams(updatedExams);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Saved Exams</h1>
          <p className="text-muted-foreground">
            Review and manage your saved exam attempts
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {savedExams.length} {savedExams.length === 1 ? "Exam" : "Exams"}
        </Badge>
      </div>

      {savedExams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/50"
        >
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Saved Exams</h3>
          <p className="text-muted-foreground mb-4">
            Your saved exams will appear here. Complete an exam to save it for
            later review.
          </p>
          <Link to="/exam">
            <Button>Start an Exam</Button>
          </Link>
        </motion.div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <AnimatePresence>
                {savedExams.map((exam: ExamProps) => (
                  <motion.tr
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TableCell className="font-medium">#{exam.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{exam.chapter}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {exam.questions.length} questions
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/exam?examId=${exam.id}`}>
                          <Button size="sm" className="gap-2">
                            <Play className="h-4 w-4" />
                            Play
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this exam? This
                                action cannot be undone.
                                <div className="mt-4 space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline">
                                      {exam.subject}
                                    </Badge>
                                    <Badge variant="secondary">
                                      {exam.chapter}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {exam.questions.length} questions
                                  </p>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(exam.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>

            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total Saved Exams</TableCell>
                <TableCell className="text-right" colSpan={2}>
                  {savedExams.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
