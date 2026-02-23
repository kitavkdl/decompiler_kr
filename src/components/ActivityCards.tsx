import { Shield, Code, Users, Award } from "lucide-react";

const glass =
  "backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

const activities = [
  {
    icon: Shield,
    title: "Security",
    subtitle: "보안 연구",
    items: ["웹 해킹 & 시스템 해킹", "리버스 엔지니어링", "CTF 대회 참가 지원", "Google Cybersecurity Certificate"],
  },
  {
    icon: Code,
    title: "Development",
    subtitle: "개발 스터디",
    items: [
      "웹 개발 (React, Node.js, etc..)",
      "Python / Java 코딩 스터디",
      "AI & 머신러닝 프로젝트",
      "SBU Seek-Once Project",
    ],
  },
  {
    icon: Users,
    title: "Community",
    subtitle: "커뮤니티",
    items: ["MT (여행)", "학기초 & 시험 후 회식", "외부 연사 초청 강연", "엔드 세미나 & 네트워킹"],
  },
  {
    icon: Award,
    title: "Professional",
    subtitle: "전문 활동",
    items: [
      "SUNY Korea 최초 아이디어톤 개최",
      "외부 기관 협력 프로젝트",
      "실생활 보안연구 및 제언",
      "외부기업 탐방 및 투어",
    ],
  },
];

const ActivityCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl mx-auto">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div
            key={activity.title}
            className={`${glass} group p-5 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_24px_rgba(255,0,255,0.12)] hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded border border-primary/20 text-primary group-hover:border-primary/50 group-hover:shadow-[0_0_12px_rgba(255,0,255,0.2)] transition-all duration-500">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-base">{activity.title}</h3>
                <p className="text-muted-foreground text-[10px]">{activity.subtitle}</p>
              </div>
            </div>
            <ul className="space-y-1">
              {activity.items.map((item) => (
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
