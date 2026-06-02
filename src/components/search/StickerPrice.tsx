import React, { useState, useEffect } from 'react';

interface StickerPriceProps {
  id?: number | string;
  estCost?: string;
}

export default function StickerPrice({ id, estCost }: StickerPriceProps) {
  const [stickerPrice, setStickerPrice] = useState<string>("Loading...");

  useEffect(() => {
    if (!id) return;
    const fetchStickerPrice = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/tuition/${id}`);
        if (res.ok) {
          const data = await res.json();
          const tuition = data.tuition?.tuition_in_state ?? 12714;
          const bookSupply = data.tuition?.booksupply ?? 1200;
          const roomBoard = data.housing?.roomboard_oncampus ?? 7348;
          const expenses = data.expenses?.otherexpense_oncampus ?? 2832;
          const total = tuition + bookSupply + roomBoard + expenses;
          setStickerPrice(`$${Math.round(total).toLocaleString()}`);
        } else {
          setStickerPrice(estCost || "N/A");
        }
      } catch (err) {
        setStickerPrice(estCost || "N/A");
      }
    };
    fetchStickerPrice();
  }, [id, estCost]);

  return (
    <div className="flex flex-col bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 min-w-[90px]">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Sticker Price</span>
      <span className="text-sm font-extrabold text-gray-900">
        {stickerPrice}
      </span>
    </div>
  );
}
