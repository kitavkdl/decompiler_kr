import { createContext, useContext, useState, ReactNode } from "react";
import { Lang } from "./translations";

type Ctx = { lang: Lang; toggle: () => void };
const LanguageContext = createContext<Ctx>({ lang: "ko", toggle: () => {} });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("ko");
  const toggle = () => setLang((l) => (l === "ko" ? "en" : "ko"));
  return <LanguageContext.Provider value={{ lang, toggle }}>{children}</LanguageContext.Provider>;
};

export const useLang = () => useContext(LanguageContext);
