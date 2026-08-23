import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cloneWidget,
  createGridCells,
  createWidget,
  defaultAppearance,
  defaultTypography,
  emptySpacing,
  ensureGridCells,
  gridCellCount,
  gridCellHiddenClass,
  migrateGridSizes,
  normalizeLayout,
  resolvedAppearance,
  resolvedBreakpointValue,
  resolvedGridSize,
  visibleGridCells,
  widgetAppearanceStyle,
  widgetCssVars,
} from "./template-layout.ts";

test("cloneWidget copies content and assigns new ids", () => {
  const original = createWidget("heading");
  if (original.type !== "heading") {
    throw new Error("expected heading");
  }
  original.text = "Cloned title";
  const copy = cloneWidget(original);
  assert.equal(copy.type, "heading");
  assert.notEqual(copy.id, original.id);
  if (copy.type === "heading") {
    assert.equal(copy.text, "Cloned title");
  }
});

test("cloneWidget regenerates nested grid cell and child ids", () => {
  const grid = createWidget("grid");
  if (grid.type !== "grid") {
    throw new Error("expected grid");
  }
  const child = createWidget("button");
  grid.cells[0] = { ...grid.cells[0], widgets: [child] };
  const copy = cloneWidget(grid);
  assert.equal(copy.type, "grid");
  assert.notEqual(copy.id, grid.id);
  if (copy.type === "grid") {
    assert.notEqual(copy.cells[0]?.id, grid.cells[0]?.id);
    assert.equal(copy.cells[0]?.widgets[0]?.type, "button");
    assert.notEqual(copy.cells[0]?.widgets[0]?.id, child.id);
  }
});

test("ensureGridCells grows when more cells are needed", () => {
  const cells = createGridCells(4);
  const next = ensureGridCells(cells, 6);
  assert.equal(next.length, 6);
  assert.equal(next[0].id, cells[0].id);
});

test("ensureGridCells shrinks when rows or columns decrease", () => {
  const cells = createGridCells(6);
  const next = ensureGridCells(cells, 4);
  assert.equal(next.length, 4);
  assert.deepEqual(
    next.map((cell) => cell.id),
    cells.slice(0, 4).map((cell) => cell.id),
  );
});

test("visibleGridCells only returns cells for the current columns × rows", () => {
  const cells = createGridCells(12);
  const visible = visibleGridCells(cells, { columns: 2, rows: 2, gap: 16 });
  assert.equal(visible.length, 4);
});

test("LG-only snapshot applies at every breakpoint", () => {
  const snapshots = { lg: 24 };
  for (const id of ["base", "sm", "md", "lg", "xl", "2xl"] as const) {
    assert.equal(resolvedBreakpointValue(snapshots, id, 0), 24);
  }
});

test("SM override applies to SM and XS only", () => {
  const snapshots = { lg: 24, sm: 16 };
  assert.equal(resolvedBreakpointValue(snapshots, "lg", 0), 24);
  assert.equal(resolvedBreakpointValue(snapshots, "md", 0), 24);
  assert.equal(resolvedBreakpointValue(snapshots, "sm", 0), 16);
  assert.equal(resolvedBreakpointValue(snapshots, "base", 0), 16);
  assert.equal(resolvedBreakpointValue(snapshots, "xl", 0), 24);
});

test("XL override applies to XL and 2XL only", () => {
  const snapshots = { lg: 24, xl: 20 };
  assert.equal(resolvedBreakpointValue(snapshots, "lg", 0), 24);
  assert.equal(resolvedBreakpointValue(snapshots, "xl", 0), 20);
  assert.equal(resolvedBreakpointValue(snapshots, "2xl", 0), 20);
  assert.equal(resolvedBreakpointValue(snapshots, "md", 0), 24);
});

test("resolvedGridSize uses LG as default for every screen", () => {
  const sizes = { lg: { columns: 4, rows: 4, gap: 16 } };
  assert.deepEqual(resolvedGridSize(sizes, "base").columns, 4);
  assert.deepEqual(resolvedGridSize(sizes, "xl").columns, 4);
});

