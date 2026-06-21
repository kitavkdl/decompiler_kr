import { useEffect, useRef, useState } from "react";

const DEFAULT_SYMBOLS = "!@#$%^&*()_+-=[]{}|;:<>?/\\~`0123456789ABCDEF";

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** Auto-play on mount. Default: false (hover-only, legacy). */
  autoPlay?: boolean;
  /** Total duration in ms when autoPlay is on. Default 1500. */
  duration?: number;
  /** Per-char reveal stagger when autoPlay is on. Default 60. */
  revealStagger?: number;
  /** Tick interval for scramble updates. Default 35. */
  tickMs?: number;
  /** Trailing blinking caret. Default false. */
  caret?: boolean;
  /** Disable hover re-trigger. Default false. */
  disableHover?: boolean;
}

const ScrambleText = ({
  text,
  className = "",
  autoPlay = false,
  duration = 1500,
  revealStagger = 60,
  tickMs = 35,
  caret = false,
  disableHover = false,
}: ScrambleTextProps) => {
  const [displayed, setDisplayed] = useState(autoPlay ? "" : text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const playingRef = useRef(false);

  const rand = () => DEFAULT_SYMBOLS[Math.floor(Math.random() * DEFAULT_SYMBOLS.length)];

  const clearAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const run = (totalMs: number, stagger: number) => {
    clearAll();
    playingRef.current = true;
    const chars = text.split("");
    setDisplayed(chars.map(() => rand()).join(""));

    chars.forEach((ch, i) => {
      const delay = Math.min(totalMs - 100, 30 + i * stagger + Math.random() * 40);
      const t = setTimeout(() => {
        setDisplayed((prev) => {
          const arr = prev.split("");
          arr[i] = ch;
          return arr.join("");
        });
      }, delay);
      timeoutsRef.current.push(t);
    });

    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += tickMs;
      setDisplayed((prev) => {
        const arr = prev.split("");
        const revealed = Math.floor(elapsed / stagger);
        for (let i = revealed; i < arr.length; i++) {
          if (arr[i] !== chars[i]) arr[i] = rand();
        }
        return arr.join("");
      });
      if (elapsed >= totalMs) {
        clearInterval(intervalRef.current!);
        setDisplayed(text);
        playingRef.current = false;
      }
    }, tickMs);
  };

  useEffect(() => {
    if (autoPlay) run(duration, revealStagger);
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay]);

  const handleHover = () => {
    if (disableHover || playingRef.current) return;
    run(Math.max(900, text.length * 80), 40);
  };

  return (
    <span
      className={`inline-block ${className}`}
      onMouseEnter={handleHover}
      style={{ whiteSpace: "pre" }}
    >
      {displayed}
      {caret && (
        <>
          <span
            className="inline-block ml-0.5 align-baseline"
            style={{ animation: "scramble-caret 1s steps(2) infinite" }}
          >
            ▮
          </span>
          <style>{`@keyframes scramble-caret{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>
        </>
      )}
    </span>
  );
};

export default ScrambleText;
