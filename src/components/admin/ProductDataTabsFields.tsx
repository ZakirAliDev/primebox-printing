"use client";

import { useState } from "react";
import Link from "next/link";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { adminField, adminGhost, adminMuted, adminTrash } from "@/components/admin/ui";
import type { ProductTab, TabSource, TabTemplate } from "@/lib/catalog";

type TabRow = ProductTab & { id: string };

function templateName(slug: string | undefined, templates: TabTemplate[]) {
  return templates.find((item) => item.slug === slug)?.name ?? "";
}

function emptyTab(templates: TabTemplate[]): TabRow {
  return {
    id: crypto.randomUUID(),
    title: "",
    source: "custom",
    template: templates[0]?.slug,
    content: "",
  };
}

export function ProductDataTabsFields({
  defaultTabs = [],
  mediaSlug = "draft",
  templates = [],
  showDescriptionTab = true,
  disabled = false,
}: {
  defaultTabs?: ProductTab[];
  mediaSlug?: string;
  templates?: TabTemplate[];
  showDescriptionTab?: boolean;
  disabled?: boolean;
}) {
  const [rows, setRows] = useState<TabRow[]>(
    defaultTabs.map((tab) => ({
      ...tab,
      source: tab.source === "template" ? "template" : "custom",
      template: tab.template ?? templates[0]?.slug,
      id: crypto.randomUUID(),
    })),
  );
  const [openId, setOpenId] = useState("");

  const updateRow = (id: string, patch: Partial<TabRow>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const setSource = (id: string, source: TabSource) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) {
          return row;
        }
        if (source !== "template") {
          return { ...row, source };
        }
        const template = row.template ?? templates[0]?.slug;
        return {
          ...row,
          source,
          template,
          title: row.title.trim() || templateName(template, templates),
        };
      }),
    );
  };

  const setTemplate = (id: string, template: string) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) {
          return row;
        }
        const previous = templateName(row.template, templates);
        const title = !row.title.trim() || row.title === previous ? templateName(template, templates) : row.title;
        return { ...row, template, title };
      }),
    );
  };

  const addRow = () => {
    const next = emptyTab(templates);
    setRows((current) => [...current, next]);
    setOpenId(next.id);
  };

  const removeRow = (id: string) => {
    setRows((current) => {
      const next = current.filter((row) => row.id !== id);
      if (openId === id) {
        setOpenId(next[0]?.id ?? "");
      }
      return next;
    });
  };

  return (
    <div className={`space-y-3 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      {showDescriptionTab ? (
        <div className="flex items-center gap-3 rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-yellow text-[11px] font-semibold text-navy">
            1
          </span>
          <span className="text-sm font-medium text-navy">Description</span>
          <span className={`text-xs ${adminMuted}`}>Default tab · uses the Description field above</span>
        </div>
      ) : null}
      {rows.length > 0 ? (
        <ul className="divide-y divide-navy/10 overflow-hidden rounded-lg border border-navy/10">
          {rows.map((row, index) => {
            const open = openId === row.id;
            return (
              <li key={row.id} className={`transition-colors duration-300 ${open ? "bg-navy/[0.03]" : "bg-white"}`}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? "" : row.id)}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-navy text-[11px] font-semibold text-white">
                      {index + (showDescriptionTab ? 2 : 1)}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-sm ${row.title ? "font-medium text-navy" : adminMuted}`}>
                      {row.title.trim() || "Untitled tab"}
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 text-navy/40 transition-transform duration-300 ease-out ${
                        open ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button type="button" className={`${adminTrash} shrink-0 text-xs`} onClick={() => removeRow(row.id)}>
                    Remove
                  </button>
                </div>
                <input type="hidden" name="tabTitle" value={row.title} />
                <input type="hidden" name="tabSource" value={row.source} />
                <input type="hidden" name="tabTemplate" value={row.template ?? ""} />
                <input type="hidden" name="tabContent" value={row.content} />
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className={`space-y-3 border-t border-navy/10 px-3 py-3 transition-opacity duration-300 ${
                        open ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <label className="block">
                        <span className={`mb-1 block text-xs ${adminMuted}`}>Tab title</span>
                        <input
                          value={row.title}
                          placeholder="e.g. Specifications"
                          className={adminField}
                          onChange={(event) => updateRow(row.id, { title: event.target.value })}
                        />
                      </label>
                      <fieldset className="space-y-2">
                        <legend className={`text-xs ${adminMuted}`}>Content source</legend>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                          <input
                            type="radio"
                            checked={row.source === "custom"}
                            className="cursor-pointer"
                            onChange={() => setSource(row.id, "custom")}
                          />
                          Custom content
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                          <input
                            type="radio"
                            checked={row.source === "template"}
                            disabled={templates.length === 0}
                            className="cursor-pointer disabled:cursor-not-allowed"
                            onChange={() => setSource(row.id, "template")}
                          />
                          Template
                        </label>
                        {templates.length === 0 ? (
                          <p className={`text-xs ${adminMuted}`}>
                            <Link href="/admin/templates/new" className="font-medium text-navy hover:underline">
                              Create a template
                            </Link>{" "}
                            to attach it here.
                          </p>
                        ) : null}
                      </fieldset>
                      {row.source === "template" ? (
                        <label className="block">
                          <span className={`mb-1 block text-xs ${adminMuted}`}>Template</span>
                          <select
                            value={row.template ?? templates[0]?.slug ?? ""}
                            className={adminField}
                            onChange={(event) => setTemplate(row.id, event.target.value)}
                          >
                            {templates.map((item) => (
                              <option key={item.slug} value={item.slug}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                          <span className={`mt-1 block text-xs ${adminMuted}`}>
                            This tab uses the shared {templateName(row.template, templates) || "template"} content.
                            {" "}
                            <Link href="/admin/templates" className="font-medium text-navy hover:underline">
                              Manage templates
                            </Link>
                          </span>
                        </label>
                      ) : open ? (
                        <div>
                          <span className={`mb-1 block text-xs ${adminMuted}`}>Tab content</span>
                          <RichTextEditor
                            defaultValue={row.content}
                            height={260}
                            mediaSlug={mediaSlug}
                            onHtmlChange={(html) => updateRow(row.id, { content: html })}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {disabled ? null : (
        <button type="button" className={adminGhost} onClick={addRow}>
          + Add tab
        </button>
      )}
    </div>
  );
}
