import Scene3D from "../components/Scene3D";
import ScrambleText from "../components/ScrambleText";
import ReticleCursor from "../components/ReticleCursor";

const Index = () => {
  return (
    <div className="bg-background scan-line">
      <ReticleCursor />
      <Scene3D />
      <div id="scroll-container" className="relative z-10">
        {/* HERO */}
        <section id="hero">
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
            <p className="text-xs tracking-[0.5em] uppercase text-secondary/70 mb-6 animate-fade-in font-mono">
              SUNY Korea // Security Research Club
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground mb-4 leading-tight">
              <ScrambleText
                text="Decompiler"
                className="text-primary text-glow"
              />
            </h1>
            <p className="text-lg md:text-2xl font-display font-light text-foreground/80 mb-2">
              <ScrambleText text="Break the Code," />
            </p>
            <p className="text-lg md:text-2xl font-display font-light text-secondary text-glow-cyan">
              <ScrambleText text="Build the Future" />
            </p>
            <div className="mt-16 flex items-center gap-3 text-muted-foreground text-[10px] tracking-[0.3em] uppercase animate-pulse-glow font-mono">
              <span className="w-8 h-px bg-secondary/30" />
              <span>Scroll to Explore</span>
              <span className="w-8 h-px bg-secondary/30" />
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about">
          <div className="flex flex-col items-start justify-center min-h-screen px-6 md:px-20 max-w-2xl">
            <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 mb-4 font-mono">
              {'>'} about.init()
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
        </section>

        {/* ACTIVITIES */}
        <section id="activities">
          <div className="flex flex-col items-end justify-center min-h-screen px-6 md:px-20 max-w-2xl ml-auto">
            <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 mb-4 font-mono">
              {'>'} modules.list()
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground text-right mb-8">
              활동 영역
            </h2>
            <div className="space-y-3 text-right w-full">
              {[
                { label: "Reverse Engineering", desc: "바이너리 분석 & 리버싱" },
                { label: "Web Hacking", desc: "웹 취약점 분석 & 익스플로잇" },
                { label: "Cryptography", desc: "암호 알고리즘 분석 & 구현" },
                { label: "CTF Competition", desc: "국내외 CTF 대회 참가" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-border rounded p-4 neon-border-cyan bg-card/30 backdrop-blur-sm transition-all duration-300 hover:bg-card/60 hover:border-secondary/50"
                >
                  <h3 className="text-secondary font-display font-semibold text-lg">
                    {item.label}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* JOIN */}
        <section id="join">
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
            <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 mb-4 font-mono">
              {'>'} recruit.apply()
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
            <button className="group relative px-10 py-3 border border-secondary text-secondary font-display font-semibold tracking-wider uppercase text-sm rounded neon-border-cyan hover:bg-secondary hover:text-secondary-foreground transition-all duration-300">
              Apply Now
            </button>
            <div className="mt-24 text-muted-foreground text-[10px] opacity-40 font-mono">
              © 2026 Decompiler — SUNY Korea
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
