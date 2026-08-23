export const VIEWPORT_INSET_PX = 20;
export const FOOTER_GAP_PX = 20;

export function footerBottomOffset() {
  const footer = document.querySelector("footer");
  if (!footer) {
    return VIEWPORT_INSET_PX;
  }

  const footerTop = footer.getBoundingClientRect().top;
  if (footerTop >= window.innerHeight) {
    return VIEWPORT_INSET_PX;
  }

  return window.innerHeight - footerTop + FOOTER_GAP_PX;
}
