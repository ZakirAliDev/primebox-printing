export type RelatedCarouselItem = {
  slug: string;
};

function extendedTrackItems<T extends RelatedCarouselItem>(items: T[], visible: number) {
  const count = items.length;
  if (count === 0) {
    return [];
  }
  if (count === 1) {
    const total = Math.max(visible + 2, 3);
    return Array.from({ length: total }, () => items[0]);
  }
  if (count <= visible) {
    const minLength = visible + count + visible;
    const repeats = Math.ceil(minLength / count);
    return Array.from({ length: repeats }, () => items).flat();
  }
  return items;
}

export function relatedLoopItems<T extends RelatedCarouselItem>(items: T[], visible: number) {
  const core = extendedTrackItems(items, visible);
  const count = core.length;
  if (count === 0) {
    return [];
  }

  const cloneCount = Math.min(visible, count);
  return [...core.slice(-cloneCount), ...core, ...core.slice(0, cloneCount)];
}

export function relatedLoopBounds(items: RelatedCarouselItem[], visible: number) {
  const core = extendedTrackItems(items, visible);
  const count = core.length;
  if (count === 0) {
    return { start: 0, min: 0, max: 0 };
  }
  if (count === 1 && items.length === 1) {
    const total = Math.max(visible + 2, 3);
    return { start: 1, min: 1, max: total - 2 };
  }

  const cloneCount = Math.min(visible, count);
  return { start: cloneCount, min: cloneCount, max: cloneCount + count - 1 };
}

export function relatedSnapLoopIndex(index: number, items: RelatedCarouselItem[], visible: number) {
  const { min, max } = relatedLoopBounds(items, visible);
  if (items.length === 0) {
    return 0;
  }
  if (items.length === 1) {
    const total = Math.max(visible + 2, 3);
    if (index >= total - 1) {
      return 1;
    }
    if (index <= 0) {
      return total - 2;
    }
    return index;
  }
  if (index > max) {
    return min;
  }
  if (index < min) {
    return max;
  }
  return index;
}
