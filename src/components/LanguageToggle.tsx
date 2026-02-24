import { useLang } from "@/i18n/LanguageContext";

const LanguageToggle = () => {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      className="fixed top-5 right-5 z-50 backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-lg px-3 py-1.5 text-xs font-mono tracking-widest text-secondary hover:border-primary/40 hover:text-primary transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.3)] pointer-events-auto cursor-pointer"
      aria-label="Toggle language"
    >
      {lang === "ko" ? "EN" : "한"}
    </button>
  );
};

export default LanguageToggle;
