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
    "Physics 1st",
    "Chemistry 1st",
    "Biology 1st",
    "Math 1st",
    "ICT",
  ];
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => (
          <Card className="mb-2" key={topic}>
            <CardContent>
              <CardHeader>
                <CardTitle>{topic}</CardTitle>
              </CardHeader>

              <CardFooter>
                <Link to={`/quiz/${topic.split(" ").join("-")}`}><Button>Start</Button></Link>
              </CardFooter>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
