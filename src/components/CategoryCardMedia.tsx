"use client";

import { useState } from "react";

/** Hides broken upload URLs instead of showing the browser broken-image icon. */
export function CategoryCardMedia({
  image,
  name,
}: {
  image: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(image) && !failed;

  return (
    <div className="related-product-card__media relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-navy/5 sm:aspect-auto sm:w-[42%] sm:self-stretch">
      {showImage ? (
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full min-h-[140px] items-center justify-center px-4 text-center text-xs text-navy/45 sm:min-h-full">
          {name}
        </div>
      )}
      <span
        className="related-product-card__overlay pointer-events-none absolute inset-0 bg-navy/50"
        aria-hidden="true"
      />
      <span className="related-product-card__cta pointer-events-none absolute inset-0 flex items-center justify-center px-4">
        <span className="rounded bg-button px-5 py-2.5 text-sm font-semibold text-button-text shadow-md">
          Explore
        </span>
      </span>
    </div>
  );
}
