import type { ReactNode } from "react";
import type { TemplateIconName } from "@/lib/template-layout";

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-6 w-6",
  "aria-hidden": true as const,
};

const ICONS: Record<TemplateIconName, ReactNode> = {
  box: (
    <svg {...svgProps}>
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  ),
  print: (
    <svg {...svgProps}>
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
    </svg>
  ),
  truck: (
    <svg {...svgProps}>
      <path d="M1 7h11v10H1z" />
      <path d="M12 10h4l4 3v4h-8" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
    </svg>
  ),
  check: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  ),
  star: (
    <svg {...svgProps}>
      <path d="m12 3 2.4 6.5H21l-5.4 3.9 2.1 6.6L12 16.5 6.3 20l2.1-6.6L3 9.5h6.6L12 3Z" />
    </svg>
  ),
  leaf: (
    <svg {...svgProps}>
      <path d="M5 19c8 0 14-8 14-14-6 0-14 6-14 14Z" />
      <path d="M5 19c3-6 8-11 14-14" />
    </svg>
  ),
  shield: (
    <svg {...svgProps}>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
    </svg>
  ),
  droplet: (
    <svg {...svgProps}>
      <path d="M12 3s7 7 7 11a7 7 0 1 1-14 0c0-4 7-11 7-11Z" />
    </svg>
  ),
  layers: (
    <svg {...svgProps}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  ),
  scissors: (
    <svg {...svgProps}>
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="6" cy="17" r="2.5" />
      <path d="m8 8 13 8" />
      <path d="m8 16 13-8" />
    </svg>
  ),
};

export function TemplateIcon({ name }: { name: TemplateIconName }) {
  return ICONS[name];
}
