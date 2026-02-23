import Scene3D from "../components/Scene3D";
import ScrambleText from "../components/ScrambleText";
import ReticleCursor from "../components/ReticleCursor";
import ActivityCards from "../components/ActivityCards";
import PhotoGallery from "../components/PhotoGallery";

const glassPanel = "backdrop-blur-xl bg-background/30 border border-foreground/[0.06] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

const Index = () => {
  return (
    <div className="bg-background scan-line">
      <ReticleCursor />
      <Scene3D />
      <div id="scroll-container" className="relative z-10 pointer-events-auto">
        {/* HERO */}
        <section id="hero">
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
            <div className={`${glassPanel} px-10 py-14 md:px-16 md:py-20`}>
              <p className="text-xs tracking-[0.5em] uppercase text-secondary/70 mb-6 animate-fade-in font-mono">
                SUNY Korea // Security Research Club
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground mb-4 leading-tight">
                <ScrambleText text="Decompiler" className="text-primary text-glow" />
              </h1>
              <p className="text-lg md:text-2xl font-display font-light text-foreground/80 mb-2">
                <ScrambleText text="Break the Code," />
              </p>
              <p className="text-lg md:text-2xl font-display font-light text-secondary text-glow-cyan">
                <ScrambleText text="Build the Future" />
              </p>
              <div className="mt-12 flex items-center justify-center gap-3 text-muted-foreground text-[10px] tracking-[0.3em] uppercase animate-pulse-glow font-mono">
                <span className="w-8 h-px bg-secondary/30" />
                <span>Scroll to Explore</span>
                <span className="w-8 h-px bg-secondary/30" />
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about">
          <div className="flex items-center justify-start min-h-screen px-6 md:px-20">
            <div className={`${glassPanel} p-8 md:p-12 max-w-2xl`}>
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 mb-4 block font-mono">
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
          </div>
        </section>

        {/* ACTIVITIES */}
        <section id="activities">
          <div className="flex flex-col items-center justify-center min-h-screen px-6 md:px-20 py-20">
            <div className={`${glassPanel} p-8 md:p-12 w-full max-w-5xl`}>
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 mb-4 block font-mono">
                {'>'} modules.list()
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground text-center mb-4">
                활동 영역
              </h2>
              <p className="text-muted-foreground text-sm text-center max-w-lg mx-auto mb-3">
                보안에만 국한되지 않습니다. 개발, AI, 해커톤, 자격증 스터디부터
                MT, 회식까지 — 다양한 활동이 여러분을 기다립니다.
              </p>
              <div className="flex justify-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary text-xs font-mono">
                    모든 활동은 자유 참여 — 원하는 것만, 몇 개든 OK
                  </span>
                </div>
              </div>
              <ActivityCards />
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section id="gallery">
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 md:px-20 py-20">
            <div className={`${glassPanel} p-8 md:p-12 w-full max-w-5xl`}>
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 mb-4 block font-mono">
                {'>'} gallery.render()
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-10">
                우리의 <span className="text-secondary text-glow-cyan">순간들</span>
              </h2>
              <PhotoGallery />
            </div>
          </div>
        </section>


        {/* JOIN */}
        <section id="join">
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
            <div className={`${glassPanel} px-10 py-14 md:px-16 md:py-20 max-w-xl`}>
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 mb-4 block font-mono">
                {'>'} recruit.apply()
              </span>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
                함께 <span className="text-primary text-glow">활동</span>할
                <br />
                준비가 되셨나요?
              </h2>
              <p className="text-muted-foreground mb-10 max-w-md mx-auto text-sm">
                코딩을 몰라도 괜찮습니다.
                열정만 있다면 누구나 환영합니다.
              </p>
              <a
                href="https://forms.gle/ATrZoSs8qcBwoc4C6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-10 py-3 border border-secondary text-secondary font-display font-semibold tracking-wider uppercase text-sm rounded neon-border-cyan hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                Apply Now
              </a>
            </div>
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
