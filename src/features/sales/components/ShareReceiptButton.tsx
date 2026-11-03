"use client";

type Item = { name: string; quantity: number; price: number };

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export default function ShareReceiptButton({
  shop,
  phone,
  logoUrl,
  receiptNo,
  when,
  items,
  total,
  discount = 0,
}: {
  shop: string;
  phone?: string | null;
  logoUrl?: string | null;
  receiptNo: string;
  when: string;
  items: Item[];
  total: number;
  discount?: number;
}) {
  const share = async () => {
    const width = 800;
    const height = 520 + items.length * 78;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const logo = logoUrl ? await loadImage(logoUrl) : null;
    if (logo) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(48, 48, 88, 88, 18);
      ctx.clip();
      ctx.drawImage(logo, 48, 48, 88, 88);
      ctx.restore();
    } else {
      ctx.fillStyle = "#f4f4f5";
      ctx.beginPath();
      ctx.roundRect(48, 48, 88, 88, 18);
      ctx.fill();
      ctx.fillStyle = "#18181b";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(shop.trim().charAt(0).toUpperCase(), 80, 104);
    }

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "18px sans-serif";
    ctx.fillText("RECEIPT", 156, 78);
    ctx.fillStyle = "#18181b";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(shop, 156, 118);

    let y = 180;
    if (phone) {
      ctx.fillStyle = "#71717a";
      ctx.font = "24px sans-serif";
      ctx.fillText(phone, 48, y);
      y += 40;
    }
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "22px sans-serif";
    ctx.fillText(receiptNo, 48, y);
    const dateWidth = ctx.measureText(when).width;
    ctx.fillText(when, width - 48 - dateWidth, y);
    y += 36;

    ctx.strokeStyle = "#e4e4e7";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(width - 48, y);
    ctx.stroke();
    y += 48;

    items.forEach((item) => {
      const amount = `₦${(Number(item.price) * item.quantity).toLocaleString()}`;
      ctx.fillStyle = "#18181b";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(item.name, 48, y);
      ctx.fillText(amount, width - 48 - ctx.measureText(amount).width, y);
      ctx.fillStyle = "#71717a";
      ctx.font = "22px sans-serif";
      ctx.fillText(`${item.quantity} x ₦${Number(item.price).toLocaleString()}`, 48, y + 32);
      y += 78;
    });

    if (discount > 0) {
      ctx.fillStyle = "#71717a";
      ctx.font = "24px sans-serif";
      ctx.fillText(`Discount ₦${discount.toLocaleString()}`, 48, y);
      y += 40;
    }

    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(width - 48, y);
    ctx.stroke();
    ctx.setLineDash([]);
    y += 52;
    ctx.fillStyle = "#18181b";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("Total", 48, y);
    const totalText = `₦${Number(total).toLocaleString()}`;
    ctx.fillText(totalText, width - 48 - ctx.measureText(totalText).width, y);

    ctx.fillStyle = "#71717a";
    ctx.font = "22px sans-serif";
    ctx.fillText("Thank you for shopping with us", (width - ctx.measureText("Thank you for shopping with us").width) / 2, height - 48);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], `receipt-${receiptNo}.png`, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `${shop} receipt` });
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
