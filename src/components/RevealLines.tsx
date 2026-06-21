import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/smoothScroll";

interface RevealLinesProps {
  text: string;
  className?: string;
  lineClassName?: string;
}

// Splits a paragraph into roughly sentence-sized lines and reveals them sequentially.
const splitToLines = (text: string): string[] => {
  // Split after sentence terminators while keeping them.
  const parts = text.match(/[^.!?。]+[.!?。]?/g);
  return parts ? parts.map((p) => p.trim()).filter(Boolean) : [text];
};

const RevealLines = ({ text, className = "", lineClassName = "" }: RevealLinesProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const lines = splitToLines(text);

  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll<HTMLElement>("[data-line]");
    gsap.set(els, { y: 18, opacity: 0 });
    const tween = gsap.to(els, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        once: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [text]);

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} data-line className={`block ${lineClassName}`}>
          {line}
          {i < lines.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

export default RevealLines;
