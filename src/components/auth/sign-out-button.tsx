"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { messages } from "@/i18n";

export function SignOutButton() {
  return (
    <button
      type="button"
      className="sign-out-button"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut size={16} aria-hidden="true" />
      {messages.auth.signOut}
    </button>
  );
}
