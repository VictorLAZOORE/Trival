"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

const PICK_DELAY_MS = 3000;
const REPLAY_DELAY_MS = 2000;

interface Finger {
  id: string;
  x: number;
  y: number;
}

export default function ChooserPage() {
  const [fingers, setFingers] = useState<Finger[]>([]);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  /** Snapshot au moment du tirage */
  const [fingersAtPick, setFingersAtPick] = useState<Finger[] | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const fingersRef = useRef<Finger[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  fingersRef.current = fingers;
  const displayFingers = fingersAtPick ?? fingers;

  const addFinger = useCallback((id: string, x: number, y: number) => {
    setFingers((prev) => {
      if (prev.some((f) => f.id === id)) return prev;
      return [...prev, { id, x, y }];
    });
  }, []);

  const updateFinger = useCallback((id: string, x: number, y: number) => {
    setFingers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, x, y } : f))
    );
  }, []);

  const removeFinger = useCallback((id: string) => {
    setFingers((prev) => prev.filter((f) => f.id !== id));
    if (!fingersAtPick) setWinnerIndex(null);
  }, [fingersAtPick]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]!;
        addFinger(`t${t.identifier}`, t.clientX, t.clientY);
      }
    },
    [addFinger]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]!;
        updateFinger(`t${t.identifier}`, t.clientX, t.clientY);
      }
    },
    [updateFinger]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        removeFinger(`t${e.changedTouches[i]!.identifier}`);
      }
    },
    [removeFinger]
  );

  const nextMouseId = useRef(0);
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const id = `m${nextMouseId.current++}`;
      addFinger(id, e.clientX, e.clientY);
      const onMove = (ev: MouseEvent) => updateFinger(id, ev.clientX, ev.clientY);
      const onUp = () => {
        removeFinger(id);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [addFinger, updateFinger, removeFinger]
  );

  /** Timer 3s : dès qu'il y a au moins 1 doigt, on lance. Si un doigt est ajouté, on reset. */
  useEffect(() => {
    if (fingersAtPick !== null || isPicking || fingers.length === 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setCountdown(null);
      return;
    }

    setCountdown(3);
    let elapsed = 0;
    const countdownInterval = setInterval(() => {
      elapsed += 200;
      const left = Math.ceil((PICK_DELAY_MS - elapsed) / 1000);
      setCountdown(left > 0 ? left : null);
    }, 200);

    timerRef.current = setTimeout(() => {
      clearInterval(countdownInterval);
      setCountdown(null);
      const current = fingersRef.current;
      const count = current.length;
      if (count === 0) return;
      setFingersAtPick([...current]);
      setWinnerIndex(null);
      setIsPicking(true);
      const duration = 1500;
      const steps = 8;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setWinnerIndex(Math.floor(Math.random() * count));
        if (step >= steps) {
          clearInterval(interval);
          setWinnerIndex(Math.floor(Math.random() * count));
          setIsPicking(false);
        }
      }, duration / steps);
    }, PICK_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(countdownInterval);
    };
  }, [fingers.length, fingersAtPick, isPicking]);

  /** Après qu'un gagnant soit affiché, reset automatique au bout de 2 s pour rejouer */
  useEffect(() => {
    if (winnerIndex === null || isPicking) return;
    const id = setTimeout(() => {
      setWinnerIndex(null);
      setFingersAtPick(null);
      setFingers([]);
    }, REPLAY_DELAY_MS);
    return () => clearTimeout(id);
  }, [winnerIndex, isPicking]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 flex flex-col">
      <header className="shrink-0 flex items-center justify-between p-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour
        </Link>
        <span className="text-white/50 text-sm font-medium">Le Chooser</span>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-center py-4 px-4">
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
            👆 Le Chooser
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {winnerIndex !== null
              ? "C'est toi !"
              : displayFingers.length === 0
                ? "Posez vos doigts sur l'écran"
                : countdown !== null
                  ? `Tirage dans ${countdown}…`
                  : `${displayFingers.length} doigt${displayFingers.length > 1 ? "s" : ""}`}
          </p>
          {countdown !== null && countdown > 0 && (
            <div className="mt-2 text-4xl font-black text-emerald-400 tabular-nums animate-pulse">
              {countdown}
            </div>
          )}
        </div>

        <div
          ref={zoneRef}
          className="flex-1 min-h-[280px] relative touch-none select-none overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{ touchAction: "none" }}
        >
          <div className="absolute inset-0 bg-white/5 rounded-2xl mx-4 border-2 border-dashed border-white/20 flex items-center justify-center">
            {displayFingers.length === 0 && winnerIndex === null && (
              <p className="text-white/40 text-sm text-center px-4">
                Touchez l'écran avec vos doigts
                <br />
                <span className="text-xs">(ou clic souris pour tester)</span>
              </p>
            )}
          </div>

          {displayFingers.map((f, index) => (
            <div
              key={f.id}
              className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-200 flex items-center justify-center"
              style={{
                left: f.x,
                top: f.y,
                backgroundColor:
                  winnerIndex === index
                    ? "rgb(16, 185, 129)"
                    : "rgba(255,255,255,0.9)",
                boxShadow:
                  winnerIndex === index
                    ? "0 0 30px rgba(16, 185, 129, 0.8)"
                    : "0 4px 20px rgba(0,0,0,0.3)",
                border:
                  winnerIndex === index
                    ? "3px solid white"
                    : "2px solid rgba(0,0,0,0.1)",
                scale: winnerIndex === index ? 1.2 : 1,
              }}
            >
              {winnerIndex === index ? (
                <span className="text-xl font-black text-white">✓</span>
              ) : (
                <span className="text-lg font-bold text-slate-600">
                  {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="shrink-0 p-4 flex flex-col gap-3">
          {winnerIndex !== null && (
            <p className="text-white/50 text-xs text-center">
              Nouveau tirage dans 2 secondes…
            </p>
          )}
          {displayFingers.length >= 1 && winnerIndex === null && countdown === null && !isPicking && (
            <p className="text-white/50 text-xs text-center">
              Un nouveau doigt = le compte à rebours repart à 3 s
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
