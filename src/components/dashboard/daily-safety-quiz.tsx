"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import type { OxAnswer, PlaygroundSafetyQuestion } from "@/lib/quiz/playground-safety-questions"
import { cn } from "@/lib/utils"

import { QuizFireworksOverlay } from "./quiz-fireworks-overlay"

type DailySafetyQuizProps = {
  question: PlaygroundSafetyQuestion
  className?: string
}

export function DailySafetyQuiz({ question, className }: DailySafetyQuizProps) {
  return (
    <DailySafetyQuizBody
      key={question.id}
      question={question}
      className={className}
    />
  )
}

function DailySafetyQuizBody({ question, className }: DailySafetyQuizProps) {
  const statementId = useId()
  const resultSummaryRef = useRef<HTMLParagraphElement>(null)
  const [chosen, setChosen] = useState<OxAnswer | null>(null)
  const [showFireworks, setShowFireworks] = useState(false)
  const [fireworksBurst, setFireworksBurst] = useState(0)
  const endFireworks = useCallback(() => setShowFireworks(false), [])

  useEffect(() => {
    if (chosen !== null) {
      resultSummaryRef.current?.focus()
    }
  }, [chosen])

  const answered = chosen !== null
  const isCorrect = answered && chosen === question.answer

  function handleAnswer(value: OxAnswer) {
    setChosen(value)
    if (value === question.answer) {
      setFireworksBurst((n) => n + 1)
      setShowFireworks(true)
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm ring-1 ring-foreground/10",
        className
      )}
      role="group"
      aria-label="오늘의 안전 OX 퀴즈"
    >
      <QuizFireworksOverlay
        active={showFireworks}
        burstKey={fireworksBurst}
        onComplete={endFireworks}
      />
      <div>
        <p className="text-xs font-medium text-muted-foreground">오늘의 안전 O/X</p>
        <p
          id={statementId}
          className="mt-1 text-sm font-medium leading-snug text-foreground"
        >
          {question.statement}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["O", "X"] as const).map((value) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            size="lg"
            disabled={answered}
            className={cn(
              "min-h-11 min-w-[4.5rem] text-base font-semibold",
              !answered && "hover:border-primary/50"
            )}
            aria-describedby={statementId}
            aria-label={value === "O" ? "맞다(O)" : "틀리다(X)"}
            onClick={() => handleAnswer(value)}
            aria-pressed={chosen === value}
          >
            {value}
          </Button>
        ))}
      </div>

      <div aria-live="polite" className="space-y-2">
        {answered ? (
          <>
            <p
              ref={resultSummaryRef}
              tabIndex={-1}
              className={cn(
                "inline-flex w-fit rounded-md px-2 py-1 text-xs font-semibold outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isCorrect
                  ? "bg-primary/15 text-primary"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {isCorrect ? "정답입니다" : "오답입니다"}
              {!isCorrect ? (
                <span className="sr-only"> 정답은 {question.answer}입니다.</span>
              ) : null}
            </p>
            {!isCorrect ? (
              <p className="text-xs text-muted-foreground">
                정답: <span className="font-semibold text-foreground">{question.answer}</span>
              </p>
            ) : null}
            <p className="text-xs leading-relaxed text-muted-foreground">{question.explanation}</p>
            <p className="text-xs text-muted-foreground/90">
              내일 새 문제가 출제됩니다.
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
