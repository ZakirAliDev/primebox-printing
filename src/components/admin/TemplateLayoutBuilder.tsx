"use client";

import { useEffect, useRef, useState, type DragEvent, type MouseEvent, type ReactNode } from "react";
import { TemplateIcon } from "@/components/TemplateIcons";
import { WidgetInspector } from "@/components/admin/WidgetInspector";
import { adminGhost, adminMuted, adminPrimary, adminTrash } from "@/components/admin/ui";
import { collectGoogleFonts, googleFontsStylesheetUrl } from "@/lib/google-fonts";
import {
  GRID_BREAKPOINTS,
  SECTION_PRESETS,
  WIDGET_PALETTE_GROUPS,
  cloneWidget,
  createSection,
  createWidget,
  equalizeSpans,
  isWidgetType,
  imageFillsParentHeight,
  imageSizeStyle,
  resolvedAppearance,
  resolvedGridSize,
  visibleGridCells,
  widgetAppearanceStyle,
  type ColumnSpan,
  type GridBreakpointId,
  type TemplateColumn,
  type TemplateSection,
  type TemplateWidget,
  type WidgetAppearanceMap,
  type WidgetType,
} from "@/lib/template-layout";

type Selection = {
  sectionId: string;
  columnId: string;
  widgetId: string;
  cellId?: string;
  childId?: string;
};

type ContextTarget =
  | { kind: "widget"; selection: Selection }
  | { kind: "column"; sectionId: string; columnId: string }
  | { kind: "cell"; sectionId: string; columnId: string; gridId: string; cellId: string };

type ContextMenuState = {
  x: number;
  y: number;
  target: ContextTarget;
};

const PALETTE_MIME = "application/x-pbp-widget-type";
const MOVE_MIME = "application/x-pbp-widget-ref";

