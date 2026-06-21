import { useEffect, useRef } from "react";
import forum2025 from "@/assets/forum_2025.jpg";
import hackathonA from "@/assets/hackathon_2026_a.jpg";
import hackathonB from "@/assets/hackathon_2026_b.jpg";
import summerFestival from "@/assets/summer_festival.jpg";
import mtA from "@/assets/mt_2026_a.jpg";
import mtB from "@/assets/mt_2026_b.jpg";
import mtC from "@/assets/mt_2026_c.jpg";
import mtD from "@/assets/mt_2026_d.jpg";
import { useLang } from "@/i18n/LanguageContext";
import { translations as t } from "@/i18n/translations";
import { gsap, ScrollTrigger } from "@/lib/smoothScroll";

const glass =
  "backdrop-blur-lg bg-background/25 border border-foreground/[0.08] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)]";

const srcs = [forum2025, hackathonA, hackathonB, summerFestival, mtA, mtB, mtC, mtD];

const PhotoGallery = () => {
  const { lang } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>("[data-photo-card]");
    const tweens: gsap.core.Tween[] = [];
    cards.forEach((card, idx) => {
      gsap.set(card, { y: 40, opacity: 0 });

      const brackets = card.querySelectorAll<HTMLElement>("[data-bracket]");
      const log = card.querySelector<HTMLElement>("[data-log]");
      const logFinal = log?.getAttribute("data-log-final") || "";

      // Brackets: start pushed outward + invisible
      brackets.forEach((b) => {
        const corner = b.getAttribute("data-bracket") || "";
        const dx = corner.includes("l") ? -16 : 16;
        const dy = corner.includes("t") ? -16 : 16;
        gsap.set(b, { x: dx, y: dy, opacity: 0, scale: 1.4 });
      });
      if (log) gsap.set(log, { textContent: "" });

      const tw = gsap.to(card, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: (idx % 2) * 0.12,
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          once: true,
          onEnter: () => {
            // Focus-in brackets
            gsap.to(brackets, {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              ease: "power3.out",
              delay: 0.15,
              stagger: 0.05,
            });
            // Typewriter LOG_00X
            if (log && logFinal) {
              let i = 0;
              const tick = () => {
                i += 1;
                log.textContent = logFinal.slice(0, i);
                if (i < logFinal.length) window.setTimeout(tick, 55);
              };
              window.setTimeout(tick, 250);
            }
          },
        },
      });
      tweens.push(tw);
    });
    return () => {
      tweens.forEach((tw) => {
        tw.scrollTrigger?.kill();
        tw.kill();
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto space-y-10 md:space-y-16">
      {t.gallery.photos.map((photo, i) => {
        const reverse = i % 2 === 1;
        const isPrimary = i % 2 === 0;
        const tickColor = isPrimary ? "border-primary/70" : "border-secondary/70";
        const tagColor = isPrimary ? "text-primary" : "text-secondary";
        const tagColorSoft = isPrimary ? "text-primary/70" : "text-secondary/70";
        const titleClass = isPrimary ? "text-primary text-glow" : "text-secondary text-glow-cyan";
        const lineColor = isPrimary ? "bg-primary/60" : "bg-secondary/60";
        const hoverBorder = isPrimary ? "hover:border-primary/40" : "hover:border-secondary/40";

        return (
          <div
            key={i}
            data-photo-card
            className={`group relative grid md:grid-cols-12 gap-4 md:gap-6 items-center ${
              reverse ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            {/* Image */}
            <div className={`${glass} md:col-span-8 relative overflow-hidden p-0 ${hoverBorder} transition-all duration-500`}>
              <span data-bracket="tl" className={`absolute top-3 left-3 z-20 w-4 h-4 border-t-2 border-l-2 ${tickColor}`} />
              <span data-bracket="tr" className={`absolute top-3 right-3 z-20 w-4 h-4 border-t-2 border-r-2 ${tickColor}`} />
              <span data-bracket="bl" className={`absolute bottom-3 left-3 z-20 w-4 h-4 border-b-2 border-l-2 ${tickColor}`} />
              <span data-bracket="br" className={`absolute bottom-3 right-3 z-20 w-4 h-4 border-b-2 border-r-2 ${tickColor}`} />

              <div className="relative overflow-hidden">
                <img
                  src={srcs[i]}
                  alt={photo.title[lang]}
                  className="w-full h-[340px] md:h-[520px] object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/10 to-transparent" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.04) 2px 3px)",
                  }}
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className={`font-mono text-[10px] tracking-[0.4em] uppercase ${tagColor} bg-background/70 px-2 py-1 rounded`}>
                    {`// ${String(i + 1).padStart(2, "0")}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="md:col-span-4 px-1 md:px-2">
              <div className={`font-mono text-[10px] tracking-[0.4em] uppercase ${tagColorSoft} mb-2`}>
                LOG_{String(i + 1).padStart(3, "0")}
              </div>
              <h3 className={`font-display font-bold text-2xl md:text-4xl leading-tight mb-3 ${titleClass}`}>
                {photo.title[lang]}
              </h3>
              <div className={`h-px w-12 ${lineColor} mb-3`} />
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {photo.desc[lang]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PhotoGallery;
