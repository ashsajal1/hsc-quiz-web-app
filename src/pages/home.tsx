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

const topics = [
  { name: "Physics 1st", subject: "physics-1" },
  { name: "Physics 2nd", subject: "physics-2" },
  { name: "Biology 1st", subject: "biology-1" },
  { name: "Biology 2nd", subject: "biology-2" },
  { name: "Chemistry 1st", subject: "chemistry-1" },
  { name: "Chemistry 2nd", subject: "chemistry-2" },
  { name: "ICT", subject: "ict" },
  { name: "Bangla", subject: "bangla" },
];

type Topic = (typeof topics)[0];

// Component for each topic card with chapter badges
function TopicCard({ topic }: { topic: Topic }) {
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
        <Link to={`/quiz?subject=${topic.subject}&chapter=${selectedChapter}`}>
          <Button disabled={!selectedChapter}>Play</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function Home() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => (
          <TopicCard key={topic.subject} topic={topic} />
        ))}
      </div>
    </div>
  );
}
