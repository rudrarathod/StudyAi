import React, { useState } from "react";
import { CheckCircle2, ChevronRight, XCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAppContext } from "../context/AppContext";

export function Quizzes() {
  const { currentQuiz, isGeneratingQuiz } = useAppContext();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (isGeneratingQuiz) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-500 py-8">
        <div>
          <div className="h-8 w-48 bg-[var(--muted)] rounded-md animate-pulse mb-4"></div>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted)] animate-pulse"></div>
            <div className="h-4 w-12 bg-[var(--muted)] rounded animate-pulse"></div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-2 mb-6 text-[var(--primary)]">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium animate-pulse">AI is generating your quiz...</span>
          </div>
          
          <div className="space-y-3 mb-8">
            <div className="h-6 w-full bg-[var(--muted)] rounded animate-pulse"></div>
            <div className="h-6 w-3/4 bg-[var(--muted)] rounded animate-pulse"></div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] p-4">
                <div className="h-5 w-1/2 bg-[var(--muted)] rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <div className="mb-4 rounded-full bg-[var(--muted)] p-6 text-[var(--muted-foreground)]">
          <Sparkles className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold">No Active Quiz</h2>
        <p className="mt-2 max-w-md text-[var(--muted-foreground)]">
          Go to a note in your library and use the AI tools to generate a quiz.
        </p>
        <Link to="/library" className="mt-8 rounded-full bg-[var(--primary)] px-8 py-3 font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
          Go to Library
        </Link>
      </div>
    );
  }

  const question = currentQuiz.questions[currentQuestion];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (index === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500">
        <div className="mb-6 rounded-full bg-green-500/10 p-6 text-green-500">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Quiz Completed!</h1>
        <p className="mb-8 text-lg text-[var(--muted-foreground)]">
          You scored {score} out of {currentQuiz.questions.length}
        </p>
        <button 
          onClick={() => {
            setCurrentQuestion(0);
            setSelectedOption(null);
            setIsAnswered(false);
            setScore(0);
            setIsFinished(false);
          }}
          className="rounded-full bg-[var(--primary)] px-8 py-3 font-medium text-white shadow-sm hover:bg-[var(--primary)]/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const progress = ((currentQuestion) / currentQuiz.questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{currentQuiz.title || "Study Quiz"}</h1>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
            <div 
              className="h-full bg-[var(--primary)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-[var(--muted-foreground)]">
            {currentQuestion + 1} / {currentQuiz.questions.length}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm md:p-8">
        <h2 className="mb-8 text-xl font-medium leading-relaxed">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === question.correctAnswer;
            const showCorrect = isAnswered && isCorrect;
            const showIncorrect = isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={isAnswered}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all",
                  !isAnswered && "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/50",
                  showCorrect && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
                  showIncorrect && "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
                  isAnswered && !isSelected && !isCorrect && "border-[var(--border)] opacity-50"
                )}
              >
                <span className="font-medium">{option}</span>
                {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {showIncorrect && <XCircle className="h-5 w-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 flex justify-end animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-2.5 font-medium text-white shadow-sm hover:bg-[var(--primary)]/90 transition-colors"
            >
              {currentQuestion < currentQuiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
