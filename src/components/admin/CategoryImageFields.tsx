"use client";

import { useState } from "react";
import { adminBox, adminBoxHead, adminField, adminMuted } from "@/components/admin/ui";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";
const FORM_ID = "category-save";

export function CategoryImageFields({ image = "" }: { image?: string }) {
  const [featured, setFeatured] = useState(image);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const featuredSrc = featuredPreview || featured;

  return (
    <div className={adminBox}>
      <h2 className={adminBoxHead}>Category image</h2>
      <div className="space-y-3 p-3">
        <label className="block cursor-pointer">
          {featuredSrc ? (
            <img src={featuredSrc} alt="" className="aspect-square w-full rounded object-cover bg-navy/5" />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded bg-navy/5 text-xs text-navy/40">
              No category image
            </div>
          )}
          {featured ? <input form={FORM_ID} type="hidden" name="image" value={featured} /> : null}
          <span className={`mt-3 block text-xs ${adminMuted}`}>Set category image</span>
          <input
            form={FORM_ID}
            type="file"
            name="imageFile"
            accept={ACCEPT}
            className="mt-1 block w-full cursor-pointer text-xs file:cursor-pointer"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFeaturedPreview(file ? URL.createObjectURL(file) : "");
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
            }}
          >
            Remove category image
          </button>
        ) : null}
      </div>
    </div>
  );
}
