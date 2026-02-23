import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "./scrollState";

// Warm/amber/magenta palette for rings (no neon blue or cyber green)
const RING_COLORS = ["#FF6B35", "#E84393", "#FDCB6E", "#D63031", "#E17055", "#A29BFE"];

const TowerRing = ({ y, radius, color, speed, index }: { y: number; radius: number; color: string; speed: number; index: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const baseY = y;

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed;

    // Decomposition: rings fly outward when progress is in activities zone (0.4-0.6)
    const decompose = Math.max(0, Math.min(1, (scrollState.progress - 0.35) * 4));
    const angle = (index / 20) * Math.PI * 2 + state.clock.elapsedTime * 0.2;
    const flyOut = decompose * 2.5;
    
    ref.current.position.x = Math.cos(angle) * flyOut;
    ref.current.position.y = baseY + Math.sin(index * 1.3) * decompose * 1.5;
    ref.current.position.z = Math.sin(angle) * flyOut;

    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.7 - decompose * 0.3;
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

const TowerSegment = ({ y, height, radius, index }: { y: number; height: number; radius: number; index: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => new THREE.CylinderGeometry(radius, radius * 1.1, height, 8, 1), [radius, height]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const decompose = Math.max(0, Math.min(1, (scrollState.progress - 0.35) * 4));
    const angle = (index / 12) * Math.PI * 2 + state.clock.elapsedTime * 0.15;
    const flyOut = decompose * 1.8;
    
    groupRef.current.position.x = Math.cos(angle) * flyOut;
    groupRef.current.position.y = y + Math.sin(index * 0.7) * decompose * 2;
    groupRef.current.position.z = Math.sin(angle) * flyOut;
    groupRef.current.rotation.x = decompose * Math.sin(index) * 0.5;
    groupRef.current.rotation.z = decompose * Math.cos(index) * 0.5;
  });

  return (
    <group ref={groupRef} position={[0, y, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#0a1a1a"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#00D4FF" transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
};

// Code lines that appear inside the tower during decomposition
const CodeLines = () => {
  const groupRef = useRef<THREE.Group>(null);
  const lineCount = 24;

  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < lineCount; i++) {
      const width = 0.3 + Math.random() * 0.8;
      result.push({
        y: -7 + (i / lineCount) * 14,
        x: (Math.random() - 0.5) * 0.6,
        width,
        color: i % 4 === 0 ? "#FF6B35" : i % 4 === 1 ? "#E84393" : i % 4 === 2 ? "#FDCB6E" : "#A29BFE",
      });
    }
    return result;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const decompose = Math.max(0, Math.min(1, (scrollState.progress - 0.35) * 4));
    groupRef.current.visible = decompose > 0.05;
    
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = decompose * 0.8;
      mesh.scale.x = decompose;
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, 0]}>
          <boxGeometry args={[line.width, 0.04, 0.01]} />
          <meshStandardMaterial
            color={line.color}
            emissive={line.color}
            emissiveIntensity={1.5}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
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
  const coreRef = useRef<THREE.Mesh>(null);
  const segmentCount = 12;
  const segmentHeight = 1.2;
  const totalHeight = segmentCount * segmentHeight;

  const rings = useMemo(() => {
    const r = [];
    for (let i = 0; i < 20; i++) {
      r.push({
        y: -totalHeight / 2 + (i / 19) * totalHeight,
        radius: 0.6 + Math.sin(i * 0.5) * 0.2,
        color: RING_COLORS[i % RING_COLORS.length],
        speed: 0.2 + Math.random() * 0.5,
        index: i,
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
        index: i,
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

  // Core pillar fades during decomposition
  useFrame(() => {
    if (coreRef.current) {
      const decompose = Math.max(0, Math.min(1, (scrollState.progress - 0.35) * 4));
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.6 - decompose * 0.4;
    }
  });

  return (
    <group>
      {/* Core pillar glow */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
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

      {/* Code lines revealed during decomposition */}
      <CodeLines />

      {/* Lights */}
      <pointLight position={[0, totalHeight / 2 + 0.5, 0]} color="#FF6B35" intensity={3} distance={5} />
      <pointLight position={[0, -totalHeight / 2, 0]} color="#E84393" intensity={2} distance={4} />
    </group>
  );
};

export default DigitalTower;
