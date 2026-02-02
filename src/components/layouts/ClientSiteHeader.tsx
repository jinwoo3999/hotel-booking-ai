"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "./SiteHeader";

type SiteHeaderSession = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  };
};

export function ClientSiteHeader({
  session,
  className,
}: {
  session: SiteHeaderSession | null;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render một placeholder tương tự để tránh layout shift
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-transparent text-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <div className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Lumina Stay
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-9 bg-white/20 rounded animate-pulse" />
            <div className="w-20 h-9 bg-indigo-600 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return <SiteHeader session={session} className={className} />;
}