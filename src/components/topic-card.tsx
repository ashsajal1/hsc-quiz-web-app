import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Ensure this component exists in your project
import { useQuizStore } from "@/store/useQuizStore";
import { Link } from "react-router-dom";
import { Topic } from "@/lib/data";

// Component for each topic card with chapter badges
export default function TopicCard({ topic }: { topic: Topic }) {
  const { getChaptersBySubject } = useQuizStore();
  // Assume getChaptersBySubject returns an array of chapters for the given subject.
  // Each chapter object is assumed to have an `id` and `name`.
  const chapters = getChaptersBySubject(topic.subject);
  const [selectedChapter, setSelectedChapter] = useState<null | string>(null);

  return (
    <Card className="mb-2">
      <CardContent>
        <CardHeader>
          <CardTitle>{topic.name}</CardTitle>
        </CardHeader>
        {/* Render the chapters as badges */}
        <div className="flex flex-wrap gap-2 my-2">
          <p className="font-bold">Select Chapter : </p>
          {chapters.map((chapter) => (
            <Badge
              key={chapter}
              onClick={() => setSelectedChapter(chapter)}
              className={`cursor-pointer px-2 py-1 rounded ${
                selectedChapter === chapter
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {chapter}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {/* Enable the button only when a chapter is selected */}
        <Link
          to={`/quiz?subject=${topic.subject}&chapter=${selectedChapter || 1}`}
        >
          <Button>Play</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
