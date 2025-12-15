"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DexscreenerPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative?: string;
  priceUsd?: string;
  txns?: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
    h6?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  volume?: { m5?: number; h1?: number; h6?: number; h24?: number };
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  liquidity?: { usd?: number; base?: number; quote?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: { imageUrl?: string };
};


function formatUsd(n: number | undefined) {
  if (n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 6 : 2,
  });
}

function formatCompact(n: number | undefined) {
  if (n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  });
}

function formatPct(n: number | undefined) {
  if (n === undefined || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function MetricCard({
  title,
  value,
  sub,
  tone = "neutral",
}: {
  title: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "neutral" | "good" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "border-emerald-400/25 text-emerald-100"
      : tone === "bad"
        ? "border-rose-400/25 text-rose-100"
        : "border-white/15 text-white";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-black/35 p-4 backdrop-blur-md",
        "shadow-[0_0_40px_rgba(0,0,0,0.35)]",
        toneClass,
      )}
    >
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/70">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold leading-none">{value}</div>
      {sub ? <div className="mt-2 text-xs text-white/70">{sub}</div> : null}
    </div>
  );
}

type PricePoint = { t: number; v: number };

function Sparkline({ points }: { points: PricePoint[] }) {
  if (points.length < 2) return null;

  const values = points.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1e-9, max - min);

  const w = 240;
  const h = 52;

  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p.v - min) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const last = points[points.length - 1]?.v ?? 0;
  const first = points[0]?.v ?? 0;
  const up = last >= first;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 h-[52px] w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={up ? "rgba(16,185,129,0.35)" : "rgba(244,63,94,0.35)"}
          />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${w},${h} L 0,${h} Z`}
        fill="url(#sparkFill)"
        opacity={0.9}
      />
      <path
        d={d}
        fill="none"
        stroke={up ? "rgba(16,185,129,0.9)" : "rgba(244,63,94,0.9)"}
        strokeWidth={2}
      />
    </svg>
  );
}

function PriceCard({
  title,
  value,
  change5m,
  change24h,
  points,
}: {
  title: string;
  value: React.ReactNode;
  change5m?: number;
  change24h?: number;
  points: PricePoint[];
}) {
  const tone: "neutral" | "good" | "bad" =
    change24h === undefined ? "neutral" : change24h >= 0 ? "good" : "bad";

  const toneClass =
    tone === "good"
      ? "border-emerald-400/25 text-emerald-100"
      : tone === "bad"
        ? "border-rose-400/25 text-rose-100"
        : "border-white/15 text-white";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-black/35 p-4 backdrop-blur-md",
        "shadow-[0_0_40px_rgba(0,0,0,0.35)]",
        toneClass,
      )}
    >
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/70">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold leading-none">{value}</div>
      <div className="mt-2 text-xs text-white/70">
        <span>5m: {formatPct(change5m)}</span>
        <span className="mx-2 text-white/40">·</span>
        <span>24h: {formatPct(change24h)}</span>
      </div>
      <div className="opacity-90">
        <Sparkline points={points} />
      </div>
    </div>
  );
}


export function TokenDashboard3D({ className }: { className?: string }) {
  const [pair, setPair] = React.useState<DexscreenerPair | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [priceHistory, setPriceHistory] = React.useState<PricePoint[]>([]);

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/token", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as DexscreenerPair[];
        const nextPair = json[0] ?? null;

        if (!cancelled) {
          setPair(nextPair);

          const v = nextPair?.priceUsd ? Number(nextPair.priceUsd) : undefined;
          if (v !== undefined && Number.isFinite(v)) {
            setPriceHistory((prev) => {
              const next = [...prev, { t: Date.now(), v }];
              const MAX_POINTS = 36;
              return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
            });
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "failed");
      }
    };

    load();
    const t = window.setInterval(load, 10_000);

    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; // 0..1
      const py = (e.clientY - r.top) / r.height;
      const x = (py - 0.5) * -10; // rotateX
      const y = (px - 0.5) * 14; // rotateY
      setTilt({ x, y });
    };

    const onLeave = () => setTilt({ x: 0, y: 0 });

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const priceUsd = pair?.priceUsd ? Number(pair.priceUsd) : undefined;
  const change5m = pair?.priceChange?.m5;
  const change24h = pair?.priceChange?.h24;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "pointer-events-none z-20",
        "flex items-center justify-center",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-auto",
          "w-[min(1100px,92vw)]",
          "[perspective:1200px]",
        )}
      >
        <div
          className={cn(
            "rounded-[28px] border border-white/10 bg-black/20 p-6 backdrop-blur-sm",
            "shadow-[0_0_80px_rgba(0,0,0,0.55)]",
            "transition-transform duration-200 ease-out",
          )}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/60">
                Token Dashboard
              </div>
              <div className="mt-2 text-3xl font-semibold text-white">
                {pair?.baseToken?.name ?? "Loading…"}{" "}
                <span className="text-white/60">({pair?.baseToken?.symbol ?? ""})</span>
              </div>
              <div className="mt-2 text-xs text-white/60">
                {pair?.dexId ? `${pair.dexId} · ${pair.quoteToken?.symbol ?? ""}` : error ? `Error: ${error}` : "Fetching data…"}
              </div>
            </div>

            {pair?.info?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pair.info.imageUrl}
                alt="token"
                className="h-14 w-14 rounded-2xl border border-white/10 bg-black/30 object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl border border-white/10 bg-black/30" />
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <PriceCard
              title="Price"
              value={priceUsd !== undefined ? formatUsd(priceUsd) : "—"}
              change5m={change5m}
              change24h={change24h}
              points={priceHistory}
            />
            <MetricCard
              title="Liquidity"
              value={formatUsd(pair?.liquidity?.usd)}
              sub={
                pair?.liquidity?.quote !== undefined
                  ? `${formatCompact(pair?.liquidity?.quote)} ${pair?.quoteToken?.symbol ?? ""}`
                  : undefined
              }
            />
            <MetricCard
              title="Market cap"
              value={formatUsd(pair?.marketCap)}
              sub={pair?.fdv ? `FDV: ${formatUsd(pair?.fdv)}` : undefined}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard
              title="Volume (24h)"
              value={formatUsd(pair?.volume?.h24)}
              sub={
                pair?.volume?.h6 !== undefined
                  ? `6h: ${formatUsd(pair?.volume?.h6)}`
                  : undefined
              }
            />
            <MetricCard
              title="Txns (24h)"
              value={
                pair?.txns?.h24
                  ? `${formatCompact(pair.txns.h24.buys + pair.txns.h24.sells)}`
                  : "—"
              }
              sub={
                pair?.txns?.h24
                  ? `Buys: ${formatCompact(pair.txns.h24.buys)} · Sells: ${formatCompact(pair.txns.h24.sells)}`
                  : undefined
              }
            />
            <MetricCard
              title="Change (1h)"
              value={formatPct(pair?.priceChange?.h1)}
              tone={
                pair?.priceChange?.h1 === undefined
                  ? "neutral"
                  : pair.priceChange.h1 >= 0
                    ? "good"
                    : "bad"
              }
            />
            <a
              className={cn(
                "pointer-events-auto",
                "rounded-2xl border border-white/15 bg-black/35 p-4",
                "backdrop-blur-md text-white hover:bg-black/45",
                "transition-colors",
              )}
              href={pair?.url ?? "https://dexscreener.com"}
              target="_blank"
              rel="noreferrer"
            >
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                View on Dexscreener
              </div>
              <div className="mt-2 text-sm text-white/80">
                Open chart / pair
              </div>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
