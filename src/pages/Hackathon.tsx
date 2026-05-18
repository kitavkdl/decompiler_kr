import { useEffect } from "react";
import ReticleCursor from "@/components/ReticleCursor";
import LanguageToggle from "@/components/LanguageToggle";
import ScrambleText from "@/components/ScrambleText";
import { useLang } from "@/i18n/LanguageContext";
import { Calendar, MapPin, Trophy, Globe2, Coffee, UtensilsCrossed, Sparkles, ArrowRight } from "lucide-react";

const glass =
  "backdrop-blur-lg bg-background/30 border border-foreground/[0.08] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]";

const APPLY_URL = "https://forms.gle/kcg8cHj2dgaZuTTC8";

const T = {
  badge: { ko: "DECOMPILER × SUNY KOREA", en: "DECOMPILER × SUNY KOREA" },
  presents: { ko: "PRESENTS", en: "PRESENTS" },
  tagline: { ko: "Dare to Challenge", en: "Dare to Challenge" },
  year: { ko: "2026", en: "2026" },
  intro: {
    ko: "디지털 트랜스포메이션(DX)을 주제로, 무박 2일 동안 코드로 세상을 다시 컴파일하다.",
    en: "A 24-hour overnight hackathon to recompile the world through Digital Transformation.",
  },
  cta: { ko: "지금 신청하기", en: "Apply Now" },
  ctaSub: { ko: "선착순 마감 · 폼 응답 기반 선발", en: "First-come, first-served · Curated by responses" },

  themeLabel: { ko: "// THEME", en: "// THEME" },
  themeTitle: { ko: "Digital Transformation", en: "Digital Transformation" },
  themeDesc: {
    ko: "기술로 산업과 일상을 재정의하는 모든 아이디어. 자유로운 형식, 무한한 가능성.",
    en: "Any idea that redefines industries and everyday life through technology. Free form, infinite possibilities.",
  },

  scheduleLabel: { ko: "// SCHEDULE", en: "// SCHEDULE" },
  scheduleTitle: { ko: "일정", en: "Schedule" },
  scheduleDate: { ko: "2026년 5월 30일 – 31일", en: "May 30 – 31, 2026" },
  scheduleSub: { ko: "무박 2일 · 24시간 풀 코딩", en: "Overnight · 24 hours of pure code" },

  locationLabel: { ko: "// LOCATION", en: "// LOCATION" },
  locationTitle: { ko: "장소", en: "Location" },
  locationName: { ko: "Incheon Global Campus Guest House", en: "Incheon Global Campus Guest House" },
  locationDetail: { ko: "21층 Banquet Hall", en: "21st Floor, Banquet Hall" },
  locationAddr: {
    ko: "인천 연수구 송도문화로 119",
    en: "119 Songdomunhwa-ro, Yeonsu-gu, Incheon",
  },

  prizeLabel: { ko: "// PRIZES", en: "// PRIZES" },
  prizeTitle: { ko: "상금", en: "Prizes" },
  prize1: { ko: "1,000,000원", en: "₩1,000,000" },
  prize1Sub: { ko: "1st Place", en: "1st Place" },
  prize2: { ko: "500,000원", en: "₩500,000" },
  prize2Sub: { ko: "2nd Place", en: "2nd Place" },
  prize3: { ko: "커스텀 USB & 부상", en: "Custom USB & Goodies" },
  prize3Sub: { ko: "3rd Place", en: "3rd Place" },

  perksLabel: { ko: "// PERKS", en: "// PERKS" },
  perksTitle: { ko: "우리 해커톤의 특징", en: "What Makes Us Different" },
  perk1Title: { ko: "전 식사 제공", en: "All Meals Provided" },
  perk1Desc: { ko: "아침·점심·저녁·야식까지 전부", en: "Breakfast, lunch, dinner & midnight snacks" },
  perk2Title: { ko: "무한 카페인", en: "Unlimited Caffeine" },
  perk2Desc: { ko: "커피, 에너지드링크, 간식 무제한", en: "Coffee, energy drinks, snacks — limitless" },
  perk3Title: { ko: "All in English", en: "All in English" },
  perk3Desc: { ko: "모든 진행과 발표가 영어로", en: "Every session and presentation in English" },

  applyLabel: { ko: "// REGISTER", en: "// REGISTER" },
  applyTitle: { ko: "도전할 준비, 됐는가?", en: "Ready to Challenge?" },
  applyDesc: {
    ko: "선착순으로 마감되며, 폼 응답이 선발 과정에 반영될 수 있습니다.",
    en: "Registration is on a first-come, first-served basis. Form responses may be considered in the selection process.",
  },
};

