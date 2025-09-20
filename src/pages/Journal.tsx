import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Heart, Send, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";

export default function Journal() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [journalText, setJournalText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentReflection, setCurrentReflection] = useState<string | null>(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  const analyzeEntry = useAction(api.ai.analyzeJournalEntry);
  const entries = useQuery(api.journals.getUserEntries);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) {
      toast.error("Please write something before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await analyzeEntry({ text: journalText });
      setCurrentReflection(result.reflection);
      
      // Show crisis alert if mood is very negative
      if (result.moodScore < -0.6) {
        setShowCrisisAlert(true);
      }
      
      setJournalText("");
      toast.success("Journal entry saved successfully!");
    } catch (error) {
      console.error("Error submitting journal entry:", error);
      toast.error("Failed to save journal entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
                <span className="text-xl font-bold tracking-tight">Journal</span>
              </div>
            </div>
            
            <Button variant="outline" asChild>
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Crisis Alert */}
        {showCrisisAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-2">We're here for you</h3>
                    <p className="text-orange-800 mb-4">
                      It sounds like you're going through a difficult time. Remember that you're not alone, and help is available.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                      <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
                      <p><strong>Teen Line:</strong> 1-800-852-8336</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setShowCrisisAlert(false)}
                    >
                      I understand
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Journal Entry Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  How are you feeling today?
                </CardTitle>
                <p className="text-gray-600">
                  Take a moment to express your thoughts and emotions. This is your safe space.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write about your day, your feelings, your thoughts... anything that's on your mind."
                    className="min-h-[300px] resize-none text-base leading-relaxed"
                    disabled={isSubmitting}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting || !journalText.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Entry
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Reflection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-lg h-fit">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  AI Reflection
                </CardTitle>
                <p className="text-gray-600">
                  Receive empathetic insights about your journal entry.
                </p>
              </CardHeader>
              <CardContent>
                {currentReflection ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg"
                  >
                    <p className="text-gray-800 leading-relaxed">{currentReflection}</p>
                  </motion.div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg text-center">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Submit a journal entry to receive your personalized reflection.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Entries */}
            {entries && entries.length > 0 && (
              <Card className="shadow-lg mt-8">
                <CardHeader>
                  <CardTitle className="text-xl font-bold tracking-tight">
                    Recent Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {entries.slice(0, 5).map((entry) => (
                      <div key={entry._id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(entry._creationTime).toLocaleDateString()}
                        </p>
                        <p className="text-gray-800 text-sm line-clamp-3">
                          {entry.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
