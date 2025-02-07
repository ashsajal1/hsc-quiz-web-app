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
import { Link } from "react-router-dom";

export default function SavedPage() {
  const savedExams = [
    {
      id: 1,
      subject: "chemistry-1",
      chpater: 1,
    },
    {
      id: 2,
      subject: "chemistry-1",
      chpater: 2,
    },
  ];

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
          {savedExams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.id}</TableCell>
              <TableCell>{exam.subject}</TableCell>
              <TableCell className="text-right">{exam.chpater}</TableCell>
              <TableCell className="text-right">
                <Link to={`/exam/${exam.subject}-${exam.chpater}-${exam.id}`}>
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
