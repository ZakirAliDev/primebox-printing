export const siteFormStandalone =
  "@container/site-form grid gap-5 rounded-lg border border-border/10 bg-surface p-6 shadow-sm";

export const siteFormEmbedded = "@container/site-form grid gap-5";

export const siteFormTitle = "text-lg font-semibold text-navy";

export const siteFieldLabel = "grid min-w-0 gap-1.5 text-sm font-medium text-navy";

export const SITE_SELECT_PLACEHOLDER = "Choose one";

const siteFieldBase =
  "w-full rounded-md border border-border/20 bg-white text-sm outline-none transition-colors focus:border-navy/40 focus:ring-2 focus:ring-navy/10";

export const siteField = `${siteFieldBase} h-[38px] px-3 text-navy placeholder:text-muted/70`;

export const siteTextarea = `${siteFieldBase} px-3 py-2.5 text-navy placeholder:text-muted/70`;

export const siteSelect = `${siteFieldBase} site-select h-[38px] appearance-none px-3 pr-10`;

export const siteFieldRowPair = "grid min-w-0 grid-cols-2 gap-3";

export const siteFieldRowQuad =
  "grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.75fr)] gap-3";

export const siteFieldRow = "grid gap-4 grid-cols-1 @2xl:grid-cols-2";

export const siteFieldRowEmbedded = "grid gap-4 grid-cols-1";

export const siteSubmit =
  "justify-self-start rounded bg-button px-6 py-2.5 text-sm font-semibold text-button-text transition-colors hover:bg-button/90";
