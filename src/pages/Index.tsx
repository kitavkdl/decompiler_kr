import Scene3D from "../components/Scene3D";
import ScrambleText from "../components/ScrambleText";
import ReticleCursor from "../components/ReticleCursor";
import ActivityCards from "../components/ActivityCards";
import PhotoGallery from "../components/PhotoGallery";
import NetworkSection from "../components/NetworkSection";
import LanguageToggle from "../components/LanguageToggle";
import TypingLabel from "../components/TypingLabel";
import RevealLines from "../components/RevealLines";
import BrandHeadline from "../components/BrandHeadline";
import { useLang } from "@/i18n/LanguageContext";
import { translations as t } from "@/i18n/translations";

const glass =
  "backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

const Index = () => {
  const { lang } = useLang();

  return (
    <div className="bg-background scan-line">
      <ReticleCursor />
      <LanguageToggle />
      <Scene3D />
      <div id="scroll-container" className="relative z-10 pointer-events-auto">
        {/* HERO */}
        <section id="hero">
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 md:px-6">
            <div className={`${glass} px-6 py-10 md:px-12 md:py-14`}>
              <p className="text-xs tracking-[0.5em] uppercase text-secondary/70 mb-6 animate-fade-in font-mono">
                {t.hero.subtitle[lang]}
              </p>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-bold text-foreground mb-4 leading-tight">
                <ScrambleText text="Decompiler" className="text-primary text-glow" autoPlay duration={1700} revealStagger={90} />
              </h1>
              <p className="text-base md:text-2xl font-display font-light text-foreground/80 mb-2">
                <ScrambleText key={`tl1-${lang}`} text={t.hero.tagline1[lang]} autoPlay duration={1500} revealStagger={50} />
              </p>
              <p className="text-base md:text-2xl font-display font-light text-secondary text-glow-cyan">
                <ScrambleText key={`tl2-${lang}`} text={t.hero.tagline2[lang]} autoPlay duration={1700} revealStagger={45} />
              </p>
            </div>
            <div className="mt-10 flex items-center gap-3 text-muted-foreground text-[10px] tracking-[0.3em] uppercase animate-pulse-glow font-mono">
              <span className="w-8 h-px bg-secondary/30" />
              <span>{t.hero.scroll[lang]}</span>
              <span className="w-8 h-px bg-secondary/30" />
            </div>
          </div>
        </section>

        <div className="rgb-split h-px w-full my-4" />

        {/* ABOUT */}
        <section id="about">
          <div className="flex items-center justify-start min-h-screen px-4 md:px-20">
            <div className="max-w-2xl space-y-4">
              <div className={`${glass} px-5 py-3 inline-block`}>
                <TypingLabel
                  key={`about-${lang}`}
                  text={t.about.cmd[lang]}
                  className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono"
                />
              </div>
              <div className={`${glass} p-6 md:p-8`}>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                  <BrandHeadline
                    key={`bh-${lang}`}
                    prefix={t.about.title1[lang]}
                    shatter={t.about.titleHighlight1[lang]}
                    mid={t.about.titleMid[lang]}
                    assemble={t.about.titleHighlight2[lang]}
                    suffix={t.about.titleEnd[lang]}
                  />
                </h2>
              </div>
              <div className={`${glass} p-5 md:p-6`}>
                <RevealLines
                  key={`about-desc-${lang}`}
                  text={t.about.desc[lang]}
                  className="text-muted-foreground leading-relaxed text-sm md:text-base"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="rgb-split h-px w-full my-4" />

        {/* ACTIVITIES */}
        <section id="activities">
          <div className="flex flex-col items-center justify-center min-h-screen px-4 md:px-20 py-16">
            <div className={`${glass} px-5 py-3 mb-4`}>
              <TypingLabel
                key={`act-${lang}`}
                text={t.activities.cmd[lang]}
                className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono"
              />
            </div>
            <div className={`${glass} p-5 md:p-6 text-center mb-4`}>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">{t.activities.title[lang]}</h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                {t.activities.desc[lang]}
              </p>
            </div>
            <div className={`${glass} px-4 py-2 rounded-full mb-8`}>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-primary text-xs font-mono">{t.activities.badge[lang]}</span>
              </div>
            </div>
            <ActivityCards />
          </div>
        </section>

        <div className="rgb-split h-px w-full my-4" />

        {/* GALLERY */}
        <section id="gallery">
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 md:px-20 py-16">
            <div className={`${glass} px-5 py-3 mb-4`}>
              <TypingLabel
                key={`gal-${lang}`}
                text={t.gallery.cmd[lang]}
                className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono"
              />
            </div>
            <div className={`${glass} p-5 text-center mb-8`}>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {t.gallery.title[lang]}<span className="text-secondary text-glow-cyan">{t.gallery.titleHighlight[lang]}</span>
              </h2>
            </div>
            <PhotoGallery />
          </div>
        </section>

        <div className="rgb-split h-px w-full my-4" />

        {/* NETWORK */}
        <NetworkSection />

        <div className="rgb-split h-px w-full my-4" />

        {/* JOIN / CTA */}
        <section id="join">
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
            <div className={`${glass} px-5 py-3 mb-4`}>
              <TypingLabel
                key={`join-${lang}`}
                text={t.join.cmd[lang]}
                className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono"
              />
            </div>
            <div className={`${glass} p-6 md:p-10 max-w-lg mb-6`}>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                {t.join.title1[lang]}<span className="text-primary text-glow">{t.join.titleHighlight[lang]}</span>{t.join.titleEnd[lang]}
                <br />
                {t.join.title2[lang]}
              </h2>
              <p className="text-muted-foreground text-sm mb-8 whitespace-pre-line">
                {t.join.desc[lang]}
              </p>
              {(() => {
                const raw = t.join.cta[lang];
                const label = raw.replace(/[→\s]+$/, "");
                return (
                  <a
                    href="https://forms.gle/6gyR6pFhpLdvjwd29"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-2 px-10 py-3.5 bg-primary/10 border border-primary text-primary font-display font-semibold tracking-wider uppercase text-sm rounded-lg neon-border hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_32px_hsl(var(--primary)/0.55),0_0_64px_hsl(var(--primary)/0.25)]"
                  >
                    <span>{label}</span>
                    <span
                      aria-hidden
                      className="inline-block will-change-transform group-hover:[animation:recruit-arrow_1.1s_ease-in-out_infinite]"
                    >
                      →
                    </span>
                    <style>{`@keyframes recruit-arrow{0%,100%{transform:translateX(0)}50%{transform:translateX(8px)}}`}</style>
                  </a>
                );
              })()}
            </div>
            <div className="mt-16 text-muted-foreground text-[10px] opacity-40 font-mono">
              © 2026 Decompiler — SUNY Korea
              <br />
              jiyul.ahn@stonybrook.edu
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