export function TemplateLayoutBuilder({
  defaultLayout = [],
  mediaSlug,
}: {
  defaultLayout?: TemplateSection[];
  mediaSlug: string;
}) {
  const [layout, setLayout] = useState<TemplateSection[]>(defaultLayout);
  const [selected, setSelectedState] = useState<Selection | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"widgets" | "settings">("widgets");
  const [pickingPreset, setPickingPreset] = useState(layout.length === 0);
  const [dragOver, setDragOver] = useState("");
  const [previewBreakpoint, setPreviewBreakpoint] = useState<GridBreakpointId>("lg");
  const skipPaletteClick = useRef(false);
  const [clipboard, setClipboard] = useState<{
    widget: TemplateWidget | null;
    appearance: WidgetAppearanceMap | null;
  }>({ widget: null, appearance: null });
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const setSelected = (next: Selection | null) => {
    setSelectedState(next);
    setSidebarTab(next ? "settings" : "widgets");
  };

  const openContextMenu = (event: MouseEvent, target: ContextTarget) => {
    event.preventDefault();
    event.stopPropagation();
    if (target.kind === "widget") {
      setSelected(target.selection);
    } else if (target.kind === "cell") {
      setSelected({
        sectionId: target.sectionId,
        columnId: target.columnId,
        widgetId: target.gridId,
        cellId: target.cellId,
      });
    }
    setContextMenu({
      x: Math.min(event.clientX, window.innerWidth - 188),
      y: Math.min(event.clientY, window.innerHeight - 168),
      target,
    });
  };

  const copyWidget = (selection: Selection) => {
    const widget = findSelectedWidget(layout, selection);
    if (!widget) {
      return;
    }
    setClipboard((current) => ({ ...current, widget: cloneWidget(widget), appearance: structuredClone(widget.appearance) }));
  };

  const copyStyle = (selection: Selection) => {
    const widget = findSelectedWidget(layout, selection);
    if (!widget) {
      return;
    }
    setClipboard((current) => ({ ...current, appearance: structuredClone(widget.appearance) }));
  };

  const pasteWidget = (target: ContextTarget) => {
    if (!clipboard.widget) {
      return;
    }
    if (clipboard.widget.type === "grid" && target.kind === "cell") {
      return;
    }
    const widget = cloneWidget(clipboard.widget);
    if (target.kind === "column") {
      setLayout((current) => insertWidget(current, target.sectionId, target.columnId, widget));
      setSelected({ sectionId: target.sectionId, columnId: target.columnId, widgetId: widget.id });
      return;
    }
    if (target.kind === "cell") {
      setLayout((current) =>
        insertInCell(current, target.sectionId, target.columnId, target.gridId, target.cellId, widget),
      );
      setSelected({
        sectionId: target.sectionId,
        columnId: target.columnId,
        widgetId: target.gridId,
        cellId: target.cellId,
        childId: widget.id,
      });
      return;
    }
    const selection = target.selection;
    if (selection.childId && selection.cellId) {
      const cellId = selection.cellId;
      setLayout((current) => {
        const nextId = nextWidgetId(current, selection);
        return insertInCell(
          current,
          selection.sectionId,
          selection.columnId,
          selection.widgetId,
          cellId,
          widget,
          nextId,
        );
      });
      setSelected({ ...selection, childId: widget.id });
      return;
    }
    setLayout((current) => {
      const nextId = nextWidgetId(current, selection);
      return insertWidget(current, selection.sectionId, selection.columnId, widget, nextId);
    });
    setSelected({ sectionId: selection.sectionId, columnId: selection.columnId, widgetId: widget.id });
  };

  const pasteStyle = (selection: Selection) => {
    if (!clipboard.appearance) {
      return;
    }
    const appearance = structuredClone(clipboard.appearance);
    setLayout((current) => mapAnyWidget(current, selection, (widget) => ({ ...widget, appearance })));
    setSelected(selection);
  };

  const selectedWidget = selected ? findSelectedWidget(layout, selected) : null;
  const googleFontsUrl = googleFontsStylesheetUrl(collectGoogleFonts(layout));

  const addSection = (spans: ColumnSpan[]) => {
    const section = createSection(spans);
    setLayout((current) => [...current, section]);
    setPickingPreset(false);
  };

  const addWidgetToTarget = (type: WidgetType) => {
    const widget = createWidget(type);
    if (layout.length === 0) {
      const section = createSection([12]);
      const column = section.columns[0];
      if (!column) {
        return;
      }
      column.widgets = [widget];
      setLayout([section]);
      setSelected({ sectionId: section.id, columnId: column.id, widgetId: widget.id });
      setPickingPreset(false);
      return;
    }
    if (selected?.cellId && type !== "grid") {
      const cellId = selected.cellId;
      setLayout((current) =>
        insertInCell(current, selected.sectionId, selected.columnId, selected.widgetId, cellId, widget),
      );
      setSelected({ ...selected, childId: widget.id });
      return;
    }
    const target = selected
      ? { sectionId: selected.sectionId, columnId: selected.columnId }
      : lastColumnTarget(layout);
    if (!target) {
      return;
    }
    setLayout((current) => insertWidget(current, target.sectionId, target.columnId, widget));
    setSelected({ sectionId: target.sectionId, columnId: target.columnId, widgetId: widget.id });
  };

  const updateWidget = (next: TemplateWidget) => {
    if (!selected) {
      return;
    }
    setLayout((current) =>
      mapTopWidget(current, selected, (widget) => {
        if (selected.childId && widget.type === "grid") {
          return {
            ...widget,
            cells: widget.cells.map((cell) =>
              cell.id === selected.cellId
                ? {
                    ...cell,
                    widgets: cell.widgets.map((child) => (child.id === selected.childId ? next : child)),
                  }
                : cell,
            ),
          };
        }
        return next;
      }),
    );
  };

  const removeWidget = (target: Selection) => {
    setLayout((current) => {
      if (target.childId && target.cellId) {
        return mapTopWidget(current, target, (widget) => {
          if (widget.type !== "grid") {
            return widget;
          }
          return {
            ...widget,
            cells: widget.cells.map((cell) =>
              cell.id === target.cellId
                ? { ...cell, widgets: cell.widgets.filter((child) => child.id !== target.childId) }
                : cell,
            ),
          };
        });
      }
      return current.map((section) => {
        if (section.id !== target.sectionId) {
          return section;
        }
        return {
          ...section,
          columns: section.columns.map((column) => {
            if (column.id !== target.columnId) {
              return column;
            }
            return { ...column, widgets: column.widgets.filter((widget) => widget.id !== target.widgetId) };
          }),
        };
      });
    });
    if (target.childId && selected?.childId === target.childId) {
      setSelected({ sectionId: target.sectionId, columnId: target.columnId, widgetId: target.widgetId, cellId: target.cellId });
      return;
    }
    if (selected?.widgetId === target.widgetId && !target.childId) {
      setSelected(null);
    }
  };

  const dropOnColumn = (event: DragEvent, sectionId: string, columnId: string, beforeId?: string) => {
    event.preventDefault();
    setDragOver("");
    const palette = event.dataTransfer.getData(PALETTE_MIME);
    const text = event.dataTransfer.getData("text/plain");
    const typeValue = isWidgetType(palette) ? palette : isWidgetType(text) ? text : "";
    if (typeValue) {
      const widget = createWidget(typeValue);
      setLayout((current) => insertWidget(current, sectionId, columnId, widget, beforeId));
      setSelected({ sectionId, columnId, widgetId: widget.id });
      return;
    }
    if (text.startsWith("cell:")) {
      const [, fromSection, fromColumn, fromGrid, fromCell, childId] = text.split(":");
      if (!fromSection || !fromColumn || !fromGrid || !fromCell || !childId) {
        return;
      }
      setLayout((current) => {
        const extracted = extractCellWidget(current, {
          sectionId: fromSection,
          columnId: fromColumn,
          widgetId: fromGrid,
          cellId: fromCell,
          childId,
        });
        if (!extracted.widget) {
          return current;
        }
        return insertWidget(extracted.layout, sectionId, columnId, extracted.widget, beforeId);
      });
      return;
    }
    const ref = text.startsWith("move:") ? text.slice(5) : event.dataTransfer.getData(MOVE_MIME);
    const [fromSection, fromColumn, widgetId] = ref.split(":");
    if (!fromSection || !fromColumn || !widgetId) {
      return;
    }
    setLayout((current) =>
      moveWidget(current, { sectionId: fromSection, columnId: fromColumn, widgetId }, sectionId, columnId, beforeId),
    );
    setSelected({ sectionId, columnId, widgetId });
  };

  const dropOnCell = (
    event: DragEvent,
    sectionId: string,
    columnId: string,
    gridId: string,
    cellId: string,
    beforeId?: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver("");
    const palette = event.dataTransfer.getData(PALETTE_MIME);
    const text = event.dataTransfer.getData("text/plain");
    const typeValue = isWidgetType(palette) ? palette : isWidgetType(text) ? text : "";
    if (typeValue) {
      if (typeValue === "grid") {
        return;
      }
      const widget = createWidget(typeValue);
      setLayout((current) => insertInCell(current, sectionId, columnId, gridId, cellId, widget, beforeId));
      setSelected({ sectionId, columnId, widgetId: gridId, cellId, childId: widget.id });
      return;
    }
    if (text.startsWith("cell:")) {
      const [, fromSection, fromColumn, fromGrid, fromCell, childId] = text.split(":");
      if (!fromSection || !fromColumn || !fromGrid || !fromCell || !childId) {
        return;
      }
      setLayout((current) => {
        const extracted = extractCellWidget(current, {
          sectionId: fromSection,
          columnId: fromColumn,
          widgetId: fromGrid,
          cellId: fromCell,
          childId,
        });
        if (!extracted.widget) {
          return current;
        }
        return insertInCell(extracted.layout, sectionId, columnId, gridId, cellId, extracted.widget, beforeId);
      });
      setSelected({ sectionId, columnId, widgetId: gridId, cellId, childId: text.split(":")[5] });
      return;
    }
    const ref = text.startsWith("move:") ? text.slice(5) : event.dataTransfer.getData(MOVE_MIME);
    const [fromSection, fromColumn, widgetId] = ref.split(":");
    if (!fromSection || !fromColumn || !widgetId) {
      return;
    }
    setLayout((current) => {
      const extracted = extractColumnWidget(current, { sectionId: fromSection, columnId: fromColumn, widgetId });
      if (!extracted.widget || extracted.widget.type === "grid") {
        return current;
      }
      return insertInCell(extracted.layout, sectionId, columnId, gridId, cellId, extracted.widget, beforeId);
    });
    setSelected({ sectionId, columnId, widgetId: gridId, cellId, childId: widgetId });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
      {googleFontsUrl ? <link rel="stylesheet" href={googleFontsUrl} /> : null}
      <input type="hidden" name="layout" value={JSON.stringify(layout)} />
      <div className="flex min-h-[520px]">
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-navy/10 bg-white">
          <div className="flex border-b border-navy/10">
            <button
              type="button"
              className={`flex-1 px-2 py-2.5 text-xs font-semibold ${
                sidebarTab === "widgets" ? "border-b-2 border-yellow text-navy" : "text-navy/50 hover:text-navy"
              }`}
              onClick={() => setSidebarTab("widgets")}
            >
              Widgets
            </button>
            <button
              type="button"
              className={`flex-1 px-2 py-2.5 text-xs font-semibold ${
                sidebarTab === "settings" ? "border-b-2 border-yellow text-navy" : "text-navy/50 hover:text-navy"
              }`}
              onClick={() => setSidebarTab("settings")}
            >
              Settings
            </button>
          </div>
          {sidebarTab === "widgets" ? (
            <div>
              {WIDGET_PALETTE_GROUPS.map((group) => (
                <PaletteGroup key={group.id} title={group.title}>
                  {group.items.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      draggable
                      className="flex aspect-[1.15] flex-col items-center justify-center gap-2 rounded-lg border border-navy/15 bg-white text-[12px] text-navy/65 hover:border-navy/30 hover:text-navy"
                      onDragStart={(event) => {
                        skipPaletteClick.current = true;
                        event.dataTransfer.setData(PALETTE_MIME, item.type);
                        event.dataTransfer.setData("text/plain", item.type);
                        event.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => {
                        if (skipPaletteClick.current) {
                          skipPaletteClick.current = false;
                          return;
                        }
                        addWidgetToTarget(item.type);
                      }}
                    >
                      <PaletteIcon type={item.type} />
                      {item.label}
                    </button>
                  ))}
                </PaletteGroup>
              ))}
              <p className={`px-3 py-3 text-[10px] ${adminMuted}`}>Click or drag a widget onto a column</p>
            </div>
          ) : (
            <WidgetInspector
              widget={selectedWidget}
              mediaSlug={mediaSlug}
              previewBreakpoint={previewBreakpoint}
              onPreviewBreakpoint={setPreviewBreakpoint}
              onChange={updateWidget}
              onRemove={() => selected && removeWidget(selected)}
            />
          )}
        </aside>

        <div
          className="min-w-0 flex-1 bg-navy/[0.03] p-3"
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <p className="mr-2 text-xs font-semibold uppercase tracking-wide text-navy/50">Canvas</p>
              {GRID_BREAKPOINTS.map((breakpoint) => (
                <button
                  key={breakpoint.id}
                  type="button"
                  className={`rounded border px-1.5 py-1 text-[10px] font-semibold ${
                    previewBreakpoint === breakpoint.id
                      ? "border-yellow bg-yellow/20 text-navy"
                      : "border-navy/15 bg-white text-navy/60"
                  }`}
                  onClick={() => setPreviewBreakpoint(breakpoint.id)}
                >
                  {breakpoint.short}
                </button>
              ))}
            </div>
            <button type="button" className={adminPrimary} onClick={() => setPickingPreset((open) => !open)}>
              + Add section
            </button>
          </div>
          {pickingPreset ? (
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {SECTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="rounded-lg border border-navy/15 bg-white p-2 hover:border-yellow"
                  onClick={() => addSection(preset.spans)}
                >
                  <span className="mb-1.5 grid h-8 grid-cols-12 gap-0.5">
                    {preset.spans.map((span, index) => (
                      <span
                        key={`${preset.id}-${index}`}
                        className="rounded-sm bg-navy/20"
                        style={{ gridColumn: `span ${span}` }}
                      />
                    ))}
                  </span>
                  <span className="block text-[11px] font-medium text-navy">{preset.label}</span>
                </button>
              ))}
            </div>
          ) : null}
          {layout.length === 0 ? (
            <p className={`rounded-lg border border-dashed border-navy/20 bg-white px-4 py-10 text-center text-sm ${adminMuted}`}>
              Add a section, then click or drag widgets into its columns.
            </p>
          ) : (
            <div className="space-y-3">
              {layout.map((section, sectionIndex) => (
                <section key={section.id} className="rounded-lg border border-navy/15 bg-white p-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className={`text-[11px] ${adminMuted}`}>
                      Section {sectionIndex + 1} · {section.columns.length} column
                      {section.columns.length === 1 ? "" : "s"}
                    </p>
                    <div className="flex gap-2">
                      {section.columns.length < 4 ? (
                        <button
                          type="button"
                          className={`${adminGhost} !px-2 !py-1 text-xs`}
                          onClick={() =>
                            setLayout((current) =>
                              current.map((item) => (item.id === section.id ? addColumn(item) : item)),
                            )
                          }
                        >
                          + Column
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className={`${adminTrash} text-xs`}
                        onClick={() => {
                          setLayout((current) => current.filter((item) => item.id !== section.id));
                          if (selected?.sectionId === section.id) {
                            setSelected(null);
                          }
                        }}
                      >
                        Delete section
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    {section.columns.map((column, columnIndex) => {
                      const over = dragOver === `${section.id}:${column.id}`;
                      return (
                        <div
                          key={column.id}
                          className={`min-h-[140px] rounded-md border border-dashed p-2 transition-colors ${
                            over ? "border-yellow bg-yellow/10" : "border-navy/20 bg-navy/[0.02]"
                          }`}
                          style={{ gridColumn: `span ${column.span}` }}
                          onContextMenu={(event) =>
                            openContextMenu(event, { kind: "column", sectionId: section.id, columnId: column.id })
                          }
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOver(`${section.id}:${column.id}`);
                          }}
                          onDragLeave={() => setDragOver("")}
                          onDrop={(event) => dropOnColumn(event, section.id, column.id)}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className={`text-[10px] ${adminMuted}`}>Column {columnIndex + 1}</span>
                            {section.columns.length > 1 ? (
                              <button
                                type="button"
                                className={`${adminTrash} text-[10px]`}
                                onClick={() => {
                                  setLayout((current) =>
                                    current.map((item) => (item.id === section.id ? removeColumn(item, column.id) : item)),
                                  );
                                  if (selected?.columnId === column.id) {
                                    setSelected(null);
                                  }
                                }}
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                          <div className="space-y-1.5">
                            {column.widgets.map((widget) => {
                              const active = selected?.widgetId === widget.id && !selected.childId;
                              const appearance = resolvedAppearance(widget.appearance, previewBreakpoint);
                              if (widget.type === "grid") {
                                const size = resolvedGridSize(widget.sizes, previewBreakpoint);
                                return (
                                  <div
                                    key={widget.id}
                                    className={`rounded border bg-white p-2 ${active ? "border-yellow" : "border-navy/10"}`}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setSelected({
                                        sectionId: section.id,
                                        columnId: column.id,
                                        widgetId: widget.id,
                                      });
                                    }}
                                    onContextMenu={(event) =>
                                      openContextMenu(event, {
                                        kind: "widget",
                                        selection: {
                                          sectionId: section.id,
                                          columnId: column.id,
                                          widgetId: widget.id,
                                        },
                                      })
                                    }
                                  >
                                    <div className="mb-1.5 flex items-center justify-between gap-2">
                                      <p className={`text-[10px] ${adminMuted}`}>
                                        Grid · {size.columns} × {size.rows} · {previewBreakpoint.toUpperCase()}
                                      </p>
                                      <span
                                        draggable
                                        className="cursor-grab rounded border border-navy/15 px-1.5 py-0.5 text-[10px] text-navy/50"
                                        onDragStart={(event) => {
                                          event.dataTransfer.setData(
                                            MOVE_MIME,
                                            `${section.id}:${column.id}:${widget.id}`,
                                          );
                                          event.dataTransfer.setData(
                                            "text/plain",
                                            `move:${section.id}:${column.id}:${widget.id}`,
                                          );
                                          event.dataTransfer.effectAllowed = "move";
                                        }}
                                      >
                                        Drag
                                      </span>
                                    </div>
                                    <div
                                      className="grid"
                                      style={{
                                        gridTemplateColumns: `repeat(${size.columns}, minmax(0, 1fr))`,
                                        gridTemplateRows: `repeat(${size.rows}, minmax(72px, 1fr))`,
                                        gap: size.gap,
                                      }}
                                    >
                                      {visibleGridCells(widget.cells, size).map((cell, cellIndex) => {
                                        const cellKey = `${widget.id}:${cell.id}`;
                                        const cellActive = selected?.cellId === cell.id;
                                        return (
                                          <div
                                            key={cell.id}
                                            className={`flex h-full min-h-[72px] min-w-0 flex-col rounded border border-dashed p-1.5 ${
                                              dragOver === cellKey
                                                ? "border-yellow bg-yellow/10"
                                                : cellActive
                                                  ? "border-navy/40 bg-navy/[0.03]"
                                                  : "border-navy/20"
                                            }`}
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setSelected({
                                                sectionId: section.id,
                                                columnId: column.id,
                                                widgetId: widget.id,
                                                cellId: cell.id,
                                              });
                                            }}
                                            onContextMenu={(event) =>
                                              openContextMenu(event, {
                                                kind: "cell",
                                                sectionId: section.id,
                                                columnId: column.id,
                                                gridId: widget.id,
                                                cellId: cell.id,
                                              })
                                            }
                                            onDragOver={(event) => {
                                              event.preventDefault();
                                              event.stopPropagation();
                                              setDragOver(cellKey);
                                            }}
                                            onDragLeave={() => setDragOver("")}
                                            onDrop={(event) =>
                                              dropOnCell(event, section.id, column.id, widget.id, cell.id)
                                            }
                                          >
                                            <p className={`mb-1 text-[9px] ${adminMuted}`}>Cell {cellIndex + 1}</p>
                                            <div className="flex min-h-0 flex-1 flex-col gap-1">
                                              {cell.widgets.map((child) => {
                                                const childAppearance = resolvedAppearance(child.appearance, previewBreakpoint);
                                                return (
                                                <div
                                                  key={child.id}
                                                  draggable
                                                  className={`cursor-grab rounded border bg-white p-1.5 ${
                                                    selected?.childId === child.id
                                                      ? "border-yellow"
                                                      : "border-navy/10"
                                                  }${child.type === "image" && imageFillsParentHeight(childAppearance) ? " template-widget-fill" : ""}`}
                                                  style={widgetAppearanceStyle(childAppearance)}
                                                  onClick={(event) => {
                                                    event.stopPropagation();
                                                    setSelected({
                                                      sectionId: section.id,
                                                      columnId: column.id,
                                                      widgetId: widget.id,
                                                      cellId: cell.id,
                                                      childId: child.id,
                                                    });
                                                  }}
                                                  onContextMenu={(event) =>
                                                    openContextMenu(event, {
                                                      kind: "widget",
                                                      selection: {
                                                        sectionId: section.id,
                                                        columnId: column.id,
                                                        widgetId: widget.id,
                                                        cellId: cell.id,
                                                        childId: child.id,
                                                      },
                                                    })
                                                  }
                                                  onDragStart={(event) => {
                                                    event.dataTransfer.setData(
                                                      "text/plain",
                                                      `cell:${section.id}:${column.id}:${widget.id}:${cell.id}:${child.id}`,
                                                    );
                                                    event.dataTransfer.effectAllowed = "move";
                                                  }}
                                                  onDragOver={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                  }}
                                                  onDrop={(event) => {
                                                    dropOnCell(
                                                      event,
                                                      section.id,
                                                      column.id,
                                                      widget.id,
                                                      cell.id,
                                                      child.id,
                                                    );
                                                  }}
                                                >
                                                  <CanvasWidgetPreview widget={child} previewBreakpoint={previewBreakpoint} />
                                                </div>
                                                );
                                              })}
                                              {cell.widgets.length === 0 ? (
                                                <p className={`py-2 text-center text-[9px] ${adminMuted}`}>Drop</p>
                                              ) : null}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={widget.id}
                                  draggable
                                  className={`cursor-grab rounded border bg-white p-2 ${
                                    active ? "border-yellow" : "border-navy/10"
                                  }${widget.type === "image" && imageFillsParentHeight(appearance) ? " template-widget-fill" : ""}`}
                                  style={widgetAppearanceStyle(appearance)}
                                  onClick={() =>
                                    setSelected({ sectionId: section.id, columnId: column.id, widgetId: widget.id })
                                  }
                                  onContextMenu={(event) =>
                                    openContextMenu(event, {
                                      kind: "widget",
                                      selection: {
                                        sectionId: section.id,
                                        columnId: column.id,
                                        widgetId: widget.id,
                                      },
                                    })
                                  }
                                  onDragStart={(event) => {
                                    event.dataTransfer.setData(
                                      MOVE_MIME,
                                      `${section.id}:${column.id}:${widget.id}`,
                                    );
                                    event.dataTransfer.setData(
                                      "text/plain",
                                      `move:${section.id}:${column.id}:${widget.id}`,
                                    );
                                    event.dataTransfer.effectAllowed = "move";
                                  }}
                                  onDragOver={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                  }}
                                  onDrop={(event) => {
                                    event.stopPropagation();
                                    dropOnColumn(event, section.id, column.id, widget.id);
                                  }}
                                >
                                  <CanvasWidgetPreview widget={widget} previewBreakpoint={previewBreakpoint} />
                                </div>
                              );
                            })}
                            <p className={`py-3 text-center text-[10px] ${adminMuted}`}>Drop widget</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
      {contextMenu ? (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              id: "copy",
              label: "Copy widget",
              disabled: contextMenu.target.kind !== "widget",
              onSelect: () => {
                if (contextMenu.target.kind === "widget") {
                  copyWidget(contextMenu.target.selection);
                }
              },
            },
            {
              id: "paste",
              label: "Paste widget",
              disabled:
                !clipboard.widget || (clipboard.widget.type === "grid" && contextMenu.target.kind === "cell"),
              onSelect: () => pasteWidget(contextMenu.target),
            },
            {
              id: "copy-style",
              label: "Copy style",
              disabled: contextMenu.target.kind !== "widget",
              onSelect: () => {
                if (contextMenu.target.kind === "widget") {
                  copyStyle(contextMenu.target.selection);
                }
              },
            },
            {
              id: "paste-style",
              label: "Paste style",
              disabled: contextMenu.target.kind !== "widget" || !clipboard.appearance,
              onSelect: () => {
                if (contextMenu.target.kind === "widget") {
                  pasteStyle(contextMenu.target.selection);
                }
              },
            },
            {
              id: "delete",
              label: "Delete",
              disabled: contextMenu.target.kind !== "widget",
              danger: true,
              onSelect: () => {
                if (contextMenu.target.kind === "widget") {
                  removeWidget(contextMenu.target.selection);
                }
              },
            },
          ]}
          onClose={() => setContextMenu(null)}
        />
      ) : null}
    </div>
  );
}

function CanvasContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: { id: string; label: string; disabled?: boolean; danger?: boolean; onSelect: () => void }[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("click", onClose);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onClose, true);
    return () => {
      window.removeEventListener("click", onClose);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose]);

  return (
    <div
      role="menu"
      className="fixed z-50 min-w-[168px] rounded-md border border-navy/15 bg-white py-1 shadow-lg"
      style={{ left: x, top: y }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          className={`block w-full px-3 py-1.5 text-left text-[12px] ${
            item.id === "delete" ? "mt-1 border-t border-navy/10" : ""
          } ${
            item.disabled
              ? "text-navy/30"
              : item.danger
                ? "text-red-700 hover:bg-red-50"
                : "text-navy hover:bg-navy/[0.06]"
          }`}
          onClick={() => {
            if (item.disabled) {
              return;
            }
            item.onSelect();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function CanvasWidgetPreview({
  widget,
  previewBreakpoint,
}: {
  widget: TemplateWidget;
  previewBreakpoint: GridBreakpointId;
}) {
  const appearance = resolvedAppearance(widget.appearance, previewBreakpoint);
  switch (widget.type) {
    case "heading":
      return <p className="whitespace-pre-wrap">{widget.text || "Heading"}</p>;
    case "text":
      return (
        <p className="line-clamp-3">
          {widget.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "Text"}
        </p>
      );
    case "image":
      return widget.src ? (
        <img src={widget.src} alt="" className="template-image" style={imageSizeStyle(appearance)} />
      ) : (
        <p className="text-xs text-navy/50">Image</p>
      );
    case "button":
      return (
        <span
          className={`rounded border px-2 py-1 text-xs font-semibold ${
            appearance.buttonStyle === "navy"
              ? "border-transparent bg-navy text-white"
              : appearance.buttonStyle === "outline"
                ? "border-navy bg-transparent text-navy"
                : "border-transparent bg-yellow text-navy"
          }`}
        >
          {widget.label}
        </span>
      );
    case "icon":
      return (
        <span className="flex items-center gap-2 text-xs font-medium">
          <span
            className="shrink-0 [&>svg]:h-full [&>svg]:w-full"
            style={{ width: appearance.iconSize, height: appearance.iconSize }}
          >
            <TemplateIcon name={widget.name} />
          </span>
          {widget.label || widget.name}
        </span>
      );
    case "spacer":
      return <p className="text-[10px] text-navy/45">Spacer {appearance.spacerHeight}px</p>;
    case "spec-list":
      return <p className="text-xs text-navy/70">{widget.rows.length} spec rows</p>;
    case "grid":
      return <p className="text-xs text-navy/70">Grid</p>;
  }
}

function findSelectedWidget(layout: TemplateSection[], selected: Selection) {
  const top = layout
    .find((section) => section.id === selected.sectionId)
    ?.columns.find((column) => column.id === selected.columnId)
    ?.widgets.find((widget) => widget.id === selected.widgetId);
  if (!top) {
    return null;
  }
  if (selected.childId && top.type === "grid") {
    return (
      top.cells.find((cell) => cell.id === selected.cellId)?.widgets.find((child) => child.id === selected.childId) ??
      top
    );
  }
  return top;
}

function nextWidgetId(layout: TemplateSection[], selected: Selection) {
  if (selected.childId && selected.cellId) {
    const widgets =
      layout
        .find((section) => section.id === selected.sectionId)
        ?.columns.find((column) => column.id === selected.columnId)
        ?.widgets.find((widget) => widget.id === selected.widgetId);
    const cellWidgets =
      widgets?.type === "grid"
        ? widgets.cells.find((cell) => cell.id === selected.cellId)?.widgets ?? []
        : [];
    const index = cellWidgets.findIndex((widget) => widget.id === selected.childId);
    return index >= 0 ? cellWidgets[index + 1]?.id : undefined;
  }
  const widgets =
    layout
      .find((section) => section.id === selected.sectionId)
      ?.columns.find((column) => column.id === selected.columnId)
      ?.widgets ?? [];
  const index = widgets.findIndex((widget) => widget.id === selected.widgetId);
  return index >= 0 ? widgets[index + 1]?.id : undefined;
}

function mapAnyWidget(
  layout: TemplateSection[],
  target: Selection,
  mapper: (widget: TemplateWidget) => TemplateWidget,
) {
  return mapTopWidget(layout, target, (widget) => {
    if (target.childId && widget.type === "grid") {
      return {
        ...widget,
        cells: widget.cells.map((cell) =>
          cell.id === target.cellId
            ? {
                ...cell,
                widgets: cell.widgets.map((child) => (child.id === target.childId ? mapper(child) : child)),
              }
            : cell,
        ),
      };
    }
    return mapper(widget);
  });
}

function mapTopWidget(
  layout: TemplateSection[],
  target: Selection,
  mapper: (widget: TemplateWidget) => TemplateWidget,
) {
  return layout.map((section) => {
    if (section.id !== target.sectionId) {
      return section;
    }
    return {
      ...section,
      columns: section.columns.map((column) => {
        if (column.id !== target.columnId) {
          return column;
        }
        return {
          ...column,
          widgets: column.widgets.map((widget) => (widget.id === target.widgetId ? mapper(widget) : widget)),
        };
      }),
    };
  });
}

function insertInCell(
  layout: TemplateSection[],
  sectionId: string,
  columnId: string,
  gridId: string,
  cellId: string,
  widget: TemplateWidget,
  beforeId?: string,
) {
  return mapTopWidget(layout, { sectionId, columnId, widgetId: gridId }, (grid) => {
    if (grid.type !== "grid") {
      return grid;
    }
    return {
      ...grid,
      cells: grid.cells.map((cell) => {
        if (cell.id !== cellId) {
          return cell;
        }
        const widgets = cell.widgets.filter((item) => item.id !== widget.id);
        const index = beforeId ? widgets.findIndex((item) => item.id === beforeId) : -1;
        if (index >= 0) {
          return { ...cell, widgets: [...widgets.slice(0, index), widget, ...widgets.slice(index)] };
        }
        return { ...cell, widgets: [...widgets, widget] };
      }),
    };
  });
}

function extractColumnWidget(layout: TemplateSection[], from: Selection) {
  const widget =
    layout
      .find((section) => section.id === from.sectionId)
      ?.columns.find((column) => column.id === from.columnId)
      ?.widgets.find((item) => item.id === from.widgetId) ?? null;
  const next = layout.map((section) => ({
    ...section,
    columns: section.columns.map((column) => {
      if (section.id !== from.sectionId || column.id !== from.columnId) {
        return column;
      }
      return { ...column, widgets: column.widgets.filter((item) => item.id !== from.widgetId) };
    }),
  }));
  return { layout: next, widget };
}

function extractCellWidget(layout: TemplateSection[], from: Selection) {
  if (!from.cellId || !from.childId) {
    return { layout, widget: null as TemplateWidget | null };
  }
  const grid = layout
    .find((section) => section.id === from.sectionId)
    ?.columns.find((column) => column.id === from.columnId)
    ?.widgets.find((item) => item.id === from.widgetId);
  const widget =
    grid?.type === "grid"
      ? (grid.cells.find((cell) => cell.id === from.cellId)?.widgets.find((item) => item.id === from.childId) ?? null)
      : null;
  const next = mapTopWidget(layout, from, (item) => {
    if (item.type !== "grid") {
      return item;
    }
    return {
      ...item,
      cells: item.cells.map((cell) =>
        cell.id === from.cellId
          ? { ...cell, widgets: cell.widgets.filter((child) => child.id !== from.childId) }
          : cell,
      ),
    };
  });
  return { layout: next, widget };
}

function lastColumnTarget(layout: TemplateSection[]) {
  const section = layout[layout.length - 1];
  const column = section?.columns[section.columns.length - 1];
  if (!section || !column) {
    return null;
  }
  return { sectionId: section.id, columnId: column.id };
}

function insertWidget(
  layout: TemplateSection[],
  sectionId: string,
  columnId: string,
  widget: TemplateWidget,
  beforeId?: string,
) {
  return layout.map((section) => {
    if (section.id !== sectionId) {
      return section;
    }
    return {
      ...section,
      columns: section.columns.map((column) => {
        if (column.id !== columnId) {
          return column;
        }
        const widgets = column.widgets.filter((item) => item.id !== widget.id);
        const index = beforeId ? widgets.findIndex((item) => item.id === beforeId) : -1;
        if (index >= 0) {
          return { ...column, widgets: [...widgets.slice(0, index), widget, ...widgets.slice(index)] };
        }
        return { ...column, widgets: [...widgets, widget] };
      }),
    };
  });
}

function moveWidget(
  layout: TemplateSection[],
  from: Selection,
  sectionId: string,
  columnId: string,
  beforeId?: string,
) {
  let moving: TemplateWidget | null = null;
  const without = layout.map((section) => ({
    ...section,
    columns: section.columns.map((column) => {
      if (section.id === from.sectionId && column.id === from.columnId) {
        moving = column.widgets.find((widget) => widget.id === from.widgetId) ?? null;
        return { ...column, widgets: column.widgets.filter((widget) => widget.id !== from.widgetId) };
      }
      return column;
    }),
  }));
  if (!moving) {
    return layout;
  }
  return insertWidget(without, sectionId, columnId, moving, beforeId === from.widgetId ? undefined : beforeId);
}

function addColumn(section: TemplateSection): TemplateSection {
  if (section.columns.length >= 4) {
    return section;
  }
  const columns: TemplateColumn[] = [...section.columns, { id: crypto.randomUUID(), span: 12, widgets: [] }];
  const spans = equalizeSpans(columns.length);
  return { ...section, columns: columns.map((column, index) => ({ ...column, span: spans[index] ?? 12 })) };
}

function removeColumn(section: TemplateSection, columnId: string): TemplateSection {
  const remaining = section.columns.filter((column) => column.id !== columnId);
  if (remaining.length === 0) {
    return section;
  }
  const spans = equalizeSpans(remaining.length);
  return { ...section, columns: remaining.map((column, index) => ({ ...column, span: spans[index] ?? 12 })) };
}

function PaletteGroup({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-navy/10">
      <button
        type="button"
        className="flex w-full items-center gap-1.5 px-3 py-2.5 text-left text-[13px] font-medium text-navy"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 shrink-0 text-navy/45 transition-transform duration-300 ease-in-out ${
            open ? "" : "-rotate-90"
          }`}
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M2.2 4.2a.75.75 0 0 1 1.06 0L6 6.94l2.74-2.74a.75.75 0 1 1 1.06 1.06L6.53 8.53a.75.75 0 0 1-1.06 0L2.2 5.26a.75.75 0 0 1 0-1.06Z"
          />
        </svg>
        {title}
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden" {...(!open ? { inert: true } : {})}>
          <div className="grid grid-cols-2 gap-2.5 px-3 pb-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

const paletteSvg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-8 w-8",
  "aria-hidden": true as const,
};

function PaletteIcon({ type }: { type: WidgetType }) {
  const icons: Record<WidgetType, ReactNode> = {
    grid: (
      <svg {...paletteSvg}>
        <rect x="4" y="4" width="7" height="7" rx="1" />
        <rect x="13" y="4" width="7" height="7" rx="1" />
        <rect x="4" y="13" width="7" height="7" rx="1" />
        <rect x="13" y="13" width="7" height="7" rx="1" />
      </svg>
    ),
    heading: (
      <svg {...paletteSvg}>
        <path d="M6 5h12M12 5v14" />
      </svg>
    ),
    image: (
      <svg {...paletteSvg}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m21 15-4.5-4.5L8 19" />
      </svg>
    ),
    text: (
      <svg {...paletteSvg}>
        <path d="M4 7h16M4 11h16M4 15h10M4 19h13" />
      </svg>
    ),
    button: (
      <svg {...paletteSvg}>
        <rect x="3" y="7" width="14" height="8" rx="2" />
        <path d="M14 14.5 16 20l1.5-3.5L21 15l-5.5-1.2Z" />
      </svg>
    ),
    spacer: (
      <svg {...paletteSvg}>
        <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" />
      </svg>
    ),
    icon: (
      <svg {...paletteSvg}>
        <circle cx="12" cy="12" r="9" />
        <path d="m12 7 1.2 3.4H17l-2.8 2.1 1.1 3.5L12 14.2 8.7 16l1.1-3.5L7 10.4h3.8L12 7Z" />
      </svg>
    ),
    "spec-list": (
      <svg {...paletteSvg}>
        <path d="M9 7h11M9 12h11M9 17h11" />
        <circle cx="5" cy="7" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="17" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  };
  return icons[type];
}
