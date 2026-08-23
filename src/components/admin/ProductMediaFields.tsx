"use client";

import { useEffect, useRef, useState } from "react";
import { savePackageAction } from "@/app/admin/actions";
import { adminBox, adminBoxHead, adminMuted } from "@/components/admin/ui";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const PRODUCT_FORM_ID = "product-save";

type PendingGalleryItem = {
  id: string;
  file: File;
  preview: string;
};

export function ProductMediaFields({
  image = "",
  gallery = [],
}: {
  image?: string;
  gallery?: string[];
}) {
  const [featured, setFeatured] = useState(image);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const [galleryUrls, setGalleryUrls] = useState(gallery);
  const [pendingGallery, setPendingGallery] = useState<PendingGalleryItem[]>([]);
  const pendingGalleryRef = useRef(pendingGallery);
  pendingGalleryRef.current = pendingGallery;

  const featuredSrc = featuredPreview || featured;

  useEffect(() => {
    return () => {
      pendingGalleryRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  useEffect(() => {
    const form = document.getElementById(PRODUCT_FORM_ID);
    if (!form) {
      return;
    }

    const handleSubmit = (event: Event) => {
      const pending = pendingGalleryRef.current;
      if (pending.length === 0) {
        return;
      }

      event.preventDefault();
      const formData = new FormData(form as HTMLFormElement);
      formData.delete("galleryFiles");
      pending.forEach((item) => formData.append("galleryFiles", item.file));
      void savePackageAction(formData);
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  const addGalleryFiles = (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setPendingGallery((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const removePendingGallery = (id: string) => {
    setPendingGallery((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
      }
      return current.filter((entry) => entry.id !== id);
    });
  };

  return (
    <>
      <div className={adminBox}>
        <h2 className={adminBoxHead}>Product image</h2>
        <div className="space-y-3 p-3">
          <label className="block cursor-pointer">
            {featuredSrc ? (
              <img src={featuredSrc} alt="" className="aspect-square w-full cursor-pointer rounded object-cover bg-navy/5" />
            ) : (
              <div className="flex aspect-square cursor-pointer items-center justify-center rounded bg-navy/5 text-xs text-navy/40">
                No product image
              </div>
            )}
            {featured ? <input form={PRODUCT_FORM_ID} type="hidden" name="image" value={featured} /> : null}
            <span className={`mt-3 block text-xs ${adminMuted}`}>Set product image</span>
            <input
              form={PRODUCT_FORM_ID}
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
              Remove product image
            </button>
          ) : null}
        </div>
      </div>
      <div className={adminBox}>
        <h2 className={adminBoxHead}>Product gallery</h2>
        <div className="space-y-3 p-3">
          {galleryUrls.length > 0 || pendingGallery.length > 0 ? (
            <ul className="grid grid-cols-3 gap-2">
              {galleryUrls.map((url) => (
                <li key={url} className="relative">
                  <input form={PRODUCT_FORM_ID} type="hidden" name="gallery" value={url} />
                  <img src={url} alt="" className="aspect-square w-full rounded object-cover bg-navy/5" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 cursor-pointer rounded bg-white/90 px-1.5 text-[10px] font-semibold text-red-700"
                    onClick={() => setGalleryUrls((items) => items.filter((item) => item !== url))}
                  >
                    ×
                  </button>
                </li>
              ))}
              {pendingGallery.map((item) => (
                <li key={item.id} className="relative">
                  <img src={item.preview} alt="" className="aspect-square w-full rounded object-cover bg-navy/5" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 cursor-pointer rounded bg-white/90 px-1.5 text-[10px] font-semibold text-red-700"
                    onClick={() => removePendingGallery(item.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
              <li>
                <label
                  htmlFor="product-gallery-files"
                  className="flex aspect-square cursor-pointer items-center justify-center rounded bg-navy/5 text-xs text-navy/40"
                >
                  Add
                </label>
              </li>
            </ul>
          ) : (
            <label
              htmlFor="product-gallery-files"
              className="flex aspect-square cursor-pointer items-center justify-center rounded bg-navy/5 text-xs text-navy/40"
            >
              No gallery images
            </label>
          )}
          <label htmlFor="product-gallery-files" className={`block cursor-pointer text-xs ${adminMuted}`}>
            Add gallery images
            <input
              id="product-gallery-files"
              type="file"
              accept={ACCEPT}
              multiple
              className="mt-1 block w-full cursor-pointer text-xs file:cursor-pointer"
              onChange={(event) => {
                addGalleryFiles([...(event.target.files ?? [])]);
                event.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </>
  );
}
