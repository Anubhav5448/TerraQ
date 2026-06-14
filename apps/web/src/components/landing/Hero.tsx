"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import TopoBackground from "./TopoHero";

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  return (
    <div className="relative px-6 py-20 md:py-28 text-center overflow-hidden">
      <TopoBackground />
      <div className="relative z-10">
        <p className="text-xs tracking-[0.2em] text-blue-400 uppercase mb-4">
          Turn every run into territory
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight max-w-2xl mx-auto mb-4">
          Run, ride, and walk to{" "}
          <span className="text-cyan-400">claim the map</span>
        </h1>
        <p className="text-base text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
          Track real-world activity and convert your routes into owned territory.
          Close a loop and claim everything inside.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="bg-blue-500 hover:bg-blue-400 text-white font-medium text-sm rounded-lg px-7 py-3 transition-colors"
          >
            {isLoggedIn ? "Go to dashboard" : "Get started"}
          </Link>
          <Link
            href="#how-it-works"
            className="border border-blue-500/30 text-gray-200 hover:bg-blue-500/5 font-medium text-sm rounded-lg px-7 py-3 transition-colors"
          >
            See how it works
          </Link>
        </div>
      </div>
    </div>
  );
}