import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuizStore } from "@/store/useQuizStore";
import { Link } from "react-router-dom";
import { Topic } from "@/lib/data";
import { BookOpen, Play } from "lucide-react";

// Component for each topic card with chapter badges
export default function TopicCard({ topic }: { topic: Topic }) {
  const { getChaptersBySubject } = useQuizStore();
  // Assume getChaptersBySubject returns an array of chapters for the given subject.
  // Each chapter object is assumed to have an `id` and `name`.
  const chapters = getChaptersBySubject(topic.subject);
  const [selectedChapter, setSelectedChapter] = useState<null | string>(null);

  return (
    <Card className="mb-4 transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <CardTitle className="text-xl font-bold">{topic.name}</CardTitle>
          </div>
        </CardHeader>
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Select Chapter:
          </p>
          <div className="flex flex-wrap gap-2">
            {chapters.map((chapter) => (
              <Badge
                key={chapter}
                onClick={() => setSelectedChapter(chapter)}
                className={`cursor-pointer px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 ${
                  selectedChapter === chapter
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {chapter}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Link
          to={`/quiz?subject=${topic.subject}&chapter=${selectedChapter || 1}`}
          className="w-full"
        >
          <Button 
            className="w-full gap-2 transition-all duration-200 hover:scale-[1.02]"
            disabled={!selectedChapter}
          >
            <Play className="h-4 w-4" />
            {selectedChapter ? `Start ${selectedChapter} Quiz` : "Select a Chapter"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
