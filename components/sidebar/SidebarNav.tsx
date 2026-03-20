import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { navItems } from "@/components/sidebar/nav-items";

type SidebarNavProps = {
  pathname: string;
  className: string;
  itemClassName?: string;
};

export default function SidebarNav({
  pathname,
  className,
  itemClassName = "",
}: SidebarNavProps) {
  return (
    <nav className={className}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              isActive ? "ui-btn-primary" : "ui-btn-secondary"
            } ${itemClassName}`.trim()}
          >
            <span className="inline-flex items-center gap-2">
              <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
