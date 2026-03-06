"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faClockRotateLeft,
  faGear,
  faMicrophoneLines,
} from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { href: "/practice", label: "Practice", icon: faMicrophoneLines },
  { href: "/history", label: "History", icon: faClockRotateLeft },
  { href: "/progress", label: "Progress", icon: faChartLine },
  { href: "/settings", label: "Settings", icon: faGear },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-border bg-surface p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <h1 className="mb-4 text-xl font-bold">Speak Polish AI</h1>
      <nav className="flex gap-2 md:flex-col">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "ui-btn-primary" : "ui-btn-secondary"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
