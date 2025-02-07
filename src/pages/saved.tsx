import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Questions } from "@/lib/type";
import { Link } from "react-router-dom";

export interface ExamProps {
  id: number;
  subject: string;
  chapter: string;
  questions: Questions;
}

export default function SavedPage() {
  // Use state to store saved exams so we can update the UI immediately.
  const [savedExams, setSavedExams] = useState<ExamProps[]>([]);

  // Load saved exams from localStorage when the component mounts.
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
    }
  }, []);

  // Attractive delete function with a confirmation prompt.
  const handleDelete = (examId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam? This action cannot be undone."
    );

    if (confirmDelete) {
      // Filter out the exam to delete.
      const updatedExams = savedExams.filter((exam) => exam.id !== examId);
      // Update localStorage with the new exams array.
      localStorage.setItem("savedExams", JSON.stringify(updatedExams));
      // Update the state so the UI reflects the change.
      setSavedExams(updatedExams);

      // Optional: show a toast or animation indicating success.
      // toast.success("Exam deleted successfully!");
    }
  };

  return (
    <div>
      <Table>
        <TableCaption>A list of saved exams.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="text-right">Chapter</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {savedExams.map((exam: ExamProps) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.id}</TableCell>
              <TableCell>{exam.subject}</TableCell>
              <TableCell className="text-right">{exam.chapter}</TableCell>
              <TableCell className="text-right">
                <Link to={`/exam?examId=${exam.id}`}>
                  <Button>Play</Button>
                </Link>
                <Button
                  onClick={() => handleDelete(exam.id)}
                  className="ml-2"
                  variant="destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">{savedExams.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
