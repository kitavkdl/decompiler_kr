import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/smoothScroll";

interface CountUpProps {
  value: string; // e.g. "90+"
  duration?: number;
  className?: string;
}

const parse = (value: string) => {
  const match = value.match(/(\d+)(.*)/);
  if (!match) return { target: 0, suffix: value };
  return { target: parseInt(match[1], 10), suffix: match[2] };
};

const CountUp = ({ value, duration = 1.6, className = "" }: CountUpProps) => {
  const { target, suffix } = parse(value);
  const [n, setN] = useState(0);
  const [pulse, setPulse] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obj = { v: 0 };
    let tween: gsap.core.Tween | null = null;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        if (playedRef.current) return;
        playedRef.current = true;
        tween = gsap.to(obj, {
          v: target,
          duration,
          ease: "power2.out",
          onUpdate: () => setN(Math.round(obj.v)),
          onComplete: () => {
            setN(target);
            setPulse(true);
            window.setTimeout(() => setPulse(false), 900);
          },
        });
      },
    });
    return () => {
      tween?.kill();
      st.kill();
    };
  }, [target, duration]);

  return (
    <span
      ref={ref}
      className={`${className} inline-block transition-[text-shadow,filter] duration-700`}
      style={
        pulse
          ? { textShadow: "0 0 24px hsl(var(--primary) / 0.9), 0 0 48px hsl(var(--primary) / 0.6)" }
          : undefined
      }
    >
      {n}
      {suffix}
    </span>
  );
};

export default CountUp;