const Hackathon = () => {
  const { lang } = useLang();

  useEffect(() => {
    document.title = lang === "ko"
      ? "Hackathon: The X 2026 — Decompiler"
      : "Hackathon: The X 2026 — Decompiler";
  }, [lang]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden scan-line">
      <ReticleCursor />
      <LanguageToggle />

      {/* Animated grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--secondary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--secondary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      {/* Glow orbs */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[120px]" />

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
        {/* HERO */}
        <section className="text-center mb-24 md:mb-32">
          <div className={`${glass} inline-block px-5 py-2 mb-6`}>
            <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/80 font-mono">
              {T.badge[lang]} · {T.presents[lang]}
            </span>
          </div>

          <h1 className="font-display font-black leading-[0.85] mb-6">
            <span className="block text-5xl md:text-8xl lg:text-9xl text-foreground">
              <ScrambleText text="HACKATHON" />
            </span>
            <span className="block mt-2 text-6xl md:text-9xl lg:text-[10rem] text-primary text-glow tracking-tight">
              THE&nbsp;X
            </span>
          </h1>

          <p className="font-mono text-secondary text-glow-cyan text-xs md:text-sm tracking-[0.5em] mb-4">
            {T.tagline[lang]} · {T.year[lang]}
          </p>

          <p className="max-w-2xl mx-auto text-foreground/70 text-sm md:text-base mb-10 leading-relaxed">
            {T.intro[lang]}
          </p>

          <a
            href={APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary/10 border-2 border-primary text-primary font-display font-bold tracking-[0.2em] uppercase text-sm rounded-lg neon-border hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            {T.cta[lang]}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
          <p className="mt-3 text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-mono">
            {T.ctaSub[lang]}
          </p>
        </section>

        {/* THEME */}
        <section className="mb-16 md:mb-24">
          <div className={`${glass} p-8 md:p-12 text-center relative overflow-hidden`}>
            <div className="absolute top-4 left-6 text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
              {T.themeLabel[lang]}
            </div>
            <Sparkles className="mx-auto w-8 h-8 text-secondary mb-4 mt-4" />
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              <span className="text-secondary text-glow-cyan">DX</span>
              <span className="text-foreground/70 mx-3">/</span>
              {T.themeTitle[lang]}
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
              {T.themeDesc[lang]}
            </p>
          </div>
        </section>

        {/* SCHEDULE + LOCATION */}
        <section className="grid md:grid-cols-2 gap-5 mb-16 md:mb-24">
          <div className={`${glass} p-8 group hover:border-primary/40 transition-colors duration-300`}>
            <div className="flex items-center gap-3 mb-5">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
                {T.scheduleLabel[lang]}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              {T.scheduleTitle[lang]}
            </h3>
            <p className="text-primary text-glow text-xl md:text-2xl font-display font-semibold mb-2">
              {T.scheduleDate[lang]}
            </p>
            <p className="text-muted-foreground text-sm font-mono">{T.scheduleSub[lang]}</p>
          </div>

          <div className={`${glass} p-8 group hover:border-secondary/40 transition-colors duration-300`}>
            <div className="flex items-center gap-3 mb-5">
              <MapPin className="w-5 h-5 text-secondary" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
                {T.locationLabel[lang]}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              {T.locationTitle[lang]}
            </h3>
            <p className="text-secondary text-glow-cyan text-base md:text-lg font-display font-semibold leading-snug">
              {T.locationName[lang]}
            </p>
            <p className="text-foreground/80 text-sm mb-1">{T.locationDetail[lang]}</p>
            <p className="text-muted-foreground text-xs font-mono">{T.locationAddr[lang]}</p>
          </div>
        </section>

        {/* PRIZES */}
        <section className="mb-16 md:mb-24">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
              {T.prizeLabel[lang]}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-secondary/30 to-transparent" />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { rank: "01", title: T.prize1[lang], sub: T.prize1Sub[lang], color: "primary", glow: "text-glow" },
              { rank: "02", title: T.prize2[lang], sub: T.prize2Sub[lang], color: "secondary", glow: "text-glow-cyan" },
              { rank: "03", title: T.prize3[lang], sub: T.prize3Sub[lang], color: "foreground", glow: "" },
            ].map((p, i) => (
              <div
                key={i}
                className={`${glass} p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
              >
                <div className="absolute -top-4 -right-2 text-[8rem] font-display font-black text-foreground/5 leading-none select-none">
                  {p.rank}
                </div>
                <p className={`text-${p.color} ${p.glow} text-3xl md:text-4xl font-display font-bold mb-2 relative`}>
                  {p.title}
                </p>
                <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase font-mono relative">
                  {p.sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PERKS */}
        <section className="mb-16 md:mb-24">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-secondary/40" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
                {T.perksLabel[lang]}
              </span>
              <div className="w-8 h-px bg-secondary/40" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {T.perksTitle[lang]}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: UtensilsCrossed, title: T.perk1Title[lang], desc: T.perk1Desc[lang] },
              { icon: Coffee, title: T.perk2Title[lang], desc: T.perk2Desc[lang] },
              { icon: Globe2, title: T.perk3Title[lang], desc: T.perk3Desc[lang] },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className={`${glass} p-7 text-center group hover:border-primary/40 transition-all duration-300`}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/30 mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-display font-bold text-foreground mb-2">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* APPLY CTA */}
        <section className="text-center">
          <div className={`${glass} p-10 md:p-16 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative">
              <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono mb-4">
                {T.applyLabel[lang]}
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                {T.applyTitle[lang].split("").map((c, i) => c)}
                <span className="text-primary text-glow">_</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-8">
                {T.applyDesc[lang]}
              </p>
              <a
                href={APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground font-display font-bold tracking-[0.2em] uppercase text-sm rounded-lg hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] transition-all duration-300"
              >
                {T.cta[lang]}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <p className="mt-6 text-xs text-muted-foreground font-mono">
                contact: decompiler.sbu@gmail.com
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-16 text-center text-muted-foreground text-[10px] opacity-40 font-mono">
          © 2026 Decompiler — SUNY Korea
        </footer>
      </main>
    </div>
  );
};

export default Hackathon;
