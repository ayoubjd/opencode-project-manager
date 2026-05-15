"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Table2,
  Columns3,
  FolderKanban,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/table", label: "Table View", icon: Table2 },
  { href: "/kanban", label: "Kanban View", icon: Columns3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive(href)
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-indigo-600" />
          <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            ProjectFlow
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-14 left-0 bottom-0 w-64 z-30 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {nav}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
          ProjectFlow v0.1
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-col shrink-0">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              ProjectFlow
            </span>
          </div>
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
        {nav}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
          ProjectFlow v0.1
        </div>
      </aside>
    </>
  );
}
