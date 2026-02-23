import { useEffect, useRef, useState } from "react";

const ReticleCursor = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setCoords({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", onMove);

    let raf: number;
    const animate = () => {
      const lerp = 0.35;
      current.current.x += (pos.current.x - current.current.x) * lerp;
      current.current.y += (pos.current.y - current.current.y) * lerp;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${current.current.x - 20}px, ${current.current.y - 20}px)`;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`;
      }
      if (coordRef.current) {
        coordRef.current.style.transform = `translate(${pos.current.x + 24}px, ${pos.current.y + 24}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Outer reticle ring */}
      <div
        ref={outerRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ width: 40, height: 40 }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {/* Main circle */}
          <circle cx="20" cy="20" r="16" stroke="hsl(189 100% 50%)" strokeWidth="1" opacity="0.6" />
          {/* Crosshair lines */}
          <line x1="20" y1="0" x2="20" y2="8" stroke="hsl(189 100% 50%)" strokeWidth="1" opacity="0.4" />
          <line x1="20" y1="32" x2="20" y2="40" stroke="hsl(189 100% 50%)" strokeWidth="1" opacity="0.4" />
          <line x1="0" y1="20" x2="8" y2="20" stroke="hsl(189 100% 50%)" strokeWidth="1" opacity="0.4" />
          <line x1="32" y1="20" x2="40" y2="20" stroke="hsl(189 100% 50%)" strokeWidth="1" opacity="0.4" />
          {/* Corner ticks */}
          <line x1="7" y1="7" x2="11" y2="11" stroke="hsl(156 100% 50%)" strokeWidth="1" opacity="0.3" />
          <line x1="33" y1="7" x2="29" y2="11" stroke="hsl(156 100% 50%)" strokeWidth="1" opacity="0.3" />
          <line x1="7" y1="33" x2="11" y2="29" stroke="hsl(156 100% 50%)" strokeWidth="1" opacity="0.3" />
          <line x1="33" y1="33" x2="29" y2="29" stroke="hsl(156 100% 50%)" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      {/* Center dot */}
      <div
        ref={innerRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none w-[6px] h-[6px] rounded-full bg-secondary"
        style={{ boxShadow: "0 0 6px hsl(189 100% 50% / 0.8)" }}
      />

      {/* Coordinate readout */}
      <div
        ref={coordRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none font-mono text-[10px] text-secondary/60 whitespace-nowrap"
      >
        <span className="text-primary/40">X:</span>{String(coords.x).padStart(4, "0")}{" "}
        <span className="text-primary/40">Y:</span>{String(coords.y).padStart(4, "0")}
      </div>
    </>
  );
};

export default ReticleCursor;
