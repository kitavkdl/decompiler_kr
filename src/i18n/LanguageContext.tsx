import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from "react";
import { Lang } from "./translations";

type Ctx = {
  lang: Lang;
  toggle: () => void;
  /** Increments on every successful language change — for re-mounting scramble components. */
  version: number;
  /** True during the short decode/scramble transition window. */
  scrambling: boolean;
};

const LanguageContext = createContext<Ctx>({
  lang: "ko",
  toggle: () => {},
  version: 0,
  scrambling: false,
});

const DECODE_DURATION = 420; // ms

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("ko");
  const [version, setVersion] = useState(0);
  const [scrambling, setScrambling] = useState(false);
  const swapTimer = useRef<number | null>(null);
  const endTimer = useRef<number | null>(null);

  const toggle = useCallback(() => {
    if (swapTimer.current || endTimer.current) return; // ignore during transition
    setScrambling(true);
    // Swap mid-transition so scramble components re-key during the flicker.
    swapTimer.current = window.setTimeout(() => {
      setLang((l) => (l === "ko" ? "en" : "ko"));
      setVersion((v) => v + 1);
      swapTimer.current = null;
    }, DECODE_DURATION * 0.4);
    endTimer.current = window.setTimeout(() => {
      setScrambling(false);
      endTimer.current = null;
    }, DECODE_DURATION);
  }, []);

  // Apply a body-level class so global CSS can run the decode flicker.
  useEffect(() => {
    if (scrambling) document.body.classList.add("lang-scrambling");
    else document.body.classList.remove("lang-scrambling");
  }, [scrambling]);

  useEffect(
    () => () => {
      if (swapTimer.current) window.clearTimeout(swapTimer.current);
      if (endTimer.current) window.clearTimeout(endTimer.current);
    },
    []
  );

  return (
    <LanguageContext.Provider value={{ lang, toggle, version, scrambling }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
