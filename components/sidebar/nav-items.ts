import {
  faChartLine,
  faClockRotateLeft,
  faGear,
  faMicrophoneLines,
} from "@fortawesome/free-solid-svg-icons";

export const navItems = [
  { href: "/practice", label: "Practice", icon: faMicrophoneLines },
  { href: "/history", label: "History", icon: faClockRotateLeft },
  { href: "/progress", label: "Progress", icon: faChartLine },
  { href: "/settings", label: "Settings", icon: faGear },
] as const;
