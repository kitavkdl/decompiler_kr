import { Folder, FolderOpen, FileCode, Terminal, ChevronRight, X, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { translations as t } from "@/i18n/translations";
import Typewriter from "./Typewriter";

const glass =
  "backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

const itemsByIndex = t.activities.cards.map((card) => card.items);

// External-link map: clicking these files opens an external URL instead of the detail pane.
const fileLinks: Record<number, Record<number, string>> = {
  1: { 3: "https://www.seek-once.com" },
};

// Dummy details (replace freely in code) — [dirIdx][fileIdx] = { meta, body }
const fileDetails: Record<
  number,
  Record<
    number,
    {
      size: string;
      modified: string;
      tags: string[];
      body: { ko: string; en: string };
    }
  >
> = {
  0: {
    0: {
      size: "12.4 KB",
      modified: "2026-03-12",
      tags: ["web", "pwn", "exploit"],
      body: {
        ko: "주 1회 모여 OWASP Top 10부터 실전 CTF 문제까지 함께 분석합니다. 초심자 트랙과 심화 트랙으로 분리 운영됩니다.",
        en: "Weekly sessions covering OWASP Top 10 to real CTF challenges. Split into beginner and advanced tracks.",
      },
    },
    1: {
      size: "8.1 KB",
      modified: "2026-02-28",
      tags: ["binary", "ghidra", "x86"],
      body: {
        ko: "Ghidra/IDA를 활용해 바이너리를 분해하고 취약점을 찾는 과정을 다룹니다.",
        en: "Disassemble binaries with Ghidra/IDA and hunt for vulnerabilities.",
      },
    },
    2: {
      size: "—",
      modified: "ongoing",
      tags: ["ctf", "team"],
      body: {
        ko: "국내외 CTF 참가 팀 구성 및 출제 분석 회고를 지원합니다.",
        en: "Team formation and post-mortems for domestic & international CTFs.",
      },
    },
    3: {
      size: "cert",
      modified: "cohort",
      tags: ["coursera", "google"],
      body: {
        ko: "Google Cybersecurity Professional Certificate 스터디 그룹.",
        en: "Study group for the Google Cybersecurity Professional Certificate.",
      },
    },
  },
  1: {
    0: {
      size: "32.0 KB",
      modified: "2026-03-18",
      tags: ["react", "node", "fullstack"],
      body: {
        ko: "실제 사이드 프로젝트를 진행하며 React/Node 풀스택을 경험합니다.",
        en: "Ship real side projects with a React/Node fullstack workflow.",
      },
    },
    1: {
      size: "10.2 KB",
      modified: "2026-03-05",
      tags: ["python", "java", "algo"],
      body: {
        ko: "주차별 문제 풀이 및 코드 리뷰. 면접 대비 알고리즘 트랙 포함.",
        en: "Weekly problem solving and code reviews. Includes interview-prep algorithm track.",
      },
    },
    2: {
      size: "—",
      modified: "2026",
      tags: ["ml", "llm", "rag"],
      body: {
        ko: "LLM/RAG 기반 사이드 프로젝트 인큐베이션 트랙.",
        en: "Incubator track for LLM/RAG-based side projects.",
      },
    },
    3: {
      size: "—",
      modified: "—",
      tags: ["sbu", "research"],
      body: {
        ko: "SBU Seek-Once 연구 협력 프로그램에 동아리원이 참여합니다.",
        en: "Members participate in the SBU Seek-Once research collaboration program.",
      },
    },
  },
  2: {
    0: {
      size: "🏕️",
      modified: "semester",
      tags: ["trip", "bonding"],
      body: {
        ko: "학기 1회 정기 MT. 모든 비용 일부 동아리비 지원.",
        en: "Once-per-semester club retreat. Partially subsidized by club funds.",
      },
    },
    1: { size: "🍻", modified: "x2/sem", tags: ["dinner"], body: { ko: "학기 시작 & 시험 종료 후 단체 회식.", en: "Group dinners at semester start and after finals." } },
    2: { size: "🎤", modified: "monthly", tags: ["talk"], body: { ko: "업계 보안/개발 종사자 초청 강연 시리즈.", en: "Monthly invited talks from industry security & dev practitioners." } },
    3: { size: "🤝", modified: "end-of-sem", tags: ["networking"], body: { ko: "학기말 데모데이 + 네트워킹.", en: "End-of-semester demo day + networking." } },
  },
  3: {
    0: { size: "🏆", modified: "2025", tags: ["ideathon"], body: { ko: "SUNY Korea 최초의 아이디어톤을 동아리가 직접 기획·운영.", en: "Club-organized: the first-ever ideathon at SUNY Korea." } },
    1: { size: "—", modified: "active", tags: ["collab"], body: { ko: "외부 기관/기업과의 협력 프로젝트.", en: "Joint projects with external institutions and companies." } },
    2: { size: "—", modified: "—", tags: ["research"], body: { ko: "실생활 보안 이슈 분석 및 정책 제언.", en: "Real-world security analysis and policy recommendations." } },
    3: { size: "🚌", modified: "yearly", tags: ["tour"], body: { ko: "보안/IT 기업 탐방 프로그램.", en: "Site visits to security and IT companies." } },
  },
};

const ActivityCards = () => {
  const { lang } = useLang();
  const [openDirs, setOpenDirs] = useState<Record<number, boolean>>({ 0: true });
  const [selected, setSelected] = useState<{ dir: number; file: number } | null>(null);

  const toggleDir = (i: number) =>
    setOpenDirs((s) => ({ ...s, [i]: !s[i] }));

  const sel = selected ? fileDetails[selected.dir]?.[selected.file] : null;
  const selDir = selected ? t.activities.cards[selected.dir] : null;
  const selFileName = selected ? itemsByIndex[selected.dir][lang][selected.file] : null;

  return (
    <div className={`${glass} w-full max-w-5xl mx-auto overflow-hidden font-mono`}>
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.06] bg-background/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-[11px] tracking-wider text-foreground/60">modules.explorer()</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-secondary/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Tree */}
        <div className="md:col-span-5 lg:col-span-5 p-5 md:p-6 text-sm border-b md:border-b-0 md:border-r border-foreground/[0.06]">
          <div className="text-[11px] tracking-[0.3em] uppercase text-secondary/60 mb-4">
            root@decompiler:~/club/modules
          </div>

          <div className="space-y-0">
            {t.activities.cards.map((activity, i) => {
              const items = itemsByIndex[i][lang];
              const isLast = i === t.activities.cards.length - 1;
              const open = !!openDirs[i];

              return (
                <div key={i} className="group">
                  {/* Directory row */}
                  <button
                    onClick={() => toggleDir(i)}
                    className="w-full flex items-center gap-2 py-1.5 hover:bg-foreground/[0.04] rounded transition-colors duration-200 -mx-1 px-1 text-left"
                  >
                    <span className="text-secondary/50 select-none text-xs leading-5">{isLast ? "└─" : "├─"}</span>
                    <ChevronRight
                      className={`w-3 h-3 text-primary/70 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                    />
                    {open ? (
                      <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                    <span className="text-primary font-bold">{activity.title[lang]}/</span>
                    <span className="text-muted-foreground text-[11px] ml-1 truncate">{activity.subtitle[lang]}</span>
                  </button>

                  {/* Files */}
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                      open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-6 border-l border-dashed border-foreground/[0.1] ml-[0.45rem] mt-0.5 mb-2">
                      {items.map((item, j) => {
                        const isLastItem = j === items.length - 1;
                        const isSel = selected?.dir === i && selected?.file === j;
                        const linkUrl = fileLinks[i]?.[j];
                        return (
                          <button
                            key={j}
                            onClick={() => {
                              if (linkUrl) {
                                window.open(linkUrl, "_blank", "noopener,noreferrer");
                              } else {
                                setSelected({ dir: i, file: j });
                              }
                            }}
                            className={`w-full flex items-center gap-2 py-1 px-1 -mx-1 rounded transition-colors duration-200 text-left ${
                              isSel
                                ? "bg-primary/10 text-foreground"
                                : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                            }`}
                          >
                            <span className="text-secondary/30 select-none text-xs leading-5">
                              {isLast && isLastItem ? "└──" : "├──"}
                            </span>
                            <FileCode
                              className={`w-3.5 h-3.5 flex-shrink-0 ${isSel ? "text-primary" : linkUrl ? "text-secondary" : "text-secondary/60"}`}
                            />
                            <span className="text-xs md:text-sm leading-5 truncate">{item}</span>
                            {linkUrl && (
                              <ExternalLink className="w-3 h-3 text-secondary/70 flex-shrink-0 ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-foreground/40">
            <span className="text-primary">➜</span>
            <span className="text-secondary/60">modules</span>
            <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse" />
          </div>
        </div>

        {/* Detail pane */}
        <div className="md:col-span-7 lg:col-span-7 p-5 md:p-6 bg-background/20 min-h-[280px]">
          {sel && selDir && selFileName ? (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-secondary/60 mb-1 truncate">
                    ~/modules/{selDir.title[lang]}/
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-primary font-bold text-sm md:text-base truncate">{selFileName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-foreground/40 hover:text-foreground transition-colors p-1 -m-1"
                  aria-label="close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-[10px]">
                <div className="rounded border border-foreground/[0.06] bg-background/30 px-2 py-1.5">
                  <div className="text-foreground/40 tracking-wider uppercase">size</div>
                  <div className="text-foreground/80 font-bold">{sel.size}</div>
                </div>
                <div className="rounded border border-foreground/[0.06] bg-background/30 px-2 py-1.5">
                  <div className="text-foreground/40 tracking-wider uppercase">modified</div>
                  <div className="text-foreground/80 font-bold">{sel.modified}</div>
                </div>
                <div className="rounded border border-foreground/[0.06] bg-background/30 px-2 py-1.5">
                  <div className="text-foreground/40 tracking-wider uppercase">type</div>
                  <div className="text-foreground/80 font-bold">.md</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {sel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-secondary/30 text-secondary/80 bg-secondary/[0.06]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="rounded-lg border border-foreground/[0.06] bg-background/40 p-4">
                <div className="text-[10px] text-foreground/40 mb-2 tracking-wider">$ cat {selFileName}.md</div>
                <p className="text-xs md:text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                  {sel.body[lang]}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <Folder className="w-10 h-10 text-primary/40 mb-3" />
              <div className="text-xs tracking-[0.2em] uppercase text-foreground/40">
                {lang === "ko" ? "파일을 선택하세요" : "Select a file"}
              </div>
              <div className="text-[11px] text-foreground/30 mt-1">
                {lang === "ko" ? "왼쪽 트리에서 항목을 클릭" : "Click an item in the tree"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCards;