test("migrateGridSizes keeps base 2x2 below LG and lg 4x4 at LG and up", () => {
  const migrated = migrateGridSizes({
    base: { columns: 2, rows: 2, gap: 16 },
    lg: { columns: 4, rows: 4, gap: 16 },
  });
  assert.equal(resolvedGridSize(migrated, "base").columns, 2);
  assert.equal(resolvedGridSize(migrated, "md").columns, 2);
  assert.equal(resolvedGridSize(migrated, "lg").columns, 4);
  assert.equal(resolvedGridSize(migrated, "2xl").columns, 4);
});

test("migrateGridSizes is idempotent", () => {
  const migrated = migrateGridSizes({
    base: { columns: 2, rows: 2, gap: 16 },
    lg: { columns: 4, rows: 4, gap: 16 },
  });

  assert.deepEqual(migrateGridSizes(migrated), migrated);
});

test("migrateGridSizes preserves an existing desktop-down map", () => {
  const sizes = {
    lg: { columns: 4, rows: 4, gap: 16 },
    sm: { columns: 3, rows: 3, gap: 16 },
  };

  assert.deepEqual(migrateGridSizes(sizes), sizes);
});

test("migrateGridSizes keeps desktop-down { lg, md, sm, base } without smearing base up", () => {
  const sizes = {
    lg: { columns: 4, rows: 4, gap: 16 },
    md: { columns: 4, rows: 4, gap: 16 },
    sm: { columns: 4, rows: 4, gap: 16 },
    base: { columns: 2, rows: 2, gap: 16 },
  };

  assert.deepEqual(migrateGridSizes(sizes), sizes);
  assert.equal(resolvedGridSize(sizes, "md").columns, 4);
  assert.equal(resolvedGridSize(sizes, "base").columns, 2);
});

test("gridCellHiddenClass hides index 4 at 2x2 base and shows it at 4x4 lg", () => {
  const sizes = {
    lg: { columns: 4, rows: 4, gap: 16 },
    base: { columns: 2, rows: 2, gap: 16 },
  };
  const hidden = gridCellHiddenClass(4, sizes);

  assert.match(hidden, /max-\[639px\]:hidden/);
  assert.doesNotMatch(hidden, /min-\[1024px\]:max-\[1279px\]:hidden/);
});

test("normalizeWidget copies legacy frame into appearance.lg", () => {
  const widget = normalizeLayout([
    {
      id: "s",
      columns: [
        {
          id: "c",
          span: 12,
          widgets: [
            {
              id: "h",
              type: "heading",
              tag: "h2",
              text: "Hi",
              frame: { align: "center", color: "#111111", background: "", margin: emptySpacing(), padding: emptySpacing() },
            },
          ],
        },
      ],
    },
  ])[0].columns[0].widgets[0];
  assert.equal(widget.appearance.lg?.align, "center");
  assert.equal(widget.appearance.lg?.color, "#111111");
  assert.equal(resolvedAppearance(widget.appearance, "base").align, "center");
});

test("widgetCssVars exposes resolved widget appearance at each breakpoint", () => {
  const smAppearance = {
    ...defaultAppearance(),
    typography: {
      ...defaultTypography(),
      fontSize: { value: 16, unit: "px" as const },
    },
  };
  const variables = widgetCssVars({
    lg: {
      ...defaultAppearance(),
      typography: {
        ...defaultTypography(),
        fontSize: { value: 20, unit: "px" },
      },
    },
    sm: smAppearance,
  });

  assert.equal(variables["--tw-align"], "left");
  assert.equal(variables["--tw-fs-sm"], "16px");
});

test("widget font styles resolve site ids and Google font names to CSS families", () => {
  const appearance = {
    ...defaultAppearance(),
    typography: {
      ...defaultTypography(),
      fontFamily: "Roboto",
    },
  };
  const variables = widgetCssVars({
    lg: {
      ...appearance,
      typography: {
        ...appearance.typography,
        fontFamily: "sans",
      },
    },
  });

  assert.equal(variables["--tw-ff"], "var(--font-sans), Helvetica, Arial, sans-serif");
  assert.equal(widgetAppearanceStyle(appearance).fontFamily, '"Roboto", sans-serif');
  assert.equal(widgetAppearanceStyle(defaultAppearance()).fontFamily, "inherit");
});
