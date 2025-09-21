import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CrisisSupport from "@/components/CrisisSupport";
import { useAuth } from "@/hooks/use-auth";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { motion } from "framer-motion";
import { BookOpen, BarChart3, Heart, ArrowRight, Sparkles, AlertTriangle, Moon, Sun, Languages } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuthenticated, isLoading, signOut, user } = useAuth();
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch { return false; }
  });
  const [lang, setLang] = useState<'en' | 'hi' | 'es'>(() => {
    try {
      const saved = localStorage.getItem("lang");
      return saved === "en" || saved === "hi" || saved === "es" ? saved : "en";
    } catch { return "en"; }
  });

  // Add missing local UI state
  const [showGuestBanner, setShowGuestBanner] = useState<boolean>(false);
  const [crisisSupportOpen, setCrisisSupportOpen] = useState<boolean>(false);
  const [overviewOpen, setOverviewOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (dark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch {}
  }, [dark]);

  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {}
  }, [lang]);

  // Ensure page starts at top on initial load/refresh
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {}
  }, []);

  // Hide the guest banner after a full reload by clearing the 'wasGuest' flag
  useEffect(() => {
    try {
      const nav = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      const isReload = nav && nav[0] && nav[0].type === "reload";
      if (isReload) {
        sessionStorage.removeItem("wasGuest");
      }
    } catch {}
  }, []);

  // Auto sign out anonymous users on Home load/refresh so guest mode doesn't persist
  useEffect(() => {
    if (!isLoading && user && user.isAnonymous) {
      (async () => {
        try {
          // Remember guest mode for this session before signing out
          try {
            sessionStorage.setItem("wasGuest", "true");
          } catch {}
          await signOut();
        } catch (e) {
          console.error("Auto sign-out failed:", e);
        }
      })();
    }
  }, [isLoading, user, signOut]);

  useEffect(() => {
    try {
      const visited = sessionStorage.getItem("visitedJournal") === "true";
      const wasGuest = sessionStorage.getItem("wasGuest") === "true";
      setShowGuestBanner(Boolean(visited && (user?.isAnonymous || wasGuest)));
    } catch {
      setShowGuestBanner(false);
    }
  }, [user]);

  const features = [
    {
      icon: BookOpen,
      title: "Private Journaling",
      description: "Express your thoughts and feelings in a safe, private space designed just for you."
    },
    {
      icon: Heart,
      title: "AI Reflections",
      description: "Receive empathetic, personalized reflections that help you understand your emotions better."
    },
    {
      icon: BarChart3,
      title: "Mood Tracking",
      description: "Visualize your emotional journey over time with beautiful, insightful charts."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 dark:bg-gray-900/80 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Mental Wellness Journal</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Always show Need Help Now, even while auth is loading */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCrisisSupportOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30 whitespace-normal break-words text-center flex-wrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 dark:focus-visible:ring-red-500"
                aria-label="Open crisis support resources"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Need Help Now
              </Button>

              {/* Feature toggles in navbar */}
              {flags.darkModeToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDark((d) => !d)}
                  aria-label="Toggle dark mode"
                  title="Toggle dark mode"
                  className="hidden sm:inline-flex"
                >
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              )}
              {flags.i18nToggle && (
                <div className="hidden sm:flex items-center gap-2">
                  <Languages className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as 'en' | 'hi' | 'es')}
                    className="text-sm border rounded-md px-2 py-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring bg-background"
                    aria-label="Language"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              )}

              {/* Show the rest after auth resolves */}
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-3">
                      <Button variant="ghost" asChild>
                        <Link to="/journal">Journal</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                      {user && !user.isAnonymous && (
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              await signOut();
                              toast.success("Signed out");
                              navigate("/");
                            } catch (e) {
                              console.error(e);
                              toast.error("Failed to sign out, please try again.");
                            }
                          }}
                        >
                          Sign out
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Button asChild>
                        <Link to="/auth">Get Started</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Guest Mode Banner on Home */}
      {showGuestBanner && (
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  You're in guest mode — your progress isn't saved.
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Sign in with email to securely save your journal and mood history.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="whitespace-normal break-words text-center flex-wrap"
                onClick={() => {
                  try {
                    sessionStorage.setItem("fromSignInToSave", "true");
                  } catch {}
                  navigate("/auth");
                }}
              >
                Sign in to save
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Your mental wellness companion</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Journal Your Way to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Better Mental Health</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              A safe, private space for youth to express their thoughts, receive AI-powered empathetic reflections, 
              and track their emotional journey over time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate(isAuthenticated ? "/journal" : "/auth")}
              >
                {isAuthenticated ? "Start Journaling" : "Get Started Free"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => setOverviewOpen(true)}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Everything you need for mental wellness
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform combines journaling, AI insights, and mood tracking to support your mental health journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white dark:text-white mb-6">
              Ready to start your wellness journey?
            </h2>
            <p className="text-xl text-blue-100 dark:text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of youth who are already improving their mental health through mindful journaling.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6"
              onClick={() => navigate(isAuthenticated ? "/journal" : "/auth")}
            >
              {isAuthenticated ? "Continue Journaling" : "Start Your Journey"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Mental Wellness Journal</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Supporting youth mental health through technology and empathy.
          </p>
        </div>
      </footer>

      {/* Crisis Support Modal */}
      <CrisisSupport
        open={crisisSupportOpen}
        onOpenChange={setCrisisSupportOpen}
        emergencyMode={false}
        langCode={lang}
      />

      <Dialog open={overviewOpen} onOpenChange={setOverviewOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>What is Reflect & Track?</DialogTitle>
            <DialogDescription>
              A safe space to write, reflect with AI, and track your mood over time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-4 text-gray-800 dark:bg-gradient-to-br dark:from-blue-950/30 dark:to-purple-950/30 dark:text-gray-200">
              Reflect & Track helps you journal privately, receive supportive AI reflections, and visualize your emotional journey.
            </div>
            <ul className="list-disc pl-5 space-y-2">
              <li>Private journaling with optional voice input</li>
              <li>AI-powered empathetic reflections (English + 5 Indian languages)</li>
              <li>Mood trends with simple, clear charts</li>
              <li>Guest mode available (sign in to save your progress)</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setOverviewOpen(false)}>Close</Button>
            <Button asChild>
              <Link to="/journal">Start Journaling</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}