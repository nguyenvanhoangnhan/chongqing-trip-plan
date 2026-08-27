"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

import { messages } from "@/i18n";

type LocationMapActionProps = {
  mapQuery: string;
};

export function LocationMapAction({ mapQuery }: LocationMapActionProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (status === "idle") return;

    const resetTimer = window.setTimeout(() => setStatus("idle"), 2_500);
    return () => window.clearTimeout(resetTimer);
  }, [status]);

  const copyMapQuery = async () => {
    try {
      await navigator.clipboard.writeText(mapQuery);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  const label =
    status === "copied"
      ? messages.locations.copied
      : status === "failed"
        ? messages.locations.copyFailed
        : messages.locations.map;

  return (
    <button
      type="button"
      className="location-card__query"
      data-status={status}
      onClick={() => void copyMapQuery()}
    >
      <MapPin size={15} aria-hidden="true" />
      <span aria-live="polite" aria-atomic="true">
        {label}
        <code aria-hidden="true">{mapQuery}</code>
      </span>
    </button>
  );
}
