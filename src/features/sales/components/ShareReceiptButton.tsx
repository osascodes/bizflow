"use client";

type Item = { name: string; quantity: number; price: number };

export default function ShareReceiptButton({
  shop,
  phone,
  receiptNo,
  when,
  items,
  total,
}: {
  shop: string;
  phone?: string | null;
  receiptNo: string;
  when: string;
  items: Item[];
  total: number;
}) {
  const share = async () => {
    const canvas = document.createElement("canvas");
    const width = 720;
    const line = 36;
    const height = 280 + items.length * line;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#18181b";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(shop, 40, 64);
    ctx.fillStyle = "#71717a";
    ctx.font = "22px sans-serif";
    ctx.fillText("Receipt", 40, 100);
    if (phone) ctx.fillText(phone, 40, 132);
    ctx.fillText(receiptNo, 40, phone ? 164 : 132);
    ctx.fillText(when, 40, phone ? 196 : 164);

    let y = phone ? 250 : 218;
    ctx.strokeStyle = "#e4e4e7";
    ctx.beginPath();
    ctx.moveTo(40, y - 20);
    ctx.lineTo(width - 40, y - 20);
    ctx.stroke();

    items.forEach((item) => {
      ctx.fillStyle = "#18181b";
      ctx.font = "22px sans-serif";
      ctx.fillText(`${item.quantity} x ${item.name}`, 40, y);
      const amount = `NGN ${(Number(item.price) * item.quantity).toLocaleString()}`;
      ctx.fillText(amount, width - 40 - ctx.measureText(amount).width, y);
      y += line;
    });

    y += 10;
    ctx.beginPath();
    ctx.moveTo(40, y - 16);
    ctx.lineTo(width - 40, y - 16);
    ctx.stroke();
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("Total", 40, y + 16);
    const totalText = `NGN ${Number(total).toLocaleString()}`;
    ctx.fillText(totalText, width - 40 - ctx.measureText(totalText).width, y + 16);
    ctx.fillStyle = "#71717a";
    ctx.font = "20px sans-serif";
    ctx.fillText("Thank you for shopping with us", 40, y + 64);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], `receipt-${receiptNo}.png`, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `${shop} receipt`,
        text: `Receipt ${receiptNo} from ${shop}`,
      });
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${receiptNo}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={share}
      className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-700 text-sm font-semibold text-white print:hidden"
    >
      Share receipt on WhatsApp
    </button>
  );
}
