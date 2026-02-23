import Scene3D from "../components/Scene3D";
import ScrambleText from "../components/ScrambleText";
import ReticleCursor from "../components/ReticleCursor";
import ActivityCards from "../components/ActivityCards";
import PhotoGallery from "../components/PhotoGallery";

const glass =
  "backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

const Index = () => {
  return (
    <div className="bg-background scan-line">
      <ReticleCursor />
      <Scene3D />
      <div id="scroll-container" className="relative z-10 pointer-events-auto">
        {/* HERO */}
        <section id="hero">
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 md:px-6">
            <div className={`${glass} px-6 py-10 md:px-12 md:py-14`}>
              <p className="text-xs tracking-[0.5em] uppercase text-secondary/70 mb-6 animate-fade-in font-mono">
                SUNY Korea // Security Research Club
              </p>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-bold text-foreground mb-4 leading-tight">
                <ScrambleText text="Decompiler" className="text-primary text-glow" />
              </h1>
              <p className="text-base md:text-2xl font-display font-light text-foreground/80 mb-2">
                <ScrambleText text="Break the Code," />
              </p>
              <p className="text-base md:text-2xl font-display font-light text-secondary text-glow-cyan">
                <ScrambleText text="Build the Future" />
              </p>
            </div>
            <div className="mt-10 flex items-center gap-3 text-muted-foreground text-[10px] tracking-[0.3em] uppercase animate-pulse-glow font-mono">
              <span className="w-8 h-px bg-secondary/30" />
              <span>Scroll to Explore</span>
              <span className="w-8 h-px bg-secondary/30" />
            </div>
          </div>
        </section>

        {/* GLITCH DIVIDER */}
        <div className="rgb-split h-px w-full my-4" />

        {/* ABOUT */}
        <section id="about">
          <div className="flex items-center justify-start min-h-screen px-4 md:px-20">
            <div className="max-w-2xl space-y-4">
              <div className={`${glass} px-5 py-3 inline-block`}>
                <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
                  {">"} about.init()
                </span>
              </div>
              <div className={`${glass} p-6 md:p-8`}>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                  우리는 <span className="text-primary text-glow">해체</span>하고
                  <br />
                  <span className="text-secondary text-glow-cyan">재구성</span>합니다
                </h2>
              </div>
              <div className={`${glass} p-5 md:p-6`}>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  Decompiler는 SUNY Korea 최대 규모의 정보보안/개발 동아리입니다. 웹개발, 보안, 네트워크뿐만 아니라
                  세부적인 코딩 문제들까지 함께 공부하며 전반적인 컴퓨팅 지식을 쌓습니다. 뿐만 아니라 관련 지식이 전무한
                  학생들도 다양하게 협력하고 활동하며 즐거움을 찾습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="rgb-split h-px w-full my-4" />

        {/* ACTIVITIES */}
        <section id="activities">
          <div className="flex flex-col items-center justify-center min-h-screen px-4 md:px-20 py-16">
            <div className={`${glass} px-5 py-3 mb-4`}>
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
                {">"} modules.list()
              </span>
            </div>
            <div className={`${glass} p-5 md:p-6 text-center mb-4`}>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">활동 영역</h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                보안에만 국한되지 않습니다. 개발, AI, 해커톤 주최, 자격증 스터디부터 MT, 회식까지 — 다양한 활동이
                여러분을 기다립니다.
              </p>
            </div>
            <div className={`${glass} px-4 py-2 rounded-full mb-8`}>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-primary text-xs font-mono">모든 활동은 자유 참여 : 원하는 것만, 몇 개든 OK</span>
              </div>
            </div>
            <ActivityCards />
          </div>
        </section>

        <div className="rgb-split h-px w-full my-4" />

        {/* GALLERY */}
        <section id="gallery">
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 md:px-20 py-16">
            <div className={`${glass} px-5 py-3 mb-4`}>
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
                {">"} gallery.render()
              </span>
            </div>
            <div className={`${glass} p-5 text-center mb-8`}>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                우리의 <span className="text-secondary text-glow-cyan">순간들</span>
              </h2>
            </div>
            <PhotoGallery />
          </div>
        </section>

        <div className="rgb-split h-px w-full my-4" />

        {/* JOIN / CTA */}
        <section id="join">
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
            <div className={`${glass} px-5 py-3 mb-4`}>
              <span className="text-[10px] tracking-[0.4em] uppercase text-secondary/60 font-mono">
                {">"} recruit.apply()
              </span>
            </div>
            <div className={`${glass} p-6 md:p-10 max-w-lg mb-6`}>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                함께 <span className="text-primary text-glow">활동</span>할
                <br />
                준비가 되셨나요?
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                코딩을 몰라도 괜찮습니다.
                <br />
                열정만 있다면 누구나 환영합니다.
              </p>
              <a
                href="https://forms.gle/ATrZoSs8qcBwoc4C6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-10 py-3.5 bg-primary/10 border border-primary text-primary font-display font-semibold tracking-wider uppercase text-sm rounded-lg neon-border hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Apply Now →
              </a>
            </div>
            <div className="mt-16 text-muted-foreground text-[10px] opacity-40 font-mono">
              © 2026 Decompiler — SUNY Korea
              <br />
              jiyul.ahn@stonybrook.edu
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
