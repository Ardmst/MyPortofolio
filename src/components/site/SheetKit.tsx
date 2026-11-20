"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initBiro, initMonument, initRise, initSheet, initTheme } from "@/lib/sheet-kit";

/**
 * Mounts the shared "sheet and biro" kit (`src/lib/sheet-kit.js`, a verbatim
 * copy of the workspace's `shared/sheet-kit.js`). Rendered once, by the public
 * root layout. Every init returns its own cleanup and is reference-counted, so
 * strict-mode double mounting leaves one instance.
 */
export function SheetKit() {
  const pathname = usePathname();

  // Once for the whole visit: none of these depends on the page that is showing.
  useEffect(() => {
    const offs = [initTheme(), initRise(), initSheet(), initBiro()];
    return () => offs.forEach((off) => off());
  }, []);

  // Per page: the monument's letters belong to the page that is showing.
  useEffect(() => initMonument(), [pathname]);

  return null;
}
