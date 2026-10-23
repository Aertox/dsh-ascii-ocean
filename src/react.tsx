"use client";

import { useEffect, useRef } from "react";
import { OceanEngine } from "./engine";
import type { SharkSpec } from "./world";
import type { WhaleSpec } from "./whale";

/** Glyphs come from the canvas's font-family, so give it (or a parent) a monospace font. */
export function AsciiOcean({
  className,
  sharks,
  whales,
}: {
  className?: string;
  sharks?: SharkSpec[];
  whales?: WhaleSpec[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new OceanEngine(canvas, sharks, whales);
    return () => engine.destroy();
    // The roster is fixed for the life of the canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`ascii-ocean ${className ?? ""}`} />;
}
