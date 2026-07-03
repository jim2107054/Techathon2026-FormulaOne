"use client";

import type { ReactNode } from "react";

import { useSocket } from "@/hooks/useSocket";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { connected } = useSocket();

  return (
    <div className="flex min-h-screen bg-pos-bgPage">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar connected={connected} title="Dashboard" />
        <main className="layout-grid flex-1 px-5 py-5 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
