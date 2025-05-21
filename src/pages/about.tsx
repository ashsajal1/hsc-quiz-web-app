import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Linkedin, BookOpen, Lightbulb, Users } from "lucide-react";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container max-w-4xl mx-auto p-4 sm:p-6 space-y-8"
    >
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold">About HSC Quiz App</h1>
        <p className="text-muted-foreground text-lg">
          Your comprehensive study companion for HSC preparation
        </p>
      </div>

      {/* Purpose Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Purpose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The HSC Quiz App is designed to help students prepare for their Higher Secondary Certificate
            examinations through interactive practice and assessment. Our platform provides a comprehensive
            collection of questions across various subjects, helping students:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Practice with subject-specific questions</li>
            <li>Test their knowledge through interactive quizzes</li>
            <li>Review and understand correct answers</li>
            <li>Track their progress over time</li>
          </ul>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Interactive Quizzes</h3>
              <p className="text-sm text-muted-foreground">
                Engage with dynamic quizzes that adapt to your learning pace
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Subject Coverage</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive coverage of all HSC subjects and chapters
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your performance and identify areas for improvement
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Practice Mode</h3>
              <p className="text-sm text-muted-foreground">
                Practice with word arrangement exercises for better understanding
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Developer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold">SA</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Sajal</h3>
              <p className="text-muted-foreground">Full Stack Developer</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild>
                <a href="https://github.com/ashsajal1" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://twitter.com/ashsajal1" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://linkedin.com/in/ashsajal" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Have questions or suggestions? Feel free to reach out through any of the social media links above
            or create an issue on our GitHub repository.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
