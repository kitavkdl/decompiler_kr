import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  /** Enable mouse-repel + return-to-origin. Disable on mobile. */
  interactive?: boolean;
}

const ParticleField = ({ count = 2000, interactive = false }: ParticleFieldProps) => {
  const ref = useRef<THREE.Points>(null);
  const { camera, size } = useThree();
  const mouseNDC = useRef(new THREE.Vector2(-10, -10));
  const mouseWorld = useRef(new THREE.Vector3(0, 0, 0));
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const hit = useRef(new THREE.Vector3());

  const { positions, origins } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return { positions: pos, origins: new Float32Array(pos) };
  }, [count]);

  useEffect(() => {
    if (!interactive) return;
    const handler = (e: MouseEvent) => {
      mouseNDC.current.x = (e.clientX / size.width) * 2 - 1;
      mouseNDC.current.y = -(e.clientY / size.height) * 2 + 1;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [interactive, size.width, size.height]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    const time = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    // Project mouse to a world-space point at z=0 once per frame.
    let mx = 0,
      my = 0,
      mActive = false;
    if (interactive) {
      raycaster.current.setFromCamera(mouseNDC.current, camera);
      if (raycaster.current.ray.intersectPlane(plane.current, hit.current)) {
        mx = hit.current.x;
        my = hit.current.y;
        mActive = true;
      }
    }

    const REPEL_R = 1.4;
    const REPEL_R2 = REPEL_R * REPEL_R;
    const REPEL_STRENGTH = 18 * dt;
    const RETURN = Math.min(1, 1.6 * dt);

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      // Ambient drift (existing behavior)
      arr[ix + 1] -= 0.005;
      arr[ix] += Math.sin(time + i * 0.01) * 0.002;
      if (arr[ix + 1] < -15) arr[ix + 1] = 15;

      if (mActive) {
        const dx = arr[ix] - mx;
        const dy = arr[ix + 1] - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL_R2 && d2 > 0.0001) {
          const inv = 1 / Math.sqrt(d2);
          const falloff = 1 - d2 / REPEL_R2;
          arr[ix] += dx * inv * falloff * REPEL_STRENGTH;
          arr[ix + 1] += dy * inv * falloff * REPEL_STRENGTH;
        } else {
          // Slow return toward origin
          arr[ix] += (origins[ix] - arr[ix]) * RETURN;
          arr[ix + 1] += (origins[ix + 1] - arr[ix + 1]) * RETURN;
        }
      }
    }
    posAttr.needsUpdate = true;
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
      <pointsMaterial
        color="#8A2BE2"
        size={0.03}
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleField;
