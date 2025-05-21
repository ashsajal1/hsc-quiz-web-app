import { McqCarousel } from "@/components/mcq-carousal";
import TopicCard from "@/components/topic-card";
import { topics } from "@/lib/data";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Gamepad2, PenTool, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-8 space-y-12"
    >
      <McqCarousel />
      
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Learning Tools
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent ml-4" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/preview" className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Button variant="outline" className="w-full h-full flex items-center justify-center gap-2 text-lg group-hover:bg-primary/5">
                <BookOpen className="w-5 h-5" />
                Preview MCQs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </Link>
          
          <Link to="/question" className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Button variant="outline" className="w-full h-full flex items-center justify-center gap-2 text-lg group-hover:bg-primary/5">
                <PenTool className="w-5 h-5" />
                Question
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </Link>
          
          <Link to="/puzzle" className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Button variant="outline" className="w-full h-full flex items-center justify-center gap-2 text-lg group-hover:bg-primary/5">
                <Gamepad2 className="w-5 h-5" />
                Puzzle Game
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </Link>
          
          <Link to="/practice" className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Button variant="outline" className="w-full h-full flex items-center justify-center gap-2 text-lg group-hover:bg-primary/5">
                <PlayCircle className="w-5 h-5" />
                Practice
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Study Topics
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent ml-4" />
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {topics.map((topic, index) => (
            <motion.div
              key={topic.subject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TopicCard topic={topic} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </motion.div>
  );
}
