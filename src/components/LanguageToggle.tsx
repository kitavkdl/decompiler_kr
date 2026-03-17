import { useState, useRef, useCallback } from "react";
import { useLang } from "@/i18n/LanguageContext";
import InterviewEasterEgg from "./InterviewEasterEgg";

const RAPID_CLICK_COUNT = 5;
const RAPID_CLICK_WINDOW = 1500; // ms

const LanguageToggle = () => {
  const { lang, toggle } = useLang();
  const [easterEggOpen, setEasterEggOpen] = useState(false);
  const clickTimestamps = useRef<number[]>([]);
  const lockedUntil = useRef<number>(0);

  const handleClick = useCallback(() => {
    const now = Date.now();

    toggle();

    clickTimestamps.current.push(now);
    clickTimestamps.current = clickTimestamps.current.filter(
      (t) => now - t < RAPID_CLICK_WINDOW
    );

    if (clickTimestamps.current.length >= RAPID_CLICK_COUNT) {
      clickTimestamps.current = [];
      lockedUntil.current = now + 3000;
      setEasterEggOpen(true);
    }
  }, [toggle]);

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed top-5 right-5 z-50 backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-lg px-3 py-1.5 text-xs font-mono tracking-widest text-secondary hover:border-primary/40 hover:text-primary transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.3)] pointer-events-auto cursor-pointer"
        aria-label="Toggle language"
      >
        {lang === "ko" ? "EN" : "한"}
      </button>
      <InterviewEasterEgg open={easterEggOpen} onOpenChange={setEasterEggOpen} />
    </>
  );
};

export default LanguageToggle;
