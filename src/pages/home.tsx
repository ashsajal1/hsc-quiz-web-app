import { McqCarousel } from "@/components/mcq-carousal";
import TopicCard from "@/components/topic-card";
import { topics } from "@/lib/data";

export default function Home() {
  return (
    <div>
      <McqCarousel />
      <p className="my-4 font-bold">Select Topic</p>
      <div className="grid grid-cols-2 gap-4">
        
        {topics.map((topic) => (
          <TopicCard key={topic.subject} topic={topic} />
        ))}
      </div>
    </div>
  );
}
