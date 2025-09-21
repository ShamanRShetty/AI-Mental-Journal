import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Loader2, TrendingUp, Calendar, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const moodData = useQuery(api.journals.getMoodData, {});
  const entries = useQuery(api.journals.getUserEntries, {});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const formatMoodData = () => {
    if (!moodData) return [];
    
    // Group by date and average mood scores for each day
    const groupedData = moodData.reduce((acc: any, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = { date, scores: [], count: 0 };
      }
      acc[date].scores.push(entry.moodScore);
      acc[date].count++;
      return acc;
    }, {});

    return Object.values(groupedData).map((day: any) => ({
      date: day.date,
      mood: day.scores.reduce((sum: number, score: number) => sum + score, 0) / day.count,
      entries: day.count,
    }));
  };

  const chartData = formatMoodData();
  const totalEntries = entries?.length || 0;
  const averageMood = moodData && moodData.length > 0 
    ? moodData.reduce((sum, entry) => sum + entry.moodScore, 0) / moodData.length 
    : 0;

  const getMoodEmoji = (score: number) => {
    if (score > 0.3) return "😊";
    if (score > 0) return "🙂";
    if (score > -0.3) return "😐";
    return "😔";
  };

  const getMoodLabel = (score: number) => {
    if (score > 0.3) return "Positive";
    if (score > 0) return "Slightly Positive";
    if (score > -0.3) return "Neutral";
    return "Needs Attention";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Dashboard</span>
              </div>
            </div>
            
            <Button asChild>
              <Link to="/journal">New Entry</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Entries</p>
                    <p className="text-3xl font-bold text-gray-900">{totalEntries}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Mood</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-3xl font-bold text-gray-900">
                        {getMoodEmoji(averageMood)}
                      </p>
                      <p className="text-sm text-gray-600">{getMoodLabel(averageMood)}</p>
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Days Active</p>
                    <p className="text-3xl font-bold text-gray-900">{chartData.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mood Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Mood Trends Over Time
              </CardTitle>
              <p className="text-gray-600">
                Track your emotional journey and identify patterns in your mood.
              </p>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[-1, 1]}
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => {
                          if (value > 0.5) return "Very Positive";
                          if (value > 0) return "Positive";
                          if (value > -0.5) return "Neutral";
                          return "Negative";
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value: number) => [
                          `${getMoodEmoji(value)} ${getMoodLabel(value)}`,
                          "Mood"
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="url(#gradient)"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No data yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start journaling to see your mood trends over time.
                    </p>
                    <Button asChild>
                      <Link to="/journal">Write Your First Entry</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Insights */}
        {entries && entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Recent Reflections
                </CardTitle>
                <p className="text-gray-600">
                  Your latest AI-generated insights and reflections.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {entries.slice(0, 3).map((entry) => (
                    <div key={entry._id} className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">
                          {new Date(entry._creationTime).toLocaleDateString()}
                        </span>
                        <span className="text-2xl">{getMoodEmoji(entry.moodScore)}</span>
                      </div>
                      <p className="text-gray-800 leading-relaxed">{entry.reflection}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
