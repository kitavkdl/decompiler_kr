import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/smoothScroll";

interface TypingLabelProps {
  text: string;
  className?: string;
  speed?: number;
}

const TypingLabel = ({ text, className = "", speed = 45 }: TypingLabelProps) => {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        if (playedRef.current) return;
        playedRef.current = true;
        let i = 0;
        const tick = () => {
          i += 1;
          setShown(text.slice(0, i));
          if (i < text.length) {
            window.setTimeout(tick, speed);
          } else {
            setDone(true);
          }
        };
        tick();
      },
    });
    return () => st.kill();
  }, [text, speed]);

  return (
    <span ref={ref} className={className} style={{ whiteSpace: "pre" }}>
      {shown}
      <span
        className="inline-block ml-0.5"
        style={{
          animation: "typing-caret-blink 1s steps(2) infinite",
          opacity: done ? undefined : 1,
        }}
      >
        ▮
      </span>
      <style>{`@keyframes typing-caret-blink{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>
    </span>
  );
};

export default TypingLabel;
