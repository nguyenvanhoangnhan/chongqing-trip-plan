"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Replaces the browser's bare "This page couldn't load" with a message the
 * travelers can act on. The digest is what shows up in the Vercel logs.
 */
export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error("Page failed to render", error);
  }, [error]);

  return (
    <main className="app-error" id="main-content">
      <span className="trip-kicker">LỖI · 出错了</span>
      <h1>Trang chưa tải được</h1>
      <p>
        Máy chủ gặp lỗi khi dựng trang. Thử tải lại; nếu vẫn lỗi, gửi mã bên
        dưới cho người dựng app.
      </p>
      <button type="button" onClick={() => reset()}>
        <RotateCcw size={16} aria-hidden="true" /> Tải lại
      </button>
      {error.digest && <code>Mã lỗi: {error.digest}</code>}
    </main>
  );
}
