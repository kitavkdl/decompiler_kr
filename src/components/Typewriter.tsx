import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  caret?: boolean;
}

/** Types out `text` once on mount/text-change. */
const Typewriter = ({ text, speed = 35, className = "", caret = false }: TypewriterProps) => {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setShown(text.slice(0, i));
      if (i < text.length) {
        window.setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    };
    const start = window.setTimeout(tick, 50);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [text, speed]);

  return (
    <span className={className} style={{ whiteSpace: "pre" }}>
      {shown}
      {caret && (
        <>
          <span
            className="inline-block ml-0.5"
            style={{ animation: "tw-caret 1s steps(2) infinite", opacity: done ? undefined : 1 }}
          >
            ▮
          </span>
          <style>{`@keyframes tw-caret{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>
        </>
      )}
    </span>
  );
};

export default Typewriter;
