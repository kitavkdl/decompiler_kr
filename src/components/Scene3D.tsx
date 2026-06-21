import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DigitalTower from "./DigitalTower";
import ParticleField from "./ParticleField";
import ScrollCamera from "./ScrollCamera";

const Scene3D = () => {
  const isMobile = useIsMobile();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Subtle scroll parallax on the whole 3D layer (cheap CSS transform).
  useEffect(() => {
    if (!wrapRef.current) return;
    const factor = isMobile ? 0.02 : 0.06;
    let raf = 0;
    let target = 0;
    let current = 0;
    const onScroll = () => {
      target = window.scrollY * factor;
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };
    const tick = () => {
      current += (target - current) * 0.18;
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(0, ${-current}px, 0)`;
      }
      if (Math.abs(target - current) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-0 will-change-transform"
      style={{ transform: "translate3d(0,0,0)" }}
    >
      <Canvas
        camera={{ position: [6, 8, 0], fov: isMobile ? 60 : 50 }}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        dpr={isMobile ? [1, 1.25] : [1, 2]}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#050510", 8, 25]} />
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 10, 5]} intensity={0.3} color="#8A2BE2" />
        <ScrollCamera />
        <group scale={isMobile ? 0.65 : 1}>
          <DigitalTower />
        </group>
        <ParticleField count={isMobile ? 500 : 2000} interactive={!isMobile} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
