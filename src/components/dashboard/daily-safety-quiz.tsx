"use client"

import { type CSSProperties, useEffect, useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import type { OxAnswer, PlaygroundSafetyQuestion } from "@/lib/quiz/playground-safety-questions"
import { cn } from "@/lib/utils"

type DailySafetyQuizProps = {
  question: PlaygroundSafetyQuestion
  className?: string
}

const CONFETTI_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#fde047",
  "#fb7185",
  "#38bdf8",
] as const

function ConfettiBurst() {
  const launchers = [
    { left: "16%", top: "16%" },
    { left: "50%", top: "11%" },
    { left: "84%", top: "18%" },
  ] as const

  return (
    <div
      className="daily-quiz-confetti pointer-events-none fixed inset-0 z-[120] overflow-hidden"
      aria-hidden
    >
      <div className="daily-quiz-sky-glow" />
      {launchers.map((launcher, launcherIndex) => (
        <div
          key={`launcher-${launcherIndex}`}
          className="daily-quiz-launcher"
          style={{ left: launcher.left, top: launcher.top }}
        >
          {Array.from({ length: 26 }, (_, sparkIndex) => {
            const angleDeg = (sparkIndex * 360) / 26
            const distance = 52 + ((sparkIndex * 17 + launcherIndex * 11) % 88)
            const angleRad = (angleDeg * Math.PI) / 180
            const dx = Math.cos(angleRad) * distance
            const dy = Math.sin(angleRad) * distance
            const delay = `${launcherIndex * 0.08 + ((sparkIndex * 7) % 10) / 100}s`
            const duration = `${0.92 + ((sparkIndex * 13) % 14) / 100}s`
            const color =
              CONFETTI_COLORS[(sparkIndex + launcherIndex * 3) % CONFETTI_COLORS.length]

            return (
              <span
                key={`spark-${launcherIndex}-${sparkIndex}`}
                className="firework-spark"
                style={
                  {
                    backgroundColor: color,
                    color,
                    "--spark-dx": `${dx}px`,
                    "--spark-dy": `${dy}px`,
                    animationDelay: delay,
                    animationDuration: duration,
                  } as CSSProperties
                }
              />
            )
          })}
        </div>
      ))}
      {Array.from({ length: 190 }, (_, index) => {
        const left = `${(index * 83) % 100}%`
        const delay = `${((index * 19) % 30) / 100}s`
        const duration = `${2.25 + ((index * 29) % 11) / 10}s`
        const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
        const drift = `${-190 + ((index * 37) % 380)}px`
        const spin = `${420 + ((index * 41) % 480)}deg`

        return (
          <span
            key={index}
            className="confetti-piece confetti-rain confetti-heavy absolute -top-8"
            style={
              {
                left,
                color,
                backgroundColor: color,
                animationDelay: delay,
                animationDuration: duration,
                "--confetti-drift": drift,
                "--confetti-spin": spin,
              } as CSSProperties
            }
          />
        )
      })}
      {Array.from({ length: 120 }, (_, index) => {
        const left = `${(index * 47) % 100}%`
        const delay = `${0.24 + ((index * 23) % 34) / 100}s`
        const duration = `${2.35 + ((index * 31) % 13) / 10}s`
        const color = CONFETTI_COLORS[(index * 2) % CONFETTI_COLORS.length]
        const drift = `${-210 + ((index * 43) % 420)}px`
        const spin = `${360 + ((index * 53) % 540)}deg`

        return (
          <span
            key={`light-${index}`}
            className="confetti-piece confetti-rain confetti-light absolute -top-8"
            style={
              {
                left,
                backgroundColor: color,
                color,
                animationDelay: delay,
                animationDuration: duration,
                "--confetti-drift": drift,
                "--confetti-spin": spin,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
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
  const [showConfetti, setShowConfetti] = useState(false)

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
      setShowConfetti(true)
      window.setTimeout(() => setShowConfetti(false), 3300)
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
      {showConfetti ? <ConfettiBurst /> : null}
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
      <style jsx global>{`
        .daily-quiz-confetti {
          isolation: isolate;
        }

        .daily-quiz-confetti .daily-quiz-sky-glow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 12% 18%, color-mix(in oklab, #f59e0b 45%, transparent), transparent 46%),
            radial-gradient(circle at 50% 10%, color-mix(in oklab, #ec4899 45%, transparent), transparent 45%),
            radial-gradient(circle at 88% 22%, color-mix(in oklab, #38bdf8 48%, transparent), transparent 47%),
            radial-gradient(circle at 50% 42%, color-mix(in oklab, #a855f7 28%, transparent), transparent 55%);
          opacity: 0;
          animation: sky-glow 1.55s ease-out forwards;
        }

        .daily-quiz-confetti .daily-quiz-launcher {
          position: absolute;
          width: 0;
          height: 0;
        }

        .daily-quiz-confetti .firework-spark {
          position: absolute;
          left: 0;
          top: 0;
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.3);
          animation-name: spark-burst;
          animation-timing-function: cubic-bezier(0.15, 0.7, 0.25, 1);
          animation-fill-mode: forwards;
          box-shadow:
            0 0 6px color-mix(in oklab, currentColor 70%, transparent),
            0 0 14px color-mix(in oklab, currentColor 55%, transparent);
        }

        .daily-quiz-confetti .firework-spark::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2px;
          height: 18px;
          border-radius: 9999px;
          transform: translate(-50%, -50%);
          background: color-mix(in oklab, currentColor 75%, transparent);
          filter: blur(0.7px);
          opacity: 0;
          animation: spark-trail inherit;
          animation-duration: inherit;
          animation-timing-function: inherit;
          animation-delay: inherit;
          animation-fill-mode: inherit;
        }

        .daily-quiz-confetti .confetti-piece {
          opacity: 0;
          transform: translateY(-10px) rotate(0deg);
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(0.14, 0.74, 0.22, 1);
          animation-fill-mode: forwards;
          box-shadow: 0 0 14px color-mix(in oklab, currentColor 50%, transparent);
        }

        .daily-quiz-confetti .confetti-rain.confetti-heavy {
          width: 10px;
          height: 16px;
          border-radius: 3px;
        }

        .daily-quiz-confetti .confetti-rain.confetti-light {
          width: 6px;
          height: 10px;
          border-radius: 9999px;
          animation-name: confetti-fall-light;
        }

        .daily-quiz-confetti .confetti-rain::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 40%;
          width: 2px;
          height: 22px;
          border-radius: 9999px;
          transform: translateX(-50%);
          background: color-mix(in oklab, currentColor 70%, transparent);
          filter: blur(1.2px);
          opacity: 0;
          animation: confetti-tail 1.2s ease-out forwards;
          animation-delay: 0.05s;
        }

        .daily-quiz-confetti .confetti-rain.confetti-light::after {
          height: 14px;
          filter: blur(1.7px);
        }

        @keyframes sky-glow {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 0.78;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes spark-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--spark-dx)), calc(-50% + var(--spark-dy)))
              scale(1.02);
          }
        }

        @keyframes spark-trail {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scaleY(0.35);
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--spark-dx) * 0.36), calc(-50% + var(--spark-dy) * 0.36))
              scaleY(1.06);
          }
        }

        @keyframes confetti-fall {
          0% {
            opacity: 0;
            transform: translateY(-10px) translateX(0) rotate(0deg) scale(0.62);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(115vh) translateX(var(--confetti-drift))
              rotate(var(--confetti-spin)) scale(1);
          }
        }

        @keyframes confetti-fall-light {
          0% {
            opacity: 0;
            transform: translateY(-6px) translateX(0) rotate(0deg) scale(0.5);
          }
          14% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(116vh) translateX(var(--confetti-drift))
              rotate(var(--confetti-spin)) scale(0.95);
          }
        }

        @keyframes confetti-tail {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-2px) scaleY(0.4);
          }
          30% {
            opacity: 0.75;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(11px) scaleY(1.06);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .daily-quiz-confetti .firework-spark,
          .daily-quiz-confetti .confetti-piece {
            animation-name: confetti-pop;
            animation-duration: 0.45s;
            animation-timing-function: ease-out;
            animation-fill-mode: forwards;
          }

          .daily-quiz-confetti .firework-spark::after,
          .daily-quiz-confetti .confetti-piece::after,
          .daily-quiz-confetti .daily-quiz-sky-glow {
            display: none;
          }
        }

        @keyframes confetti-pop {
          0% {
            opacity: 0;
            transform: translateY(0) translateX(0) scale(0.6);
          }
          35% {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(0) translateX(0) scale(0.9);
          }
        }
      `}</style>
    </div>
  )
}
