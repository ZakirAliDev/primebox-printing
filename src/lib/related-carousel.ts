export type RelatedCarouselItem = {
  slug: string;
};

/** Unique items only — never pad the list by repeating products. */
export function uniqueRelatedItems<T extends RelatedCarouselItem>(items: T[]): T[] {
  const seen = new Set<string>();
  const next: T[] = [];
  for (const item of items) {
    if (!item.slug || seen.has(item.slug)) {
      continue;
    }
    seen.add(item.slug);
    next.push(item);
  }
  return next;
}

export function relatedLoopItems<T extends RelatedCarouselItem>(items: T[], visible: number) {
  const core = uniqueRelatedItems(items);
  const count = core.length;
  if (count === 0) {
    return [];
  }
  // Not enough unique products to fill a looping track — show each once.
  if (count <= visible) {
    return core;
  }

  const cloneCount = Math.min(visible, count);
  return [...core.slice(-cloneCount), ...core, ...core.slice(0, cloneCount)];
}

export function relatedLoopBounds(items: RelatedCarouselItem[], visible: number) {
  const core = uniqueRelatedItems(items);
  const count = core.length;
  if (count === 0) {
    return { start: 0, min: 0, max: 0 };
  }
  if (count <= visible) {
    return { start: 0, min: 0, max: 0 };
  }

  const cloneCount = Math.min(visible, count);
  return { start: cloneCount, min: cloneCount, max: cloneCount + count - 1 };
}

export function relatedSnapLoopIndex(index: number, items: RelatedCarouselItem[], visible: number) {
  const core = uniqueRelatedItems(items);
  const { min, max } = relatedLoopBounds(core, visible);
  if (core.length === 0) {
    return 0;
  }
  if (core.length <= visible) {
    return 0;
  }
  if (index > max) {
    return min;
  }
  if (index < min) {
    return max;
  }
  return index;
}
