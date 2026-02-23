import { Shield, Code, Users, Award } from "lucide-react";

const activities = [
  {
    icon: Shield,
    title: "Security",
    subtitle: "보안 연구",
    items: ["웹 해킹 & 시스템 해킹", "리버스 엔지니어링", "CTF 대회 참가", "Google Cybersecurity Certificate"],
  },
  {
    icon: Code,
    title: "Development",
    subtitle: "개발 스터디",
    items: ["웹 개발 (React, Node.js)", "Python / Java 코딩 스터디", "AI & 머신러닝 프로젝트", "해커톤 참가"],
  },
  {
    icon: Users,
    title: "Community",
    subtitle: "커뮤니티",
    items: ["MT (바닷가 여행)", "학기초 & 시험 후 회식", "외부 연사 초청 세미나", "엔드 세미나 & 네트워킹"],
  },
  {
    icon: Award,
    title: "Professional",
    subtitle: "전문 활동",
    items: ["SUNY Korea 최초 아이디어톤 개최", "Google Certificate 자격증 스터디", "외부 기관 협력 프로젝트", "암호학 연구"],
  },
];

const ActivityCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div
            key={activity.title}
            className="group relative border border-border rounded-lg p-6 bg-card/40 backdrop-blur-sm transition-all duration-500 hover:border-secondary/60 hover:bg-card/70 hover:shadow-[0_0_30px_hsl(189_100%_50%/0.15)] hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded border border-secondary/30 text-secondary group-hover:border-secondary/60 group-hover:shadow-[0_0_12px_hsl(189_100%_50%/0.3)] transition-all duration-500">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-lg">
                  {activity.title}
                </h3>
                <p className="text-muted-foreground text-xs">{activity.subtitle}</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {activity.items.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground text-sm flex items-center gap-2"
                >
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
