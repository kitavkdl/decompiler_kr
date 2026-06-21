import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="hover"], [onclick]';

const ReticleCursor = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Disable on touch / coarse-pointer devices.
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let lastCoordTick = 0;
    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      const now = performance.now();
      if (now - lastCoordTick > 33) {
        // ~30fps state updates for readout — pure rAF transform stays smooth.
        setCoords({ x: e.clientX, y: e.clientY });
        lastCoordTick = now;
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      setHovering(!!target?.closest?.(INTERACTIVE_SELECTOR));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });

    let raf = 0;
    const animate = () => {
      const lerp = 0.18;
      current.current.x += (pos.current.x - current.current.x) * lerp;
      current.current.y += (pos.current.y - current.current.y) * lerp;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${current.current.x - 20}px, ${current.current.y - 20}px, 0)`;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${pos.current.x - 3}px, ${pos.current.y - 3}px, 0)`;
      }
      if (coordRef.current) {
        coordRef.current.style.transform = `translate3d(${pos.current.x + 24}px, ${pos.current.y + 24}px, 0)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringColor = hovering ? "hsl(300 100% 60%)" : "hsl(189 100% 50%)";
  const cornerColor = hovering ? "hsl(300 100% 65%)" : "hsl(156 100% 50%)";

  return (
    <>
      {/* Outer reticle ring */}
      <div
        ref={outerRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none transition-[transform,opacity] will-change-transform"
        style={{
          width: 40,
          height: 40,
          transform: "translate3d(-100px,-100px,0)",
        }}
      >
        <div
          className="w-full h-full transition-transform duration-200 ease-out"
          style={{ transform: hovering ? "scale(1.45)" : "scale(1)" }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="16" stroke={ringColor} strokeWidth="1" opacity={hovering ? 0.9 : 0.6} />
            <line x1="20" y1="0" x2="20" y2="8" stroke={ringColor} strokeWidth="1" opacity="0.4" />
            <line x1="20" y1="32" x2="20" y2="40" stroke={ringColor} strokeWidth="1" opacity="0.4" />
            <line x1="0" y1="20" x2="8" y2="20" stroke={ringColor} strokeWidth="1" opacity="0.4" />
            <line x1="32" y1="20" x2="40" y2="20" stroke={ringColor} strokeWidth="1" opacity="0.4" />
            <line x1="7" y1="7" x2="11" y2="11" stroke={cornerColor} strokeWidth="1" opacity="0.4" />
            <line x1="33" y1="7" x2="29" y2="11" stroke={cornerColor} strokeWidth="1" opacity="0.4" />
            <line x1="7" y1="33" x2="11" y2="29" stroke={cornerColor} strokeWidth="1" opacity="0.4" />
            <line x1="33" y1="33" x2="29" y2="29" stroke={cornerColor} strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Center dot */}
      <div
        ref={innerRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full will-change-transform transition-[width,height,background-color,box-shadow] duration-200"
        style={{
          width: hovering ? 10 : 6,
          height: hovering ? 10 : 6,
          marginLeft: hovering ? -2 : 0,
          marginTop: hovering ? -2 : 0,
          backgroundColor: hovering ? "hsl(300 100% 60%)" : "hsl(189 100% 50%)",
          boxShadow: hovering
            ? "0 0 12px hsl(300 100% 60% / 0.9)"
            : "0 0 6px hsl(189 100% 50% / 0.8)",
        }}
      />

      {/* Coordinate readout */}
      <div
        ref={coordRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none font-mono text-[10px] text-secondary/60 whitespace-nowrap tabular-nums will-change-transform"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <span className="text-primary/40">X:</span>
        {String(coords.x).padStart(4, "0")}{" "}
        <span className="text-primary/40">Y:</span>
        {String(coords.y).padStart(4, "0")}
      </div>
    </>
  );
};

export default ReticleCursor;
