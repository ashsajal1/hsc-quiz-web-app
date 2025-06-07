import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, BarChart3, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const stats = [
  { name: 'Total Questions', value: '1,254', icon: BookOpen },
  { name: 'Time Spent', value: '12h 45m', icon: Clock },
  { name: 'Highest Streak', value: '7 days', icon: Award },
  { name: 'Accuracy', value: '82%', icon: BarChart3 },
];

const recentActivities = [
  { id: 1, topic: 'Physics 1st Paper', score: 85, total: 100, date: '10 min ago', correct: true },
  { id: 2, topic: 'Chemistry 1st Paper', score: 72, total: 100, date: '1 hour ago', correct: false },
  { id: 3, topic: 'Biology 1st Paper', score: 91, total: 100, date: '3 hours ago', correct: true },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Student! 👋</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Here's your learning progress summary</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <stat.icon className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/preview">
            <Button className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <BookOpen className="w-6 h-6" />
              <span>Practice MCQs</span>
            </Button>
          </Link>
          <Link to="/drop-game">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <Award className="w-6 h-6" />
              <span>Play Drop Game</span>
            </Button>
          </Link>
          <Link to="/question">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <BookOpen className="w-6 h-6" />
              <span>Take a Quiz</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link to="/history" className="text-sm text-primary hover:underline flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {activity.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.topic}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{activity.score}/{activity.total}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round((activity.score / activity.total) * 100)}% accuracy
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
