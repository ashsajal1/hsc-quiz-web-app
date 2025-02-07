import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Home() {
  const topics = [
    {
      name: "Physics 1st",
      subject: "physics-1",
    },
    {
      name: "Physics 2nd",
      subject: "physics-2",
    },
    {
      name: "Biology 1st",
      subject: "biology-1",
    },
    {
      name: "Biology 2nd",
      subject: "biology-2",
    },
    {
      name: "Chemistry 1st",
      subject: "chemistry-1",
    },
    {
      name: "Chemistry 2nd",
      subject: "chemistry-2",
    },
    {
      name: "ICT",
      subject: "ict",
    },
    {
      name: "Bangla",
      subject: "bangla",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => (
          <Card className="mb-2" key={topic.subject}>
            <CardContent>
              <CardHeader>
                <CardTitle>{topic.name}</CardTitle>
              </CardHeader>

              <CardFooter>
                <Link to={`/quiz?subject=${topic.subject}`}>
                  <Button>Start</Button>
                </Link>
              </CardFooter>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
