"use client";

import React, { useState, useEffect } from "react";
import { X, Printer, QrCode as QrIcon, CheckCircle2, ArrowRight } from "lucide-react";
import { OrderData } from "./OrderCard";
import QRCode from "react-qr-code";

interface TagPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
}

export function TagPrintModal({ isOpen, onClose, order }: TagPrintModalProps) {
  const [selectedGiftIndex, setSelectedGiftIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const totalGifts = order.gifts.length;
  const currentGift = order.gifts[selectedGiftIndex] || order.gifts[0];

  const handlePrint = () => {
    window.print();
  };

  const pickupDate = new Date(order.agreedPickupTime);
  const formattedTime = pickupDate.toLocaleTimeString("lv-LV", { hour: "2-digit", minute: "2-digit" });
  const formattedDate = `${pickupDate.getDate()}.${pickupDate.getMonth() + 1}. plkst. ${formattedTime}`;

  // QR koda saite uz pilno pasūtījuma līgumu un protokolu
  const contractUrl = typeof window !== "undefined"
    ? `${window.location.origin}/contract/${order.id}`
    : `http://localhost:3000/contract/${order.id}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl border border-[#E5DFD5] max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:p-0 print:max-w-none print:w-auto">
        
        {/* Aizvēršanas poga (paslēpta drukāšanā) */}
        <button
          onClick={onClose}
          data-testid="tag-modal-close-icon"
          className="absolute right-4 top-4 text-[#A39D98] hover:text-[#2A2624] p-1.5 rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Galvene (paslēpta drukāšanā) */}
        <div className="flex items-center gap-3 shrink-0 print:hidden">
          <div className="w-10 h-10 rounded-2xl bg-[#F7EBE7] text-[#B85D3E] flex items-center justify-center border border-[#B85D3E]/20 shrink-0">
            <QrIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-[#2A2624] flex items-center gap-2">
              <span>Dāvanas QR Birka un Marķējums</span>
              <span className="text-[10px] bg-[#EEF2EC] text-[#606C5A] px-2 py-0.5 rounded-md font-mono font-bold">
                Scan-to-Deliver
              </span>
            </h3>
            <p className="text-xs text-[#7A736E]">
              Termodruka (50x80 mm). QR kods atver pilno pasūtījuma dokumentu.
            </p>
          </div>
        </div>

        {/* Multi-dāvanu pārslēdzējs (ja pasūtījumā ir vairākas dāvanas) */}
        {totalGifts > 1 && (
          <div className="shrink-0 space-y-1.5 print:hidden">
            <span className="text-[11px] font-semibold text-[#7A736E] uppercase tracking-wider block">
              Izvēlieties dāvanu marķējumam:
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-xs overflow-x-auto">
              {order.gifts.map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGiftIndex(idx)}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-center ${
                    selectedGiftIndex === idx
                      ? "bg-white text-[#B85D3E] font-semibold shadow-xs border border-[#E5DFD5]"
                      : "text-[#7A736E] hover:text-[#2A2624]"
                  }`}
                >
                  Dāvana {idx + 1} no {totalGifts}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pati birka (Print Preview konteiners, optimizēts 50x80 mm birkai) */}
        <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5DFD5] flex justify-center flex-1 overflow-y-auto print:bg-white print:p-0 print:border-none print:m-0">
          <div
            id="printable-tag"
            className="w-[280px] bg-white border-2 border-dashed border-[#2A2624] p-4 rounded-xl shadow-xs text-[#2A2624] font-sans flex flex-col justify-between my-auto print:border-solid print:border print:m-0 print:shadow-none print:w-[65mm]"
          >
            {/* Birka Brand */}
            <div className="text-center pb-2 border-b border-[#2A2624]">
              <div className="font-heading font-bold text-sm tracking-widest uppercase">
                MANILLA
              </div>
              <div className="text-[8.5px] uppercase tracking-wider text-[#7A736E]">
                Dāvanu Iesaiņošanas Ateljē
              </div>
            </div>

            {/* Pasūtījuma numurs un Multi-dāvanas marķējums */}
            <div className="py-2 text-center space-y-1">
              <div className="font-mono font-bold text-xl tracking-tight text-[#2A2624]">
                {order.orderNumber}
              </div>
              <div className="inline-block bg-[#2A2624] text-white px-3 py-0.5 rounded-full text-[11px] font-bold font-mono">
                Dāvana {selectedGiftIndex + 1} no {totalGifts}
              </div>
            </div>

            {/* ĪSTAIS SKENĒJAMAIS QR KODS (Pure SVG, svars ~1.5 KB) */}
            <div className="flex flex-col items-center justify-center my-1.5 gap-1">
              <div className="bg-white p-2 rounded-xl border border-[#2A2624]/20 shadow-2xs">
                <QRCode
                  value={contractUrl}
                  size={120}
                  bgColor="#FFFFFF"
                  fgColor="#2A2624"
                  level="M"
                />
              </div>
              <span className="text-[8.5px] font-mono text-[#7A736E] text-center max-w-[230px] truncate">
                Skenēt: atver pasūtījuma aktu
              </span>
            </div>

            {/* Informācija par dāvanu un klientu */}
            <div className="text-center text-[10px] space-y-1 pt-2 border-t border-[#ECE6DC]">
              <div className="font-bold text-xs truncate text-[#2A2624]">
                {currentGift?.title || "Dāvana"}
              </div>
              <div className="text-[#7A736E]">
                Klients: <span className="font-semibold text-[#2A2624]">{order.customer.fullName}</span>
              </div>
              <div className="font-mono text-[#7A736E]">
                Tālr.: <span className="text-[#2A2624]">{order.customer.phone}</span>
              </div>
              <div className="font-mono font-bold text-[#B85D3E] pt-0.5">
                Gatavs: {formattedDate}
              </div>

              {/* Apmaksas statuss uz birkas */}
              <div className="pt-1">
                {order.paymentStatus === "APMAKSATS" ? (
                  <span className="inline-block text-[9px] font-bold text-[#606C5A] bg-[#EEF2EC] px-2 py-0.5 rounded-md border border-[#606C5A]/30">
                    Apmaksāts {order.cashReceiptNumber ? `(${order.cashReceiptNumber})` : ""}
                  </span>
                ) : (
                  <span className="inline-block text-[9px] font-bold text-[#B85D3E] bg-[#F7EBE7] px-2 py-0.5 rounded-md border border-[#B85D3E]/30">
                    Apmaksa pie saņemšanas
                  </span>
                )}
              </div>

              <div className="text-[8.5px] text-[#A39D98] pt-1 border-t border-[#ECE6DC]/60 mt-1">
                {order.storeBranch}
              </div>
            </div>
          </div>
        </div>

        {/* Pogu rinda (paslēpta drukāšanā) */}
        <div className="flex items-center gap-3 pt-1 shrink-0 print:hidden">
          <button
            onClick={onClose}
            data-testid="tag-modal-close-btn"
            className="flex-1 bg-white hover:bg-[#FAF8F5] text-[#7A736E] border border-[#E5DFD5] py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Aizvērt
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-[#B85D3E] hover:bg-[#A24E32] text-white py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Drukāt birku (50x80)</span>
          </button>
        </div>

      </div>

      {/* Drukas stila pārrakstīšana, lai drukātos tikai pati birka */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-tag,
          #printable-tag * {
            visibility: visible;
          }
          #printable-tag {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            border: 1px solid #000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
