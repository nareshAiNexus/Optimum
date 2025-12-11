import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ChevronRight, Github, Mail, Info, Menu, Sparkles, Zap } from "lucide-react";
import { QuestionGenerator } from "@/components/QuestionGenerator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import heroImage from "@/assets/generated_images/minimalist_abstract_education_ai_concept_with_floating_geometric_shapes_and_soft_gradients.png";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const { user, signOut } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden transition-colors duration-300">
      {/* Optimized Background decoration */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-background to-background opacity-50" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => {
            setHasStarted(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <BrainCircuit className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight group-hover:text-primary transition-colors">OPTIMUM</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <button onClick={() => scrollToSection('about')} className="hover:text-foreground transition-colors">About</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-foreground transition-colors">Contact</button>
            </nav>
            <div className="flex items-center gap-4 pl-6 border-l">
              {user ? (
                <>
                  <span className="text-xs text-muted-foreground max-w-[180px] truncate">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth">Sign in / Sign up</Link>
                </Button>
              )}
              <ThemeToggle />
              <Button variant="ghost" size="icon" asChild className="hover:bg-secondary/50">
                <a 
                  href="https://github.com/nareshAiNexus/Optimum.git" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <button onClick={() => scrollToSection('about')} className="text-lg font-medium text-left">About</button>
                  <button onClick={() => scrollToSection('contact')} className="text-lg font-medium text-left">Contact</button>
                  <a 
                    href="https://github.com/replit/optimum" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-lg font-medium"
                  >
                    <Github className="w-5 h-5" />
                    Open Source
                  </a>
                  {user ? (
                    <Button variant="outline" size="sm" onClick={() => signOut()} className="mt-2">
                      Sign out
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <Link href="/auth">Sign in / Sign up</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32 pb-16">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-24"
            >
              {/* Hero Section */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-border/50"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      Powered by OpenRouter DeepSeek
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
                      Turn any syllabus into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">mastery quiz</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                      Upload your course PDF and let OPTIMUM generate syllabus-aligned practice questions instantly. No signup required.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      className="text-lg h-14 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                      onClick={() => setHasStarted(true)}
                    >
                      Get Started Now
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg h-14 px-8 rounded-xl hover:bg-secondary/50 transition-colors"
                      onClick={() => scrollToSection('about')}
                    >
                      Learn More
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Free to use
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      No login required
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Instant results
                    </div>
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-2xl overflow-hidden border shadow-2xl shadow-primary/10 aspect-video group"
                  >
                    <img 
                      src={heroImage} 
                      alt="AI Education Platform" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                  </motion.div>
                  
                  {/* Floating Elements Decoration */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-xl border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">A+</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Exam Ready</p>
                        <p className="text-xs text-muted-foreground">95% Accuracy</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* About Section */}
              <div id="about" className="py-20 border-t">
                <div className="max-w-3xl mx-auto text-center space-y-12">
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-display font-bold">About OPTIMUM</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      OPTIMUM is an open-source educational tool designed to help students master their course material through active recall. By leveraging advanced AI, we transform static PDF syllabi into interactive quizzes, making study sessions more efficient and engaging.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    <motion.div whileHover={{ y: -5 }} className="p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <BrainCircuit className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">AI Powered</h3>
                      <p className="text-sm text-muted-foreground">Uses DeepSeek R1 to understand context and generate relevant questions.</p>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Instant Feedback</h3>
                      <p className="text-sm text-muted-foreground">Get immediate explanations for correct and incorrect answers.</p>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Github className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Open Source</h3>
                      <p className="text-sm text-muted-foreground">Completely free and open source. Built for the community.</p>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div id="contact" className="py-20 border-t bg-secondary/20 -mx-4 px-4 md:-mx-8 md:px-8 rounded-3xl">
                <div className="max-w-xl mx-auto text-center space-y-8">
                  <h2 className="text-3xl font-display font-bold">Get in Touch</h2>
                  <p className="text-muted-foreground">
                    Have questions, suggestions, or just want to say hi? We'd love to hear from you.
                  </p>
                  <div className="flex flex-col gap-4 items-center">
                    <Button size="lg" className="gap-2 rounded-full px-8 hover:scale-105 transition-transform" asChild>
                      <a href="mailto:hello@optimum.ai">
                        <Mail className="w-4 h-4" />
                        hello@optimum.ai
                      </a>
                    </Button>
                    <div className="flex gap-4">
                      <Button variant="ghost" size="icon" asChild className="hover:bg-background">
                        <a href="https://github.com/nareshAiNexus" className="hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="hover:bg-background">
                        {/* <a href="#" className="hover:text-primary transition-colors"><span className="font-bold text-lg">𝕏</span></a> */}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="mb-8">
                <Button 
                  variant="ghost" 
                  onClick={() => setHasStarted(false)}
                  className="hover:bg-transparent hover:text-primary pl-0 gap-2 group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
                </Button>
              </div>
              <QuestionGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} OPTIMUM. Built with <span className="text-red-500 animate-pulse">♥</span> for students.</p>
        </div>
      </footer>
    </div>
  );
}
