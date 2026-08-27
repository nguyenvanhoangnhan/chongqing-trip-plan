"use client";

import { Copy, Check, X } from "lucide-react";
import { useEffect, useState } from "react";

type PlaceChineseNameProps = {
  name: string;
};

/**
 * The Chinese name is what a traveler holds up to a taxi driver, so it stays on
 * screen instead of hiding inside the Baidu link, which needs a connection to
 * open.
 */
export function PlaceChineseName({ name }: PlaceChineseNameProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (status === "idle") return;

    const resetTimer = window.setTimeout(() => setStatus("idle"), 2_500);
    return () => window.clearTimeout(resetTimer);
  }, [status]);

  const copyName = async () => {
    try {
      await navigator.clipboard.writeText(name);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  const hint =
    status === "copied"
      ? "Đã sao chép"
      : status === "failed"
        ? "Không sao chép được"
        : "Sao chép";

  return (
    <button
      type="button"
      className="itinerary-stop__zh"
      data-status={status}
      onClick={() => void copyName()}
    >
      <span lang="zh-CN">{name}</span>
      <span className="itinerary-stop__zh-hint" aria-live="polite">
        {status === "copied" ? (
          <Check size={13} aria-hidden="true" />
        ) : status === "failed" ? (
          <X size={13} aria-hidden="true" />
        ) : (
          <Copy size={13} aria-hidden="true" />
        )}
        {hint}
      </span>
    </button>
  );
}
