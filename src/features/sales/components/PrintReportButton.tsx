"use client";

export default function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex h-12 w-full items-center justify-center rounded-xl bg-[#635BFF] text-sm font-semibold text-white print:hidden"
    >
      Print report
    </button>
  );
}
