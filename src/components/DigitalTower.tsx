import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TowerRing = ({ y, radius, color, speed }: { y: number; radius: number; color: string; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  return (
    <mesh ref={ref} position={[0, y, 0]}>
      <torusGeometry args={[radius, 0.03, 8, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

const TowerSegment = ({ y, height, radius }: { y: number; height: number; radius: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => new THREE.CylinderGeometry(radius, radius * 1.1, height, 8, 1), [radius, height]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + y) * 0.1;
    }
  });

  return (
    <group position={[0, y, 0]}>
      <mesh ref={ref} geometry={geometry}>
        <meshStandardMaterial
          color="#0a1a1a"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments ref={edgesRef} geometry={edges}>
        <lineBasicMaterial color="#00D4FF" transparent opacity={0.4} />
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

  useFrame((state) => {
    if (ref.current) {
      const posAttr = ref.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] += 0.02;
        if (arr[i * 3 + 1] > height / 2) {
          arr[i * 3 + 1] = -height / 2;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#00FF88" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const DigitalTower = () => {
  const groupRef = useRef<THREE.Group>(null);
  const segmentCount = 12;
  const segmentHeight = 1.2;
  const totalHeight = segmentCount * segmentHeight;

  const rings = useMemo(() => {
    const r = [];
    for (let i = 0; i < 20; i++) {
      r.push({
        y: -totalHeight / 2 + (i / 19) * totalHeight,
        radius: 0.6 + Math.sin(i * 0.5) * 0.2,
        color: i % 3 === 0 ? "#00FF88" : i % 3 === 1 ? "#00D4FF" : "#00FF88",
        speed: 0.2 + Math.random() * 0.5,
      });
    }
    return r;
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
      s.push({
        angle: (i / 8) * Math.PI * 2,
        height: totalHeight,
      });
    }
    return s;
  }, [totalHeight]);

  return (
    <group ref={groupRef}>
      {/* Core pillar glow */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, totalHeight, 16]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </mesh>

      {segments.map((seg, i) => (
        <TowerSegment key={`seg-${i}`} {...seg} />
      ))}

      {rings.map((ring, i) => (
        <TowerRing key={`ring-${i}`} {...ring} />
      ))}

      {streams.map((stream, i) => (
        <DataStream key={`stream-${i}`} {...stream} />
      ))}

      {/* Top beacon */}
      <pointLight position={[0, totalHeight / 2 + 0.5, 0]} color="#00FF88" intensity={3} distance={5} />
      <pointLight position={[0, -totalHeight / 2, 0]} color="#00D4FF" intensity={2} distance={4} />
    </group>
  );
};

export default DigitalTower;
