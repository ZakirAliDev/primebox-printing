"use client";

import { useState, type ReactNode } from "react";

function AccordionChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 text-current opacity-60 transition-transform duration-300 ease-out ${
        open ? "rotate-180" : "rotate-0"
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  open: openProp,
  onToggle,
  titleClassName = "px-4 py-3 font-semibold text-foreground",
  className = "rounded-lg border border-border/10 bg-surface",
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
  titleClassName?: string;
  className?: string;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 text-left ${titleClassName}`}
        onClick={() => (onToggle ? onToggle() : setUncontrolledOpen((current) => !current))}
      >
        <span>{title}</span>
        <AccordionChevron open={open} />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={`transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ExclusiveAccordion({
  items,
  titleClassName,
  className,
}: {
  items: readonly { title: string; content: ReactNode }[];
  titleClassName?: string;
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Accordion
          key={item.title}
          title={item.title}
          open={openIndex === index}
          onToggle={() => setOpenIndex(index)}
          titleClassName={titleClassName}
          className={className}
        >
          {item.content}
        </Accordion>
      ))}
    </div>
  );
}
