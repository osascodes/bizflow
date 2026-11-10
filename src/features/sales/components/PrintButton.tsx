"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#00E5E5] text-sm font-semibold text-zinc-950 print:hidden"
    >
      Print or save receipt
    </button>
  );
}
