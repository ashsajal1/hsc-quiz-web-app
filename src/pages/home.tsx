import { ShinyButton } from "@/components/magicui/shiny-button";
import { McqCarousel } from "@/components/mcq-carousal";
import TopicCard from "@/components/topic-card";
import { topics } from "@/lib/data";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <McqCarousel />
      <div className="rounded p-2">
        <h1 className="font-bold text-2xl block">Explore pages</h1>
        <div className="mt-3 flex items-center gap-2">
          <Link to={"/preview"}>
            <ShinyButton>Preview MCQs</ShinyButton>
          </Link>
          <Link to={"/question"}>
            <ShinyButton>Question</ShinyButton>
          </Link>
          <Link to={"/puzzle"}>
            <ShinyButton>Puzzle game</ShinyButton>
          </Link>
        </div>
      </div>
      <p className="my-4 font-bold">Select Topic</p>
      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => (
          <TopicCard key={topic.subject} topic={topic} />
        ))}
      </div>
    </div>
  );
}
