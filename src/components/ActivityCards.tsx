import { useState, useRef } from "react";
import endSeminar from "@/assets/end_seminar.jpeg";
import ideathon from "@/assets/2025_ideathon.jpeg";
import groupStudy from "@/assets/group_study.jpeg";
import professional from "@/assets/professional.jpg";

const cards = [
  {
    title: "Security",
    subtitle: "보안 연구 & CTF",
    description: "웹 해킹, 리버스 엔지니어링, 암호학 등 다양한 보안 분야를 학기별 스터디와 CTF 대회를 통해 깊이 있게 탐구합니다.",
    image: groupStudy,
    tag: "CORE",
  },
  {
    title: "Development",
    subtitle: "2025 Ideathon",
    description: "SUNY Korea 최초의 아이디어톤을 주최하며, 보안 기술을 실제 프로덕트로 구현하는 개발 역량을 키웁니다.",
    image: ideathon,
    tag: "EVENT",
  },
  {
    title: "Community",
    subtitle: "Semester End Seminar",
    description: "학기말 세미나, 네트워킹 이벤트를 통해 멤버 간 지식을 공유하고 유대를 강화합니다.",
    image: endSeminar,
    tag: "SOCIAL",
  },
  {
    title: "Professional",
    subtitle: "Industry Connect",
    description: "현업 보안 전문가 초청 강연, 인턴십 연계, 포트폴리오 빌딩을 통해 커리어를 준비합니다.",
    image: professional,
    tag: "CAREER",
  },
];

const ActivityCard = ({ card, index }: { card: typeof cards[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={cardRef}
      className="group relative rounded-lg overflow-hidden border border-border bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-secondary/40"
      style={{
        animationDelay: `${index * 150}ms`,
        boxShadow: isHovered
          ? `0 0 30px hsl(189 100% 50% / 0.12), 0 0 60px hsl(156 100% 50% / 0.06)`
          : "none",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Radial glow following mouse */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-60 transition-opacity duration-300"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}% ${mousePos.y}%, hsl(189 100% 50% / 0.08), transparent 60%)`,
          }}
        />
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        
        {/* Tag */}
        <span className="absolute top-3 left-3 text-[9px] tracking-[0.25em] uppercase font-mono px-2 py-1 rounded border border-secondary/30 text-secondary/80 bg-background/60 backdrop-blur-sm z-20">
          {card.tag}
        </span>
      </div>

      {/* Content */}
      <div className="relative p-5 z-20">
        <h3 className="text-xl font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
          {card.title}
        </h3>
        <p className="text-xs text-secondary/70 font-mono mb-3">{card.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent group-hover:via-secondary/60 transition-all duration-500" />
    </div>
  );
};

const ActivityCards = () => {
  return (
    <section id="activities" className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-20">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono block mb-4">
            {'>'} modules.list()
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            활동 영역
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <ActivityCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivityCards;
