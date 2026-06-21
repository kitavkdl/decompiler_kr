import { Folder, FileCode, Terminal } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { translations as t } from "@/i18n/translations";

const glass =
  "backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

const itemsByIndex = t.activities.cards.map((card) => card.items);

const ActivityCards = () => {
  const { lang } = useLang();

  return (
    <div className={`${glass} w-full max-w-4xl mx-auto overflow-hidden font-mono`}>
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.06] bg-background/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-[11px] tracking-wider text-foreground/60">modules.list()</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-secondary/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
        </div>
      </div>

      {/* Directory tree */}
      <div className="p-5 md:p-7 text-sm">
        <div className="text-[11px] tracking-[0.3em] uppercase text-secondary/60 mb-4">
          root@decompiler:~/club/modules
        </div>

        <div className="space-y-0">
          {t.activities.cards.map((activity, i) => {
            const items = itemsByIndex[i][lang];
            const isLast = i === t.activities.cards.length - 1;

            return (
              <div key={i} className="group">
                {/* Directory row */}
                <div className="flex items-start gap-2 py-1.5 hover:bg-foreground/[0.03] rounded transition-colors duration-300 -mx-1 px-1">
                  <span className="text-secondary/50 select-none font-mono text-xs leading-5">{isLast ? "└─" : "├─"}</span>
                  <Folder className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="leading-5">
                    <span className="text-primary font-bold">{activity.title[lang]}/</span>
                    <span className="text-muted-foreground text-xs ml-2">{activity.subtitle[lang]}</span>
                  </div>
                </div>

                {/* Files under directory */}
                <div className="pl-6 border-l border-dashed border-foreground/[0.08] ml-[0.35rem]">
                  {items.map((item, j) => {
                    const isLastItem = j === items.length - 1;
                    return (
                      <div
                        key={j}
                        className="flex items-start gap-2 py-1 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        <span className="text-secondary/30 select-none text-xs leading-5">
                          {isLast && isLastItem ? "└──" : "├──"}
                        </span>
                        <FileCode className="w-3.5 h-3.5 text-secondary/60 mt-0.5 flex-shrink-0" />
                        <span className="text-xs md:text-sm leading-5">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Command prompt */}
        <div className="mt-6 flex items-center gap-2 text-xs text-foreground/40">
          <span className="text-primary">➜</span>
          <span className="text-secondary/60">modules</span>
          <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ActivityCards;
