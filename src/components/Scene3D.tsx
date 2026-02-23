import { Canvas } from "@react-three/fiber";
import { useIsMobile } from "@/hooks/use-mobile";
import DigitalTower from "./DigitalTower";
import ParticleField from "./ParticleField";
import ScrollCamera from "./ScrollCamera";

const Scene3D = () => {
  const isMobile = useIsMobile();

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [6, 8, 0], fov: isMobile ? 60 : 50 }}
        gl={{ antialias: !isMobile, alpha: true }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#050510", 8, 25]} />
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 10, 5]} intensity={0.3} color="#8A2BE2" />
        <ScrollCamera />
        <group scale={isMobile ? 0.65 : 1}>
          <DigitalTower />
        </group>
        <ParticleField count={isMobile ? 800 : 2000} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
