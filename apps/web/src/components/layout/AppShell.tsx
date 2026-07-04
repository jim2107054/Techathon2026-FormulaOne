"use client";

import { useState, type ReactNode } from "react";

import { useSocket } from "@/hooks/useSocket";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { connected } = useSocket();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-pos-bgPage">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar
          connected={connected}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          sidebarCollapsed={sidebarCollapsed}
          title="Dashboard"
        />
        <main className="flex-1 px-5 py-5 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
