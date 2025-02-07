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

interface ExamProps {
  id: number;
  subject: string;
  chapter: string;
  questions: Questions;
}

export default function SavedPage() {
  let savedExams;
  try {
    savedExams = JSON.parse(localStorage.getItem("savedExams") ?? "[]");
    if (!Array.isArray(savedExams)) {
      console.error("Expected savedExams to be an array but got:", savedExams);
      savedExams = []; // Fallback to an empty array
    }
  } catch (error) {
    console.error("Error parsing savedExams from localStorage:", error);
    savedExams = [];
  }

  return (
    <div>
      <Table>
        <TableCaption>A list saved exams.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="text-right">Chapter</TableHead>
            <TableHead className="text-right">Play</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {savedExams.map((exam: ExamProps) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.id}</TableCell>
              <TableCell>{exam.subject}</TableCell>
              <TableCell className="text-right">{exam.chapter}</TableCell>
              <TableCell className="text-right">
                <Link to={`/exam/${exam.subject}-${exam.chapter}-${exam.id}`}>
                  <Button>Play</Button>
                </Link>
                <Button className="ml-2" variant="destructive">
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
