"use client";

import { useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { SITE_SELECT_PLACEHOLDER, siteSelect } from "@/components/form-ui";

export function SiteSelect({
  children,
  defaultValue = "",
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const [value, setValue] = useState(String(defaultValue ?? ""));

  return (
    <select
      {...props}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className={`${siteSelect} ${value === "" ? "text-muted/50" : "text-navy"} ${className ?? ""}`}
    >
      <option value="" disabled hidden className="text-muted/50">
        {SITE_SELECT_PLACEHOLDER}
      </option>
      {children}
    </select>
  );
}
