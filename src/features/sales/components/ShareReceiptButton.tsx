"use client";

import { toPng } from "html-to-image";

export default function ShareReceiptButton({ receiptNo }: { receiptNo: string }) {
  const share = async () => {
    const receipt = document.getElementById("receipt-card");
    if (!receipt) return;

    const dataUrl = await toPng(receipt, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `receipt-${receiptNo}.png`, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `Receipt ${receiptNo}` });
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `receipt-${receiptNo}.png`;
    link.click();
  };

  return (
    <button
      type="button"
      onClick={share}
      className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-300 text-sm font-semibold text-zinc-950 print:hidden"
    >
      Share receipt on WhatsApp
    </button>
  );
}
