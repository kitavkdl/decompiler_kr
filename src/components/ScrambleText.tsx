import { useState, useCallback, useRef, useEffect } from "react";

const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:<>?/\\~`01";

interface ScrambleTextProps {
  text: string;
  className?: string;
}

const ScrambleText = ({ text, className = "" }: ScrambleTextProps) => {
  const [displayed, setDisplayed] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scramble = useCallback(() => {
    // Clear previous
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];

    const chars = text.split("");
    const result = chars.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    setDisplayed(result.join(""));

    // Reveal each character one by one
    chars.forEach((char, i) => {
      const delay = 30 + i * 40 + Math.random() * 30;
      const t = setTimeout(() => {
        setDisplayed((prev) => {
          const arr = prev.split("");
          arr[i] = char;
          return arr.join("");
        });
      }, delay);
      timeoutRef.current.push(t);
    });

    // Rapid scramble during reveal
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick++;
      setDisplayed((prev) => {
        const arr = prev.split("");
        // Only scramble characters that haven't been revealed yet
        const revealedCount = Math.floor(tick * 1.5);
        for (let i = revealedCount; i < arr.length; i++) {
          if (arr[i] !== chars[i]) {
            arr[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          }
        }
        return arr.join("");
      });
      if (tick > chars.length * 2) {
        clearInterval(intervalRef.current!);
        setDisplayed(text);
      }
    }, 30);
  }, [text]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timeoutRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <span
      className={`inline-block ${className}`}
      onMouseEnter={scramble}
      style={{ whiteSpace: "pre" }}
    >
      {displayed}
    </span>
  );
};

export default ScrambleText;
