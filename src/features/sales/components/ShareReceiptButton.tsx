"use client";

export default function ShareReceiptButton({ message }: { message: string }) {
  const share = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      type="button"
      onClick={share}
      className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-700 text-sm font-semibold text-white print:hidden"
    >
      Share on WhatsApp
    </button>
  );
}
