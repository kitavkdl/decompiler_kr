import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "./scrollState";

gsap.registerPlugin(ScrollTrigger);

const ScrollCamera = () => {
  const { camera } = useThree();
  const target = useRef({ angle: 0, y: 8, radius: 6 });
  const current = useRef({ angle: 0, y: 8, radius: 6 });
  const lookAtY = useRef({ target: 0, current: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          scrollState.progress = progress;
          target.current.angle = progress * Math.PI * 2;
          target.current.y = 8 - progress * 16;
          target.current.radius = 6 - Math.sin(progress * Math.PI) * 1.5;
          lookAtY.current.target = -progress * 4;
        },
      });
    });

    return () => ctx.revert();
  }, []);

  useFrame(() => {
    const lerp = 0.08;
    current.current.angle += (target.current.angle - current.current.angle) * lerp;
    current.current.y += (target.current.y - current.current.y) * lerp;
    current.current.radius += (target.current.radius - current.current.radius) * lerp;
    lookAtY.current.current += (lookAtY.current.target - lookAtY.current.current) * lerp;

    const { angle, y, radius } = current.current;
    camera.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
    camera.lookAt(new THREE.Vector3(0, lookAtY.current.current, 0));
  });

  return null;
};

export default ScrollCamera;
