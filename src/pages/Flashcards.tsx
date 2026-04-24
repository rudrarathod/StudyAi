import React, { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAppContext } from "../context/AppContext";

export function Flashcards() {
  const { flashcards, isGeneratingFlashcards } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (isGeneratingFlashcards) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-8 animate-in fade-in duration-500">
        <div className="mb-8 text-center">
          <div className="h-8 w-40 bg-[var(--muted)] rounded-md animate-pulse mx-auto mb-2"></div>
          <div className="h-4 w-24 bg-[var(--muted)] rounded-md animate-pulse mx-auto"></div>
        </div>

        {/* Skeleton Flashcard Container */}
        <div className="relative h-80 w-full max-w-md">
          <div className="absolute inset-0 flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-md">
            <div className="flex justify-start shrink-0">
              <div className="h-4 w-16 bg-[var(--muted)] rounded animate-pulse"></div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-4">
              <div className="h-6 w-3/4 bg-[var(--muted)] rounded animate-pulse"></div>
              <div className="h-6 w-1/2 bg-[var(--muted)] rounded animate-pulse"></div>
            </div>
            <div className="flex justify-center shrink-0 items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--primary)] animate-pulse" />
              <p className="text-xs text-[var(--muted-foreground)] animate-pulse">AI is generating flashcards...</p>
            </div>
          </div>
        </div>

        {/* Skeleton Controls */}
        <div className="mt-12 flex items-center gap-6">
          <div className="h-10 w-10 bg-[var(--muted)] rounded-full animate-pulse"></div>
          <div className="h-12 w-12 bg-[var(--muted)] rounded-full animate-pulse"></div>
          <div className="h-12 w-12 bg-[var(--muted)] rounded-full animate-pulse"></div>
          <div className="h-10 w-10 bg-[var(--muted)] rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <div className="mb-4 rounded-full bg-[var(--muted)] p-6 text-[var(--muted-foreground)]">
          <Layers className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold">No Flashcards Yet</h2>
        <p className="mt-2 max-w-md text-[var(--muted-foreground)]">
          Go to a note in your library and use the AI tools to generate a flashcard deck.
        </p>
        <Link to="/library" className="mt-8 rounded-full bg-[var(--primary)] px-8 py-3 font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
          Go to Library
        </Link>
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flex h-full flex-col items-center justify-center py-8 animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Study Deck</h1>
        <p className="text-[var(--muted-foreground)]">Card {currentIndex + 1} of {flashcards.length}</p>
      </div>

      {/* Flashcard Container */}
      <div 
        className="relative h-80 w-full max-w-md cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={cn(
            "relative h-full w-full transition-all duration-500 transform-style-3d",
            isFlipped ? "rotate-y-180" : ""
          )}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-md backface-hidden">
            <div className="flex justify-start shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Question</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="min-h-full flex flex-col justify-center">
                <h2 className="text-xl font-medium md:text-2xl">{currentCard.front}</h2>
              </div>
            </div>
            <div className="flex justify-center shrink-0">
              <p className="text-xs text-[var(--muted-foreground)]">Tap to flip</p>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 flex flex-col rounded-3xl border border-[var(--primary)]/30 bg-indigo-50 dark:bg-indigo-950 p-6 text-center shadow-md backface-hidden rotate-y-180">
            <div className="flex justify-start shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">Answer</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="min-h-full flex flex-col justify-center">
                <h2 className="text-xl font-medium md:text-2xl">{currentCard.back}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-12 flex items-center gap-6">
        <button className="rounded-full p-3 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          <Shuffle className="h-5 w-5" />
        </button>
        <button 
          onClick={handlePrev}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] shadow-sm hover:bg-[var(--muted)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button 
          onClick={handleNext}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary)]/90 transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <button 
          onClick={() => { setIsFlipped(false); setTimeout(() => setCurrentIndex(0), 150); }}
          className="rounded-full p-3 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
