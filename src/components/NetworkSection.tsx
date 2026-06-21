import { Users, GraduationCap, Building2, CalendarDays } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { translations as t } from "@/i18n/translations";

const glass =
  "backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

const stats = [
  { key: "members", value: "90+", label: { ko: "활동 멤버", en: "Active Members" }, icon: Users },
  { key: "faculty", value: "10+", label: { ko: "Faculty Advisors", en: "Faculty Advisors" }, icon: GraduationCap },
  { key: "universities", value: "34+", label: { ko: "대학 네트워크", en: "University Network" }, icon: Building2 },
  { key: "events", value: "10+", label: { ko: "연간 행사", en: "Events / Year" }, icon: CalendarDays },
];

const tiers = [
  {
    key: "students",
    title: { ko: "Students", en: "Students" },
    desc: {
      ko: "보안, 개발, AI 등 다양한 분야에서 함께 성장하는 90+ 활동 멤버.",
      en: "90+ active members growing together in security, development, and AI.",
    },
    icon: Users,
    accent: "primary",
  },
  {
    key: "faculty",
    title: { ko: "Faculty Advisors", en: "Faculty Advisors" },
    desc: {
      ko: "10+ 명의 교수진 및 외부 전문가가 학술적 · 실무적 멘토링을 제공합니다.",
      en: "10+ faculty and external experts providing academic and practical mentorship.",
    },
    icon: GraduationCap,
    accent: "secondary",
  },
  {
    key: "network",
    title: { ko: "University Network", en: "University Network" },
    desc: {
      ko: "고려대학교, 중앙대학교, 경희대학교 등 34+ 개 대학 보안 동아리 연합과 협력합니다.",
      en: "Collaborating with 34+ university security clubs including Korea, Chung-Ang, and Kyung Hee Universities.",
    },
    icon: Building2,
    accent: "primary",
  },
  {
    key: "events",
    title: { ko: "Events", en: "Events" },
    desc: {
      ko: "연 10회 이상의 해커톤, 세미나, 네트워킹, 기업 탐방 행사를 개최 · 참여합니다.",
      en: "Hosting and joining 10+ hackathons, seminars, networking, and company visits each year.",
    },
    icon: CalendarDays,
    accent: "secondary",
  },
];

const NetworkSection = () => {
  const { lang } = useLang();

  return (
    <section id="network">
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 md:px-20 py-16">
        {/* Header */}
        <div className="w-full max-w-6xl mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <div className={`${glass} px-5 py-3 inline-block mb-4`}>
                <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
                  {t.network.cmd[lang]}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
                {t.network.title1[lang]}
                <span className="text-primary text-glow">{t.network.titleHighlight[lang]}</span>
                {t.network.titleEnd[lang]}
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary mt-4 rounded-full" />
            </div>
            <div className="text-muted-foreground text-xs tracking-[0.3em] uppercase font-mono">
              4 {t.network.pillarsLabel[lang]}
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-2xl">
            {t.network.desc[lang]}
          </p>
        </div>

        {/* Stats row */}
        <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className={`${glass} p-5 md:p-6 group hover:border-primary/30 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-5 h-5 text-primary/70" />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-mono">
                    {stat.label[lang]}
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-primary text-glow">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Core pillars */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isPrimary = tier.accent === "primary";
            const accentColor = isPrimary ? "text-primary" : "text-secondary";
            const glowClass = isPrimary ? "text-glow" : "text-glow-cyan";
            const bgSoft = isPrimary ? "bg-primary/[0.08]" : "bg-secondary/[0.08]";
            const borderSoft = isPrimary ? "border-primary/20" : "border-secondary/20";

            return (
              <div
                key={tier.key}
                className={`${glass} ${borderSoft} p-6 md:p-7 flex flex-col items-center text-center hover:bg-background/40 transition-all duration-300 group`}
              >
                <div className={`w-14 h-14 rounded-full ${bgSoft} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${accentColor}`} />
                </div>
                <h3 className={`font-display font-bold text-lg md:text-xl mb-3 ${accentColor} ${glowClass}`}>
                  {tier.title[lang]}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                  {tier.desc[lang]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NetworkSection;
