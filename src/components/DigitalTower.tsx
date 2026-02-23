import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TowerRing = ({ y, radius, color, speed, thickness }: { y: number; radius: number; color: string; speed: number; thickness: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * speed;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + y) * 0.15;
    }
  });

  // Create a double-ring with gap for a more techy look
  return (
    <group ref={groupRef} position={[0, y, 0]}>
      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[radius, thickness, 3, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
          wireframe
        />
      </mesh>
      {/* Inner accent ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[radius * 0.7, thickness * 0.5, 3, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>
    </group>
  );
};

const HexPlate = ({ y, radius, color, speed }: { y: number; radius: number; color: string; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + y) * 0.05);
    }
  });

  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.85, radius, 6]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
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
        <meshStandardMaterial
          color="#0a1a1a"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments ref={edgesRef} geometry={edges}>
        <lineBasicMaterial color="#0AF0E0" transparent opacity={0.35} />
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
      <pointsMaterial color="#3DF5C8" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const DigitalTower = () => {
  const groupRef = useRef<THREE.Group>(null);
  const segmentCount = 12;
  const segmentHeight = 1.2;
  const totalHeight = segmentCount * segmentHeight;

  // Analogous palette: teals, aquamarines, mints
  const palette = ["#0AF0E0", "#3DF5C8", "#08C8D4", "#5BFFD0", "#06B6C4"];

  const rings = useMemo(() => {
    const r = [];
    for (let i = 0; i < 14; i++) {
      r.push({
        y: -totalHeight / 2 + (i / 13) * totalHeight,
        radius: 0.55 + Math.sin(i * 0.7) * 0.25,
        color: palette[i % palette.length],
        speed: 0.3 + (i % 3) * 0.25,
        thickness: 0.015 + (i % 2) * 0.01,
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
      s.push({
        angle: (i / 8) * Math.PI * 2,
        height: totalHeight,
      });
    }
    return s;
  }, [totalHeight]);

  return (
    <group ref={groupRef}>
      {/* Core pillar */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, totalHeight, 16]} />
        <meshStandardMaterial
          color="#0AF0E0"
          emissive="#0AF0E0"
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

      {hexPlates.map((plate, i) => (
        <HexPlate key={`hex-${i}`} {...plate} />
      ))}

      {streams.map((stream, i) => (
        <DataStream key={`stream-${i}`} {...stream} />
      ))}

      {/* Top & bottom beacons */}
      <pointLight position={[0, totalHeight / 2 + 0.5, 0]} color="#3DF5C8" intensity={3} distance={5} />
      <pointLight position={[0, -totalHeight / 2, 0]} color="#0AF0E0" intensity={2} distance={4} />
    </group>
  );
};

export default DigitalTower;
