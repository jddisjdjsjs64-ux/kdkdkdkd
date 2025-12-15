"use client";

import * as React from "react";
import { LineChart, ScanSearch, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const TOKEN_MINT = "8hmFgiKHjgPaFvntHqj2bLm1JAP11V6Fxkm6Tekepump";
const DEX_URL =
  "https://dexscreener.com/solana/euabmnyqkcomqdcknkyfpfpdkgffyge361b9w2nz5wcv";
const SOLSCAN_URL = `https://solscan.io/token/${TOKEN_MINT}`;
const PUMP_FUN_URL = `https://pump.fun/${TOKEN_MINT}`;

function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-2",
        "rounded-full px-3 py-2",
        "text-sm font-medium text-white/80",
        "transition-colors",
        "hover:bg-white/10 hover:text-white",
      )}
    >
      <span className="text-white/70">{icon}</span>
      <span className="tracking-wide">{label}</span>
    </a>
  );
}

type DexscreenerPair = {
  baseToken?: { symbol?: string };
  info?: { imageUrl?: string };
};

export function TokenHeader({ className }: { className?: string }) {
  const [pair, setPair] = React.useState<DexscreenerPair | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/token", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as DexscreenerPair[];
        if (!cancelled) setPair(json[0] ?? null);
      } catch {
        // ignore
      }
    };

    load();
    const t = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-6 top-6 z-40",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-auto",
          "flex items-center",
          "rounded-full border border-white/15 bg-black/35",
          "backdrop-blur-md text-white",
          "shadow-[0_0_40px_rgba(0,0,0,0.35)]",
        )}
      >
        {/* Token button */}
        <button
        type="button"
        onClick={() => window.location.reload()}
        className={cn(
          "group relative",
          "flex items-center gap-3",
          "rounded-full px-4 py-2",
          "transition-all duration-300",
          "hover:bg-black/45",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -inset-[2px] -z-10 rounded-full opacity-0",
            "bg-[radial-gradient(circle_at_30%_30%,rgba(0,248,241,0.35),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(255,189,30,0.25),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(169,0,255,0.25),transparent_60%)]",
            "blur-md transition-opacity duration-300 group-hover:opacity-100",
          )}
        />

        {pair?.info?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pair.info.imageUrl}
            alt={pair?.baseToken?.symbol ?? "token"}
            className="h-9 w-9 rounded-full border border-white/15 bg-black/40 object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full border border-white/15 bg-black/40" />
        )}

        <div className="text-sm font-semibold tracking-[0.25em]">
          {pair?.baseToken?.symbol ?? "HERO"}
        </div>
      </button>

      {/* Separator */}
      <div className="px-2 text-white/30">|</div>

      {/* Links */}
      <nav className="flex items-center pr-2">
        <NavLink href={DEX_URL} label="Dex" icon={<LineChart size={16} />} />
        <NavLink
          href={SOLSCAN_URL}
          label="Solscan"
          icon={<ScanSearch size={16} />}
        />
        <NavLink href={PUMP_FUN_URL} label="pump.fun" icon={<Zap size={16} />} />
      </nav>
    </div>
    </div>
  );
}
