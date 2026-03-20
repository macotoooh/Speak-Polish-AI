"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import SidebarNav from "@/components/sidebar/SidebarNav";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpenedOnPath, setMobileMenuOpenedOnPath] = useState<
    string | null
  >(null);
  const isMobileMenuOpen = mobileMenuOpenedOnPath === pathname;

  return (
    <>
      <aside className="w-full border-b border-border bg-surface p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between md:block">
          <h1 className="text-lg font-bold sm:text-xl md:mb-4">
            Speak Coach AI
          </h1>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpenedOnPath(pathname)}
            className="ui-btn-secondary rounded-md px-3 py-2 md:hidden"
          >
            <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
          </button>
        </div>
        <SidebarNav
          pathname={pathname}
          className="mt-4 hidden md:flex md:flex-col md:gap-2"
          itemClassName="md:w-full"
        />
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpenedOnPath(null)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface p-4 transition-transform duration-200 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Menu</h2>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpenedOnPath(null)}
            className="ui-btn-secondary rounded-md px-3 py-2"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>
        <SidebarNav pathname={pathname} className="flex flex-col gap-2" />
      </aside>
    </>
  );
}
