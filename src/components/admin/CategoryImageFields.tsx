"use client";

import { useEffect, useState } from "react";
import { adminBox, adminBoxHead, adminMuted } from "@/components/admin/ui";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";
const FORM_ID = "category-save";

export function CategoryImageFields({ image = "" }: { image?: string }) {
  const [featured, setFeatured] = useState(image);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const [broken, setBroken] = useState(false);
  const [pendingFile, setPendingFile] = useState(false);
  const featuredSrc = featuredPreview || featured;

  useEffect(() => {
    setFeatured(image);
    setFeaturedPreview("");
    setBroken(false);
    setPendingFile(false);
  }, [image]);

  return (
    <div className={adminBox}>
      <h2 className={adminBoxHead}>Home card image</h2>
      <div className="space-y-3 p-3">
        {/* Keep last known path unless a new file is chosen or user removes it. */}
        <input form={FORM_ID} type="hidden" name="image" value={pendingFile ? "" : featured} />
        <label className="block cursor-pointer">
          {featuredSrc && !broken ? (
            <img
              src={featuredSrc}
              alt=""
              className="aspect-square w-full rounded object-cover bg-navy/5"
              onError={() => {
                if (!featuredPreview) {
                  setBroken(true);
                }
              }}
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded bg-navy/5 px-3 text-center text-xs text-navy/40">
              {broken
                ? "Saved image file is missing on the server. Choose a new image and click Update."
                : "No home card image"}
            </div>
          )}
          {broken && !pendingFile ? (
            <p className="mt-2 text-xs font-medium text-red-700">
              This category still points at a deleted file. Re-upload the image, then Update.
            </p>
          ) : null}
          <span className={`mt-3 block text-xs ${adminMuted}`}>Shown on Shop by industry cards on the home page.</span>
          <input
            form={FORM_ID}
            type="file"
            name="imageFile"
            accept={ACCEPT}
            required={broken && !pendingFile}
            className="mt-1 block w-full cursor-pointer text-xs file:cursor-pointer"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setPendingFile(true);
                setBroken(false);
                setFeaturedPreview(URL.createObjectURL(file));
              } else {
                setPendingFile(false);
                setFeaturedPreview("");
              }
            }}
          />
        </label>
        {featured || featuredPreview ? (
          <button
            type="button"
            className="text-sm text-red-700 hover:underline"
            onClick={() => {
              setFeatured("");
              setFeaturedPreview("");
              setBroken(false);
              setPendingFile(false);
            }}
          >
            Remove image
          </button>
        ) : null}
      </div>
    </div>
  );
}
