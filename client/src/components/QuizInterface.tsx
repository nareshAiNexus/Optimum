import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/gemini';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/firebase';
import { ref, push } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';

interface UserAnswer {
  questionId: number;
  selected: number;
  correct: number;
}

interface QuizResultViewProps {
  questions: Question[];
  userAnswers: UserAnswer[];
  score: number;
  onReset: () => void;
}

interface QuizInterfaceProps {
  questions: Question[];
  onReset: () => void;
}

export function QuizResults({ questions, userAnswers, score, onReset }: QuizResultViewProps) {
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-6 md:space-y-8"
    >
      <div className="text-center space-y-3 md:space-y-4">
        <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-primary/10 mb-3 md:mb-4">
          <Trophy className="w-10 h-10 md:w-12 md:h-12 text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold">Quiz Complete!</h2>
        <p className="text-sm md:text-base text-muted-foreground">Here's how you performed</p>

        <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-bold text-primary">
          <span>{percentage}%</span>
          <span className="text-base sm:text-lg text-muted-foreground font-normal self-end mb-1">Score</span>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {questions.map((q, idx) => {
          const userAnswer = userAnswers.find(a => a.questionId === q.id);
          const isCorrect = userAnswer?.selected === q.correctAnswer;

          return (
            <div key={q.id} className={cn(
              "p-4 md:p-5 rounded-lg border text-left transition-all",
              isCorrect ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200"
            )}>
              <div className="flex gap-3">
                <div className={cn(
                  "mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {idx + 1}
                </div>
                <div className="space-y-2 w-full min-w-0">
                  <p className="font-medium text-foreground text-sm md:text-base break-words">{q.question}</p>
                  <div className="text-xs md:text-sm space-y-1">
                    <p className={cn(
                      "flex items-center gap-2 break-words",
                      isCorrect ? "text-green-700" : "text-red-600 line-through"
                    )}>
                      {isCorrect ? <Check className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0" />}
                      <span>You: {q.options[userAnswer?.selected ?? 0]}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-green-700 flex items-center gap-2 break-words">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        <span>Correct: {q.options[q.correctAnswer]}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-4 md:pt-6">
        <Button onClick={onReset} size="lg" className="gap-2 w-full sm:w-auto touch-target">
          <RefreshCw className="w-4 h-4" />
          Create Another Quiz
        </Button>
      </div>
    </motion.div>
  );
}

export function QuizInterface({ questions, onReset }: QuizInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const { user } = useAuth();

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) setScore(s => s + 1);

    setUserAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selected: selectedOption,
      correct: currentQuestion.correctAnswer
    }]);

    setIsAnswered(true);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);

      // Save results for logged-in users
      if (user) {
        try {
          const percentage = Math.round((score / questions.length) * 100);
          const resultRef = ref(db, `users/${user.uid}/results`);
          await push(resultRef, {
            score,
            totalQuestions: questions.length,
            percentage,
            createdAt: Date.now(),
            answers: userAnswers,
            questions,
          });
        } catch (err) {
          console.error('Failed to save quiz result', err);
        }
      }
    }
  };

  if (showResults) {
    return (
      <QuizResults
        questions={questions}
        userAnswers={userAnswers}
        score={score}
        onReset={onReset}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 md:space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(((currentIndex) / questions.length) * 100)}% completed</span>
        </div>
        <Progress value={((currentIndex) / questions.length) * 100} className="h-2" />
      </div>

      {/* Question Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-5 md:space-y-6"
      >
        <h3 className="text-lg sm:text-xl md:text-2xl font-display font-medium leading-tight">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;
            const showCorrectness = isAnswered && isCorrect;
            const showIncorrectness = isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                className={cn(
                  "w-full p-4 sm:p-5 rounded-xl border text-left transition-all duration-200 min-h-[56px] tap-highlight-none",
                  "hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  isSelected && !isAnswered && "border-primary ring-1 ring-primary bg-primary/5",
                  showCorrectness && "border-green-500 bg-green-50 text-green-900",
                  showIncorrectness && "border-red-500 bg-red-50 text-red-900",
                  !isSelected && isAnswered && isCorrect && "border-green-500 bg-green-50 text-green-900 opacity-70"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-sm sm:text-base break-words">{option}</span>
                  {showCorrectness && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  {showIncorrectness && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        {!isAnswered ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            size="lg"
            className="w-full sm:w-auto h-12 sm:h-auto touch-target"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full sm:w-auto gap-2 h-12 sm:h-auto touch-target"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
