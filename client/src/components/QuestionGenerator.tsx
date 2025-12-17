import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from './FileUpload';
import { QuizInterface, QuizResults } from './QuizInterface';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, FileText, Settings, Clock, History } from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdf-utils';
import { generateQuestions, type Question } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface StoredResult {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: number;
  answers?: { questionId: number; selected: number; correct: number }[];
  questions?: Question[];
}

export function QuestionGenerator() {
  const [step, setStep] = useState<'setup' | 'processing' | 'quiz'>('setup');
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState([5]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [results, setResults] = useState<StoredResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    if (!user) {
      setResults([]);
      setSelectedResult(null);
      return;
    }

    setResultsLoading(true);
    const resultsRef = ref(db, `users/${user.uid}/results`);
    const unsubscribe = onValue(resultsRef, (snapshot) => {
      const val = snapshot.val() || {};
      const list: StoredResult[] = Object.entries(val).map(([id, data]: any) => ({
        id,
        score: data.score ?? 0,
        totalQuestions: data.totalQuestions ?? 0,
        percentage: data.percentage ?? 0,
        createdAt: data.createdAt ?? 0,
        answers: data.answers ?? [],
        questions: data.questions ?? [],
      }));
      list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setResults(list);
      setResultsLoading(false);
    }, (err) => {
      console.error('Error loading results', err);
      setResultsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGenerate = async () => {
    setSelectedResult(null);

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      toast({
        title: "API Key Not Configured",
        description: "Please contact the administrator to configure the API key.",
        variant: "destructive"
      });
      return;
    }
    if (!file) {
      toast({
        title: "File Required",
        description: "Please upload a syllabus PDF.",
        variant: "destructive"
      });
      return;
    }

    setStep('processing');
    try {
      // 1. Extract Text
      const text = await extractTextFromPDF(file);
      if (!text || text.trim().length === 0) {
        throw new Error("Could not extract text from PDF. It might be scanned/image-based.");
      }

      // 2. Generate Questions
      const generatedQuestions = await generateQuestions(apiKey, text, numQuestions[0]);
      setQuestions(generatedQuestions);
      setStep('quiz');

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: error.message || "Something went wrong during generation.",
        variant: "destructive"
      });
      setStep('setup');
    }
  };

  const handleReset = () => {
    setStep('setup');
    setQuestions([]);
    setFile(null);
    setSelectedResult(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex flex-col md:grid md:grid-cols-[260px_minmax(0,1fr)] gap-4 md:gap-6">
        {/* Mobile: Collapsible history sidebar */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full gap-2 touch-target">
                <History className="w-4 h-4" />
                View Quiz History
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">History</h2>
                </div>
                {!user ? (
                  <p className="text-xs text-muted-foreground">
                    Sign in to save and view your quiz history.
                  </p>
                ) : (
                  <>
                    {resultsLoading && (
                      <p className="text-xs text-muted-foreground mb-2">Loading results...</p>
                    )}
                    {!resultsLoading && results.length === 0 && (
                      <p className="text-xs text-muted-foreground mb-2">
                        No quizzes yet. Generate your first quiz to see it here.
                      </p>
                    )}
                    <div className="mt-1 space-y-2 overflow-y-auto flex-1">
                      {results.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedResult(r)}
                          className="w-full text-left px-3 py-3 rounded-lg text-xs bg-secondary/40 hover:bg-secondary/70 transition-colors border border-transparent hover:border-border/80 tap-highlight-none touch-target"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium">{r.percentage}%</span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDate(r.createdAt)}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {r.score}/{r.totalQuestions} correct
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: Always visible sidebar */}
        <aside className="hidden md:flex bg-card border rounded-2xl p-4 flex-col max-h-[calc(100vh-160px)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">History</h2>
          </div>
          {!user ? (
            <p className="text-xs text-muted-foreground">
              Sign in to save and view your quiz history.
            </p>
          ) : (
            <>
              {resultsLoading && (
                <p className="text-xs text-muted-foreground mb-2">Loading results...</p>
              )}
              {!resultsLoading && results.length === 0 && (
                <p className="text-xs text-muted-foreground mb-2">
                  No quizzes yet. Generate your first quiz to see it here.
                </p>
              )}
              <div className="mt-1 space-y-1 overflow-y-auto">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResult(r)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs bg-secondary/40 hover:bg-secondary/70 transition-colors border border-transparent hover:border-border/80 tap-highlight-none"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium">{r.percentage}%</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.score}/{r.totalQuestions} correct
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        <div>
          <AnimatePresence mode="wait">
            {selectedResult ? (
              <QuizResults
                questions={(selectedResult.questions ?? []) as Question[]}
                userAnswers={selectedResult.answers ?? []}
                score={selectedResult.score}
                onReset={handleReset}
              />
            ) : (
              <>
                {step === 'setup' && (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 md:space-y-8 bg-card border rounded-2xl p-5 sm:p-6 md:p-10 shadow-sm"
                  >
                    <div className="space-y-2 text-center md:text-left">
                      <h2 className="text-xl sm:text-2xl font-display font-semibold flex items-center gap-2 justify-center md:justify-start">
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        Configure Quiz
                      </h2>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Upload your syllabus and let AI create the perfect test for you.
                      </p>
                    </div>

                    <div className="grid gap-6 md:gap-8">


                      {/* File Upload Section */}
                      <div className="space-y-3">
                        <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Syllabus PDF
                        </Label>
                        <FileUpload
                          selectedFile={file}
                          onFileSelect={setFile}
                          onClear={() => setFile(null)}
                        />
                      </div>

                      {/* Question Count Section */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm sm:text-base font-medium">Number of Questions</Label>
                          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                            {numQuestions[0]} Questions
                          </span>
                        </div>
                        <Slider
                          value={numQuestions}
                          onValueChange={setNumQuestions}
                          min={1}
                          max={20}
                          step={1}
                          className="py-4"
                        />
                      </div>

                      <Button
                        onClick={handleGenerate}
                        size="lg"
                        className="w-full text-base font-semibold h-12 sm:h-14 gap-2 shadow-lg shadow-primary/20 touch-target"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Quiz
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-center space-y-6 px-4"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                      <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary animate-spin relative z-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-display font-medium">Analyzing Syllabus...</h3>
                      <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto px-4">
                        Our AI is reading your document and crafting relevant questions. This usually takes about 10-20 seconds.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 'quiz' && (
                  <QuizInterface
                    questions={questions}
                    onReset={handleReset}
                  />
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
