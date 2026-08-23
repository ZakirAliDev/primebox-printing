"use client";

import { useState } from "react";
import { adminBox, adminBoxHead, adminField, adminMuted } from "@/components/admin/ui";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function TitlePermalink({
  defaultName,
  defaultSlug,
  prefix,
  formId,
}: {
  defaultName?: string;
  defaultSlug?: string;
  prefix: string;
  formId?: string;
}) {
  const isNew = !defaultSlug;
  const [name, setName] = useState(defaultName ?? "");
  const [slug, setSlug] = useState(defaultSlug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultSlug));

  return (
    <div className="space-y-4">
      <input
        required
        form={formId}
        name="name"
        value={name}
        onChange={(event) => {
          const next = event.target.value;
          setName(next);
          if (isNew && !slugTouched) {
            setSlug(toSlug(next));
          }
        }}
        placeholder="Add title"
        className="w-full rounded border border-navy/20 bg-white px-3 py-2 text-[1.7rem] leading-tight outline-none focus:border-navy"
      />
      <div className={adminBox}>
        <h2 className={adminBoxHead}>Permalink</h2>
        <div className="space-y-2 p-3">
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <span className={`shrink-0 ${adminMuted}`}>{prefix}</span>
            <input
              required
              form={formId}
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="url-slug"
              className={`${adminField} min-w-[12rem] flex-1`}
            />
          </div>
          <p className={`text-xs ${adminMuted}`}>
            {isNew
              ? "Auto-generated from the title. Edit the slug before saving if you need a custom URL."
              : "Changing the slug updates the public category URL. Old links will stop working unless you add a redirect."}
          </p>
        </div>
      </div>
    </div>
  );
}
