import { Shield, Code, Users, Award } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { translations as t } from "@/i18n/translations";

const glass =
  "backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

const icons = [Shield, Code, Users, Award];

const ActivityCards = () => {
  const { lang } = useLang();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl mx-auto">
      {t.activities.cards.map((activity, i) => {
        const Icon = icons[i];
        return (
          <div
            key={i}
            className={`${glass} group p-5 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_24px_rgba(255,0,255,0.12)] hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded border border-primary/20 text-primary group-hover:border-primary/50 group-hover:shadow-[0_0_12px_rgba(255,0,255,0.2)] transition-all duration-500">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-base">{activity.title[lang]}</h3>
                <p className="text-muted-foreground text-[10px]">{activity.subtitle[lang]}</p>
              </div>
            </div>
            <ul className="space-y-1">
              {activity.items[lang].map((item) => (
                <li key={item} className="text-muted-foreground text-xs flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityCards;
