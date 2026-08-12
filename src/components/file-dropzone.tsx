"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropzone({
  name = "images",
  accept = "image/*",
  multiple = true,
  maxFiles = 5,
  className,
  onChange,
}: {
  name?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  onChange?: (count: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const syncFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !inputRef.current) return;
      const dt = new DataTransfer();
      Array.from(files)
        .slice(0, maxFiles)
        .forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
      previews.forEach((url) => URL.revokeObjectURL(url));
      const urls = Array.from(dt.files).map((f) => URL.createObjectURL(f));
      setPreviews(urls);
      onChange?.(dt.files.length);
    },
    [maxFiles, onChange, previews],
  );

  const removeAt = (index: number) => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    Array.from(inputRef.current.files ?? []).forEach((f, i) => {
      if (i !== index) dt.items.add(f);
    });
    inputRef.current.files = dt.files;
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onChange?.(dt.files.length);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-colors",
          dragOver ? "border-primary bg-accent/50" : "border-border bg-muted/30 hover:border-primary/50 hover:bg-accent/30",
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          syncFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="mb-2 size-8 text-muted-foreground" />
        <span className="text-sm font-medium">Drop photos here or click to browse</span>
        <span className="mt-1 text-xs text-muted-foreground">Up to {maxFiles} images</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => syncFiles(e.target.files)}
      />
      {previews.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {previews.map((url, i) => (
            <div key={url} className="relative size-20 overflow-hidden rounded-lg border">
              <Image src={url} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                className="absolute right-0.5 top-0.5 rounded-full bg-background/90 p-0.5 shadow-sm"
                onClick={() => removeAt(i)}
                aria-label="Remove image"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
