"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { ManagedResource } from "@/lib/workspace";
export function ResourceDownload({
  resource,
  iconOnly = false,
}: {
  resource: ManagedResource;
  iconOnly?: boolean;
}) {
  const [url, setURL] = useState(resource.url ?? "");
  useEffect(() => {
    if (resource.file) {
      const objectURL = URL.createObjectURL(resource.file);
      setURL(objectURL);
      return () => URL.revokeObjectURL(objectURL);
    }
    setURL(resource.url ?? "");
  }, [resource.file, resource.url]);
  return (
    <a
      className={iconOnly ? "" : "button"}
      href={url || undefined}
      download={resource.filename}
      title={`Download ${resource.title}`}
      aria-label={iconOnly ? `Download ${resource.title}` : undefined}
    >
      {iconOnly ? <Download size={16} /> : "Download PDF"}
    </a>
  );
}
