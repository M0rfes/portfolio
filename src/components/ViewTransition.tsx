"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ViewTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Check if View Transitions API is supported
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      if (previousPathname.current !== pathname) {
        // Start a view transition
        const doc = document as Document & {
          startViewTransition: (callback: () => void) => void;
        };
        doc.startViewTransition(() => {
          previousPathname.current = pathname;
        });
      }
    }
  }, [pathname]);

  return <>{children}</>;
}
