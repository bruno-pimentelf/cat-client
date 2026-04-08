"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

function prob3pl(theta: number, a: number, b: number, c: number): number {
  const D = 1.7;
  return c + (1 - c) / (1 + Math.exp(-D * a * (theta - b)));
}

export function ItemCurveHero() {
  const [a, setA] = useState(1.5);
  const [b, setB] = useState(0.0);
  const [c, setC] = useState(0.2);

  const width = 380;
  const height = 260;
  const pad = { top: 20, right: 20, bottom: 36, left: 40 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;

  const curve = useMemo(() => {
    const points: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const theta = -4 + (8 * i) / 100;
      const p = prob3pl(theta, a, b, c);
      const x = pad.left + (i / 100) * cw;
      const y = pad.top + (1 - p) * ch;
      points.push(`${i === 0 ? "M" : "L"}${x},${y}`);
    }
    return points.join(" ");
  }, [a, b, c, cw, ch]);

  const bX = pad.left + ((b + 4) / 8) * cw;
  const bP = prob3pl(b, a, b, c);
  const bY = pad.top + (1 - bP) * ch;

  return (
    <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
        Curva Característica do Item (CCI)
      </p>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line key={v} x1={pad.left} y1={pad.top + (1 - v) * ch} x2={width - pad.right} y2={pad.top + (1 - v) * ch} className="stroke-foreground/[0.06]" strokeDasharray={v === 0 || v === 1 ? "none" : "3 3"} />
        ))}
        <line x1={pad.left} y1={pad.top + (1 - c) * ch} x2={width - pad.right} y2={pad.top + (1 - c) * ch} stroke="var(--color-destructive)" strokeDasharray="4 4" opacity={0.3} />
        <text x={width - pad.right + 2} y={pad.top + (1 - c) * ch + 3} fontSize={9} className="fill-destructive/60">c</text>
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + ch} className="stroke-foreground/10" />
        <line x1={pad.left} y1={pad.top + ch} x2={pad.left + cw} y2={pad.top + ch} className="stroke-foreground/10" />
        {[0, 0.5, 1].map((v) => (
          <text key={v} x={pad.left - 6} y={pad.top + (1 - v) * ch + 3} textAnchor="end" fontSize={10} className="fill-muted-foreground">{v}</text>
        ))}
        {[-4, -2, 0, 2, 4].map((v) => (
          <text key={v} x={pad.left + ((v + 4) / 8) * cw} y={height - pad.bottom + 18} textAnchor="middle" fontSize={10} className="fill-muted-foreground">{v}</text>
        ))}
        <text x={pad.left + cw / 2} y={height - 2} textAnchor="middle" fontSize={10} className="fill-muted-foreground/60">Proficiência (θ)</text>
        <text x={10} y={pad.top + ch / 2} textAnchor="middle" fontSize={10} className="fill-muted-foreground/60" transform={`rotate(-90, 10, ${pad.top + ch / 2})`}>P(θ)</text>
        <motion.path d={curve} fill="none" stroke="var(--color-primary)" strokeWidth={2.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }} />
        <motion.circle cx={bX} cy={bY} r={5} fill="var(--color-primary)" stroke="var(--color-background)" strokeWidth={2} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, duration: 0.4 }} />
        <text x={bX + 8} y={bY - 8} fontSize={10} className="fill-primary font-medium">b = {b.toFixed(1)}</text>
      </svg>

      <div className="mt-4 space-y-3">
        <Slider label="Discriminação (a)" value={a} min={0.3} max={3} step={0.1} onChange={setA} />
        <Slider label="Dificuldade (b)" value={b} min={-3} max={3} step={0.1} onChange={setB} />
        <Slider label="Acerto ao acaso (c)" value={c} min={0} max={0.4} step={0.05} onChange={setC} />
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-[11px] text-muted-foreground w-36 shrink-0">{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="flex-1 h-1 accent-primary cursor-pointer" />
      <span className="text-xs font-mono text-foreground w-10 text-right">{value.toFixed(step < 0.1 ? 2 : 1)}</span>
    </div>
  );
}
