"use client";

import type { IAllProps } from "@tinymce/tinymce-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor as TinyMCEEditor } from "tinymce";

const TinyMceEditor = dynamic<IAllProps>(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center bg-white px-3 text-sm text-navy/50">Loading editor…</div>
    ),
  },
);

type RichTextEditorProps = {
  name?: string;
  defaultValue?: string;
  height?: number;
  compact?: boolean;
  mediaSlug?: string;
  onHtmlChange?: (html: string) => void;
};

async function uploadImage(slug: string, file: File) {
  const data = new FormData();
  data.set("slug", slug);
  data.set("file", file);
  const response = await fetch("/admin/api/media", {
    method: "POST",
    body: data,
  });
  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error || "Upload failed.");
  }
  return payload.url;
}

export function RichTextEditor({
  name,
  defaultValue = "",
  height = 320,
  compact = false,
  mediaSlug = "draft",
  onHtmlChange,
}: RichTextEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const htmlRef = useRef(defaultValue);
  const onHtmlChangeRef = useRef(onHtmlChange);
  const [mode, setMode] = useState<"visual" | "text">("visual");
  const [html, setHtml] = useState(defaultValue);
  const [editorSeed, setEditorSeed] = useState(defaultValue);
  const [editorKey, setEditorKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  htmlRef.current = html;
  onHtmlChangeRef.current = onHtmlChange;

  const commit = (value: string) => {
    setHtml(value);
    htmlRef.current = value;
    if (hiddenRef.current) {
      hiddenRef.current.value = value;
    }
    onHtmlChangeRef.current?.(value);
  };

  const syncFromEditor = () => {
    if (editorRef.current) {
      commit(editorRef.current.getContent());
    }
  };

  useEffect(() => {
    const onSync = () => {
      if (!editorRef.current) {
        return;
      }
      commit(editorRef.current.getContent());
    };
    document.addEventListener("admin:sync-editors", onSync);
    return () => document.removeEventListener("admin:sync-editors", onSync);
  }, []);

  // Keep the hidden field current on native / server-action submits (Publish sits outside the form).
  useEffect(() => {
    if (!name) {
      return;
    }
    const input = hiddenRef.current;
    const form = input?.form;
    if (!form) {
      return;
    }

    const writeHtml = (target?: FormData) => {
      let value = htmlRef.current;
      if (editorRef.current) {
        value = editorRef.current.getContent();
      }
      htmlRef.current = value;
      if (input) {
        input.value = value;
      }
      if (target && name) {
        target.set(name, value);
      }
      setHtml(value);
      onHtmlChangeRef.current?.(value);
    };

    const onSubmit = () => {
      writeHtml();
    };

    const onFormData = (event: FormDataEvent) => {
      writeHtml(event.formData);
    };

    form.addEventListener("submit", onSubmit, true);
    form.addEventListener("formdata", onFormData);
    return () => {
      form.removeEventListener("submit", onSubmit, true);
      form.removeEventListener("formdata", onFormData);
    };
  }, [name]);

  const switchMode = (next: "visual" | "text") => {
    if (mode === "visual") {
      syncFromEditor();
    }
    if (next === "visual" && mode === "text") {
      setEditorSeed(html);
      setEditorKey((key) => key + 1);
    }
    setMode(next);
  };

  const insertImage = async (file: File) => {
    setError("");
    setBusy(true);
    try {
      const url = await uploadImage(mediaSlug, file);
      const markup = `<p><img src="${url}" alt="" /></p>`;
      if (mode === "visual" && editorRef.current) {
        editorRef.current.insertContent(markup);
        commit(editorRef.current.getContent());
        return;
      }
      setHtml((current) => {
        const next = `${current}${markup}`;
        onHtmlChange?.(next);
        return next;
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const init = useMemo<IAllProps["init"]>(
    () => ({
      base_url: "/tinymce",
      suffix: ".min",
      menubar: false,
      branding: false,
      promotion: false,
      height,
      toolbar_mode: "wrap",
      skin: "tinymce-5",
      plugins:
        "advlist autolink lists link image charmap preview searchreplace visualblocks code fullscreen insertdatetime media table wordcount",
      toolbar: compact
        ? [
            "blocks | bold italic | bullist numlist | alignleft aligncenter alignright",
            "link | undo redo | removeformat",
          ]
        : [
            "blocks | bold italic | bullist numlist | blockquote | alignleft aligncenter alignright | link | fullscreen",
            "strikethrough hr forecolor | pastetext removeformat | charmap | outdent indent | undo redo",
          ],
      block_formats:
        "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6",
      language: "en",
      directionality: "ltr",
      content_style:
        "body { direction: ltr; text-align: left; font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #12315a; }",
      convert_urls: false,
      relative_urls: false,
      remove_script_host: true,
      paste_data_images: true,
      automatic_uploads: true,
      images_file_types: "jpeg,jpg,png,gif,webp",
      file_picker_types: "image",
      images_upload_handler: async (blobInfo) => {
        const blob = blobInfo.blob();
        const file = new File([blob], blobInfo.filename(), { type: blob.type || "image/png" });
        return uploadImage(mediaSlug, file);
      },
      file_picker_callback: (callback, _value, meta) => {
        if (meta.filetype !== "image") {
          return;
        }
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/png,image/webp,image/gif";
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) {
            return;
          }
          void uploadImage(mediaSlug, file)
            .then((url) => callback(url, { alt: file.name }))
            .catch((uploadError: Error) => {
              setError(uploadError.message);
            });
        };
        input.click();
      },
    }),
    [height, mediaSlug, compact],
  );

  return (
    <div className={`wp-classic-editor relative z-10 ${compact ? "compact-toolbar" : ""}`}>
      {name ? <input ref={hiddenRef} type="hidden" name={name} value={html} readOnly /> : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        form="tinymce-media-upload"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            void insertImage(file);
          }
        }}
      />
      <div className="flex items-end justify-between gap-2">
        <button
          type="button"
          disabled={busy}
          className={`mb-px cursor-pointer rounded-t border border-[#c3c4c7] border-b-white bg-[#f6f7f7] font-medium text-navy disabled:cursor-not-allowed disabled:opacity-60 ${
            compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-sm"
          }`}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Uploading…" : "Add Media"}
        </button>
        <div className="flex">
          <button
            type="button"
            className={`cursor-pointer rounded-t border border-[#c3c4c7] ${
              compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
            } ${
              mode === "visual"
                ? "relative z-10 -mb-px border-b-white bg-[#f6f7f7] font-semibold text-navy"
                : "bg-[#e0e0e0] text-navy/70"
            }`}
            onClick={() => switchMode("visual")}
          >
            Visual
          </button>
          <button
            type="button"
            className={`cursor-pointer rounded-t border border-l-0 border-[#c3c4c7] ${
              compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
            } ${
              mode === "text"
                ? "relative z-10 -mb-px border-b-white bg-[#f6f7f7] font-semibold text-navy"
                : "bg-[#e0e0e0] text-navy/70"
            }`}
            onClick={() => switchMode("text")}
          >
            Text
          </button>
        </div>
      </div>
      <div className="border border-[#c3c4c7] bg-[#f6f7f7]">
        {mode === "visual" ? (
          <TinyMceEditor
            key={editorKey}
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            onInit={(_event, editor) => {
              editorRef.current = editor;
            }}
            initialValue={editorSeed}
            onEditorChange={(value) => commit(value)}
            init={init}
          />
        ) : (
          <textarea
            value={html}
            onChange={(event) => commit(event.target.value)}
            className="block min-h-[220px] w-full resize-y border-0 bg-white p-3 font-mono text-sm text-navy outline-none"
            style={{ height }}
          />
        )}
      </div>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
