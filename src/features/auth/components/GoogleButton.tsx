"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const signIn = async () => {
    setErrorMessage("");
    setPending(true);
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMessage(error.message);
      setPending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-zinc-700 bg-white text-sm font-semibold text-zinc-950"
      >
        <span className="text-base">G</span>
        {pending ? "Opening Google..." : label}
      </button>
      {errorMessage ? <p className="mt-2 text-xs text-red-400">{errorMessage}</p> : null}
    </div>
  );
}
