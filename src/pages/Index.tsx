import Scene3D from "../components/Scene3D";

const sections = [
  {
    id: "hero",
    content: (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <p className="text-sm tracking-[0.4em] uppercase text-secondary mb-4 animate-fade-in">
          SUNY Korea Security Club
        </p>
        <h1 className="text-6xl md:text-8xl font-display font-bold text-primary text-glow glitch-text mb-6">
          Decompiler
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
          코드 속 진실을 해독하다
        </p>
        <div className="mt-12 flex items-center gap-2 text-muted-foreground text-xs animate-pulse-glow">
          <span>↓</span>
          <span className="tracking-widest uppercase">Scroll to Explore</span>
          <span>↓</span>
        </div>
      </div>
    ),
  },
  {
    id: "about",
    content: (
      <div className="flex flex-col items-start justify-center min-h-screen px-6 md:px-20 max-w-2xl">
        <span className="text-xs tracking-[0.3em] uppercase text-secondary mb-3">
          // ABOUT
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
          우리는 <span className="text-primary text-glow">해체</span>하고
          <br />
          <span className="text-secondary text-glow-cyan">재구성</span>합니다
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
          Decompiler는 SUNY Korea 최대 규모의 정보보안 동아리입니다.
          리버스 엔지니어링, 웹 보안, 시스템 해킹, 암호학 등
          다양한 보안 분야를 연구하며, CTF 대회 참가와
          보안 프로젝트를 통해 실력을 키워나갑니다.
        </p>
      </div>
    ),
  },
  {
    id: "activities",
    content: (
      <div className="flex flex-col items-end justify-center min-h-screen px-6 md:px-20 max-w-2xl ml-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-secondary mb-3">
          // ACTIVITIES
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground text-right mb-8">
          활동 영역
        </h2>
        <div className="space-y-4 text-right">
          {[
            { label: "Reverse Engineering", desc: "바이너리 분석 & 리버싱" },
            { label: "Web Hacking", desc: "웹 취약점 분석 & 익스플로잇" },
            { label: "Cryptography", desc: "암호 알고리즘 분석 & 구현" },
            { label: "CTF Competition", desc: "국내외 CTF 대회 참가" },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-border rounded-lg p-4 neon-border bg-card/50 backdrop-blur-sm"
            >
              <h3 className="text-primary font-display font-semibold text-lg">
                {item.label}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "join",
    content: (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <span className="text-xs tracking-[0.3em] uppercase text-secondary mb-3">
          // JOIN US
        </span>
        <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
          함께 <span className="text-primary text-glow">해킹</span>할
          <br />
          준비가 되셨나요?
        </h2>
        <p className="text-muted-foreground mb-10 max-w-md text-sm">
          보안에 대한 열정만 있다면 누구든 환영합니다.
          초보자도 걱정하지 마세요.
        </p>
        <button className="px-8 py-3 border border-primary text-primary font-display font-semibold tracking-wider uppercase text-sm rounded neon-border hover:bg-primary hover:text-primary-foreground transition-all duration-300">
          Apply Now
        </button>
        <div className="mt-20 text-muted-foreground text-xs opacity-50">
          © 2026 Decompiler — SUNY Korea
        </div>
      </div>
    ),
  },
];

const Index = () => {
  return (
    <div className="bg-background scan-line">
      <Scene3D />
      <div id="scroll-container" className="relative z-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            {section.content}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Index;
