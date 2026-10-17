"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Link2, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isVideoUrl } from "@/lib/admin-utils";

interface MediaManagerProps {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  max?: number;
}

/**
 * Uploads media to Supabase Storage (or the local `public/uploads` folder in
 * fallback mode) and/or accepts a pasted URL. Used for both the single
 * thumbnail and the multi-image gallery.
 */
export function MediaManager({
  label,
  hint,
  value,
  onChange,
  multiple = false,
  max = 12,
}: MediaManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of Array.from(files)) formData.append("files", file);

    setUploading(true);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: { url: string }[];
        error?: string;
      };

      if (!response.ok || !payload.data) {
        toast.error(payload.error ?? "Upload failed.");
        return;
      }

      const urls = payload.data.map((entry) => entry.url);
      onChange(multiple ? [...value, ...urls].slice(0, max) : urls.slice(0, 1));
      toast.success(`${urls.length} file${urls.length === 1 ? "" : "s"} uploaded`);
    } catch {
      toast.error("Upload failed — check your connection.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/i.test(url) && !url.startsWith("/")) {
      toast.error("Enter a full URL (https://…) or a site-relative path (/…).");
      return;
    }

    onChange(multiple ? [...value, url].slice(0, max) : [url]);
    setManualUrl("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="font-mono text-[0.65rem] text-fg-subtle">
          {value.length}/{multiple ? max : 1}
        </span>
      </div>

      {hint && <p className="text-xs text-fg-subtle">{hint}</p>}

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative overflow-hidden rounded-lg border border-edge bg-void"
            >
              <div className="relative aspect-16/10">
                {isVideoUrl(url) ? (
                  <video src={url} muted playsInline className="size-full object-cover" />
                ) : (
                  <Image src={url} alt="" fill sizes="200px" className="object-cover" />
                )}
              </div>

              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Remove media"
                className="absolute right-1.5 top-1.5 rounded-md border border-edge bg-void/85 p-1.5 text-fg-subtle opacity-0 backdrop-blur transition-all hover:text-danger group-hover:opacity-100"
              >
                <Trash2 className="size-3" />
              </button>

              <p className="truncate border-t border-edge bg-surface/80 px-2 py-1 font-mono text-[0.62rem] text-fg-subtle">
                {url}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif,video/mp4,video/webm,video/quicktime"
          multiple={multiple}
          className="hidden"
          onChange={(event) => void upload(event.target.files)}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || (!multiple && value.length >= 1)}
          className="sm:w-auto"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? "Uploading…" : multiple ? "Upload files" : "Upload thumbnail"}
        </Button>

        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-fg-subtle" />
          <Input
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addManualUrl();
              }
            }}
            placeholder="…or paste an image / video URL"
            aria-label={`Add ${label} by URL`}
            className="pl-9"
          />
        </div>

        <Button type="button" variant="subtle" onClick={addManualUrl} className="sm:w-auto">
          <Plus className="size-4" />
          Add URL
        </Button>
      </div>
    </div>
  );
}
