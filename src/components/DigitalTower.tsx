import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let globalScrollProgress = 0;

export const useScrollProgress = () => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          globalScrollProgress = self.progress;
        },
      });
    });
    return () => ctx.revert();
  }, []);
};

const TowerRing = ({ y, radius, color, speed, thickness, index, total }: { y: number; radius: number; color: string; speed: number; thickness: number; index: number; total: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const baseRadius = radius;
  const normalizedIndex = index / total;

  useFrame((state) => {
    if (groupRef.current) {
      const spread = 1 + globalScrollProgress * 0.6 * Math.sin(normalizedIndex * Math.PI);
      const scaleOscillation = 1 + Math.sin(state.clock.elapsedTime * 1.5 + index * 0.8) * 0.08;
      const currentScale = spread * scaleOscillation;

      groupRef.current.scale.set(currentScale, 1, currentScale);
      groupRef.current.rotation.y = state.clock.elapsedTime * speed + globalScrollProgress * Math.PI * 0.5;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + y) * 0.15;

      const yOffset = (normalizedIndex - 0.5) * globalScrollProgress * 2;
      groupRef.current.position.y = y + yOffset;
    }
  });

  return (
    <group ref={groupRef} position={[0, y, 0]}>
      <mesh>
        <torusGeometry args={[baseRadius, thickness, 3, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.85} wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[baseRadius * 0.7, thickness * 0.5, 3, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.4} wireframe />
      </mesh>
    </group>
  );
};

const HexPlate = ({ y, radius, color, speed }: { y: number; radius: number; color: string; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 2 + y) * 0.05;
      const scrollScale = 1 + globalScrollProgress * 0.3;
      ref.current.scale.setScalar(breathe * scrollScale);
    }
  });

  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.85, radius, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.35} side={THREE.DoubleSide} />
    </mesh>
  );
};

const TowerSegment = ({ y, height, radius }: { y: number; height: number; radius: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => new THREE.CylinderGeometry(radius, radius * 1.1, height, 6, 1), [radius, height]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + y) * 0.1;
    }
  });

  return (
    <group position={[0, y, 0]}>
      <mesh ref={ref} geometry={geometry}>
        <meshStandardMaterial color="#0a0a12" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments ref={edgesRef} geometry={edges}>
        <lineBasicMaterial color="#FF00FF" transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
};

const DataStream = ({ angle, height }: { angle: number; height: number }) => {
  const ref = useRef<THREE.Points>(null);
  const count = 30;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 0.8 + Math.random() * 0.3;
      const a = angle + (Math.random() - 0.5) * 0.2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (i / count) * height - height / 2;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    return pos;
  }, [angle, height, count]);

  useFrame(() => {
    if (ref.current) {
      const posAttr = ref.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] += 0.02;
        if (arr[i * 3 + 1] > height / 2) arr[i * 3 + 1] = -height / 2;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#BB66FF" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const DigitalTower = () => {
  const groupRef = useRef<THREE.Group>(null);
  const segmentCount = 12;
  const segmentHeight = 1.2;
  const totalHeight = segmentCount * segmentHeight;

  useScrollProgress();

  const palette = ["#FF00FF", "#8A2BE2", "#CC44FF", "#AA33DD", "#FF44CC"];

  const rings = useMemo(() => {
    const r = [];
    for (let i = 0; i < 14; i++) {
      r.push({
        y: -totalHeight / 2 + (i / 13) * totalHeight,
        radius: 0.55 + Math.sin(i * 0.7) * 0.25,
        color: palette[i % palette.length],
        speed: 0.3 + (i % 3) * 0.25,
        thickness: 0.015 + (i % 2) * 0.01,
        index: i,
        total: 14,
      });
    }
    return r;
  }, [totalHeight]);

  const hexPlates = useMemo(() => {
    const h = [];
    for (let i = 0; i < 6; i++) {
      h.push({
        y: -totalHeight / 2 + (i / 5) * totalHeight,
        radius: 0.9 + Math.sin(i) * 0.2,
        color: palette[(i + 2) % palette.length],
        speed: 0.15 + i * 0.08,
      });
    }
    return h;
  }, [totalHeight]);

  const segments = useMemo(() => {
    const s = [];
    for (let i = 0; i < segmentCount; i++) {
      s.push({
        y: -totalHeight / 2 + i * segmentHeight + segmentHeight / 2,
        height: segmentHeight * 0.9,
        radius: 0.5 + Math.sin(i * 0.4) * 0.15,
      });
    }
    return s;
  }, [totalHeight]);

  const streams = useMemo(() => {
    const s = [];
    for (let i = 0; i < 8; i++) {
      s.push({ angle: (i / 8) * Math.PI * 2, height: totalHeight });
    }
    return s;
  }, [totalHeight]);

  return (
    <group ref={groupRef}>
      {/* Core pillar removed */}

      {segments.map((seg, i) => (
        <TowerSegment key={`seg-${i}`} {...seg} />
      ))}
      {rings.map((ring, i) => (
        <TowerRing key={`ring-${i}`} {...ring} />
      ))}
      {hexPlates.map((plate, i) => (
        <HexPlate key={`hex-${i}`} {...plate} />
      ))}
      {streams.map((stream, i) => (
        <DataStream key={`stream-${i}`} {...stream} />
      ))}

      <pointLight position={[0, totalHeight / 2 + 0.5, 0]} color="#FF00FF" intensity={3} distance={5} />
      <pointLight position={[0, -totalHeight / 2, 0]} color="#8A2BE2" intensity={2} distance={4} />
    </group>
  );
};

export default DigitalTower;
