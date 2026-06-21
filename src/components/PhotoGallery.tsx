import endSeminar from "@/assets/end_seminar.jpeg";
import ideathon from "@/assets/ideathon.jpeg";
import groupStudy from "@/assets/group_study.jpeg";
import { useLang } from "@/i18n/LanguageContext";
import { translations as t } from "@/i18n/translations";

const glass =
  "backdrop-blur-lg bg-background/25 border border-foreground/[0.08] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)]";

const srcs = [endSeminar, ideathon, groupStudy];

const PhotoGallery = () => {
  const { lang } = useLang();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 md:space-y-16">
      {t.gallery.photos.map((photo, i) => {
        const reverse = i % 2 === 1;
        const accent = i % 2 === 0 ? "primary" : "secondary";
        const glowClass = accent === "primary" ? "text-glow" : "text-glow-cyan";
        return (
          <div
            key={i}
            className={`group relative grid md:grid-cols-12 gap-4 md:gap-6 items-center ${
              reverse ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            {/* Image */}
            <div
              className={`${glass} md:col-span-8 relative overflow-hidden p-0 hover:border-${accent}/40 transition-all duration-500`}
            >
              {/* corner ticks */}
              <span className={`absolute top-3 left-3 z-20 w-4 h-4 border-t-2 border-l-2 border-${accent}/70`} />
              <span className={`absolute top-3 right-3 z-20 w-4 h-4 border-t-2 border-r-2 border-${accent}/70`} />
              <span className={`absolute bottom-3 left-3 z-20 w-4 h-4 border-b-2 border-l-2 border-${accent}/70`} />
              <span className={`absolute bottom-3 right-3 z-20 w-4 h-4 border-b-2 border-r-2 border-${accent}/70`} />

              <div className="relative overflow-hidden">
                <img
                  src={srcs[i]}
                  alt={photo.title[lang]}
                  className="w-full h-[340px] md:h-[520px] object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/10 to-transparent" />
                {/* scan overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.04) 2px 3px)",
                  }}
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className={`font-mono text-[10px] tracking-[0.4em] uppercase text-${accent} bg-background/70 px-2 py-1 rounded`}>
                    {`// ${String(i + 1).padStart(2, "0")}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="md:col-span-4 px-1 md:px-2">
              <div className={`font-mono text-[10px] tracking-[0.4em] uppercase text-${accent}/70 mb-2`}>
                LOG_{String(i + 1).padStart(3, "0")}
              </div>
              <h3
                className={`font-display font-bold text-2xl md:text-4xl leading-tight mb-3 text-${accent} ${glowClass}`}
              >
                {photo.title[lang]}
              </h3>
              <div className={`h-px w-12 bg-${accent}/60 mb-3`} />
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
