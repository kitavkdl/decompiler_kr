import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/smoothScroll";

interface BrandHeadlineProps {
  prefix: string;
  shatter: string;
  mid: string;
  assemble: string;
  suffix: string;
}

const splitChars = (s: string) => Array.from(s);

const BrandHeadline = ({ prefix, shatter, mid, assemble, suffix }: BrandHeadlineProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const shatterEls = root.querySelectorAll<HTMLElement>("[data-shatter] > span");
    const assembleEls = root.querySelectorAll<HTMLElement>("[data-assemble] > span");

    // Initial: shatter in place visible, assemble hidden in place.
    gsap.set(shatterEls, { x: 0, y: 0, rotation: 0, opacity: 1 });
    gsap.set(assembleEls, { opacity: 0 });

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 80%",
      once: true,
      onEnter: () => {
        if (playedRef.current) return;
        playedRef.current = true;

        const tl = gsap.timeline();

        // Phase 1: scatter "shatter" letters
        tl.to(shatterEls, {
          x: () => gsap.utils.random(-90, 90),
          y: () => gsap.utils.random(-50, 50),
          rotation: () => gsap.utils.random(-90, 90),
          opacity: 0.25,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.04,
        });

        // Fade shatter out as assemble takes over
        tl.to(
          shatterEls,
          { opacity: 0, duration: 0.4, ease: "power1.in" },
          ">-0.1"
        );

        // Phase 2: assemble letters fly in from scattered positions to place
        tl.fromTo(
          assembleEls,
          {
            x: () => gsap.utils.random(-100, 100),
            y: () => gsap.utils.random(-60, 60),
            rotation: () => gsap.utils.random(-80, 80),
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power4.out",
            stagger: 0.05,
          },
          "<-0.1"
        );
      },
    });

    return () => st.kill();
  }, [shatter, assemble]);

  return (
    <div ref={rootRef}>
      {prefix}
      <span
        data-shatter
        className="text-primary text-glow inline-block"
        style={{ whiteSpace: "pre" }}
      >
        {splitChars(shatter).map((c, i) => (
          <span key={i} className="inline-block will-change-transform">
            {c}
          </span>
        ))}
      </span>
      {mid}
      <br />
      <span
        data-assemble
        className="text-secondary text-glow-cyan inline-block"
        style={{ whiteSpace: "pre" }}
      >
        {splitChars(assemble).map((c, i) => (
          <span key={i} className="inline-block will-change-transform">
            {c}
          </span>
        ))}
      </span>
      {suffix}
    </div>
  );
};

export default BrandHeadline;
