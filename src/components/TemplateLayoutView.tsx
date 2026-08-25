import { TemplateIcon } from "@/components/TemplateIcons";
import { RichText } from "@/components/RichText";
import {
  collectGoogleFontsFromLayout,
  googleFontsStylesheetUrl,
} from "@/lib/font-face";
import {
  gridCellHiddenClass,
  gridCssVars,
  imageFillsParentHeight,
  resolvedAppearance,
  widgetCssVars,
  type TemplateSection,
  type TemplateWidget,
} from "@/lib/template-layout";

export function TemplateLayoutView({ layout }: { layout: TemplateSection[] }) {
  const href = googleFontsStylesheetUrl(collectGoogleFontsFromLayout(layout));

  if (layout.length === 0) {
    return null;
  }
  return (
    <div className="template-layout">
      {href ? <link rel="stylesheet" href={href} /> : null}
      {layout.map((section) => (
        <div key={section.id} className="template-layout-section">
          {section.columns.map((column) => (
            <div key={column.id} className={`template-layout-col template-layout-col-${column.span}`}>
              <div className="template-layout-stack">
                {column.widgets.map((widget) => {
                  const appearance = resolvedAppearance(widget.appearance, "lg");
                  return (
                    <div
                      key={widget.id}
                      className={`template-widget${
                        widget.type === "image" && imageFillsParentHeight(appearance) ? " template-widget-fill" : ""
                      }`}
                      style={widgetCssVars(widget.appearance)}
                    >
                      <TemplateWidgetView widget={widget} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function TemplateWidgetView({ widget }: { widget: TemplateWidget }) {
  switch (widget.type) {
    case "heading": {
      const Tag = widget.tag;
      return <Tag className="whitespace-pre-wrap">{widget.text}</Tag>;
    }
    case "text":
      return <RichText html={widget.html} />;
    case "image":
      return widget.src ? <img src={widget.src} alt={widget.alt} className="template-image" /> : null;
    case "button":
      return (
        <a href={widget.href} className="template-widget-button inline-flex rounded px-4 py-2">
          {widget.label}
        </a>
      );
    case "icon":
      return (
        <div className="flex items-center gap-3">
          <span className="template-icon-glyph flex shrink-0 items-center justify-center rounded-full bg-yellow text-navy">
            <TemplateIcon name={widget.name} />
          </span>
          {widget.label ? <p className="font-semibold">{widget.label}</p> : null}
        </div>
      );
    case "spacer":
      return (
        <div className="template-spacer">
          <hr className="template-spacer-line border-navy/15" />
        </div>
      );
    case "spec-list":
      return (
        <dl className="grid gap-3 sm:grid-cols-2">
          {widget.rows.map((row, index) => (
            <div key={`${row.label}-${index}`}>
              <dt className="uppercase tracking-wide text-navy/50">{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "grid":
      return (
        <div className="template-grid" style={gridCssVars(widget.sizes)}>
          {widget.cells.map((cell, index) => {
            const hiddenClass = gridCellHiddenClass(index, widget.sizes);
            return (
              <div
                key={cell.id}
                className={hiddenClass ? `template-grid-cell ${hiddenClass}` : "template-grid-cell"}
              >
                {cell.widgets.map((child) => {
                  const childAppearance = resolvedAppearance(child.appearance, "lg");
                  return (
                    <div
                      key={child.id}
                      className={`template-widget${
                        child.type === "image" && imageFillsParentHeight(childAppearance) ? " template-widget-fill" : ""
                      }`}
                      style={widgetCssVars(child.appearance)}
                    >
                      <TemplateWidgetView widget={child} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
  }
}
