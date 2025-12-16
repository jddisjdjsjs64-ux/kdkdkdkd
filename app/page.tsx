"use client";

import * as React from "react";

import { HoleBackground } from "@/components/animate-ui/components/backgrounds/hole";
import { TokenDashboard3D } from "@/components/token-dashboard-3d";
import { TokenHeader } from "@/components/token-header";
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";

const FAKE_LOADING_MS = 6500;
const FADE_MS = 900;
const TOKEN_MINT = "KX2qhwFo2Lc6X6xqsE4VpkmZqZr22DKuFHCK8t7pump";
const DEX_URL = `https://dexscreener.com/solana/${TOKEN_MINT}`;

export default function Home() {
  const [showLoading, setShowLoading] = React.useState(true);
  const [showHole, setShowHole] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setShowHole(true);
      setShowLoading(false);
    }, FAKE_LOADING_MS);

    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Fixed background for the whole scroll */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <HoleBackground className="h-full w-full blur-sm opacity-95" />
      </div>

      <TokenHeader />

      {/* Main content */}
      <div
        className={
          "relative z-10 transition-opacity" +
          ` duration-[${FADE_MS}ms] ` +
          (showHole ? "opacity-100" : "opacity-0")
        }
      >
        {/* HERO section */}
        <section className="relative flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-4xl text-center">
            <div className="text-6xl font-semibold tracking-tight text-white md:text-7xl">
              AIVERSE.
            </div>
            <div className="mt-4 text-lg font-medium tracking-[0.25em] text-white/80 md:text-xl">
              🌌 3D avatars, AI, and memes in one universe.
            </div>
            <div className="mt-2 text-lg font-medium tracking-[0.25em] text-white/80 md:text-xl">
              🚀 Join $AIV now!
            </div>

            <a
              href={DEX_URL}
              target="_blank"
              rel="noreferrer"
              className="group mt-10 inline-flex items-center justify-center rounded-full border border-white/15 bg-black/35 px-7 py-3 text-sm font-semibold tracking-[0.25em] text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-black/45 hover:shadow-[0_0_80px_rgba(169,0,255,0.22)]"
            >
              Buy $AIV on Dexscreener
              <span className="ml-2 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </div>
        </section>

        {/* Dashboard section (scroll down to see it fully) */}
        <section className="relative pb-24 pt-8 px-6">
          <div className="mx-auto w-full max-w-6xl">
            <TokenDashboard3D />
          </div>
        </section>
      </div>

      {/* Loading screen overlay */}
      <div
        className={
          "fixed inset-0 z-50 transition-opacity" +
          ` duration-[${FADE_MS}ms] ` +
          (showLoading ? "opacity-100" : "opacity-0 pointer-events-none")
        }
      >
        <ParticleTextEffect
          words={["WARP", "LOADING", "READY"]}
          className="blur-[0.5px]"
        />
      </div>
    </div>
  );
}
