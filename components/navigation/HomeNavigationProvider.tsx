"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

const ReturningHomeContext = createContext(false);

export default function HomeNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [route, setRoute] = useState({ pathname, returningHome: false });

  if (route.pathname !== pathname) {
    setRoute({
      pathname,
      returningHome: pathname === "/" && route.pathname !== "/",
    });
  }

  return (
    <ReturningHomeContext.Provider value={route.returningHome}>
      {children}
    </ReturningHomeContext.Provider>
  );
}

export function useReturningHome() {
  return useContext(ReturningHomeContext);
}
