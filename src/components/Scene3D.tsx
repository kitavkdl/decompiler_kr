import { Canvas } from "@react-three/fiber";
import DigitalTower from "./DigitalTower";
import ParticleField from "./ParticleField";
import ScrollCamera from "./ScrollCamera";

const Scene3D = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [6, 8, 0], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#060d12", 8, 25]} />
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 10, 5]} intensity={0.3} color="#00ccff" />
        <ScrollCamera />
        <DigitalTower />
        <ParticleField />
      </Canvas>
    </div>
  );
};

export default Scene3D;
