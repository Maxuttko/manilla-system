"use client";

import React from "react";
import { MessageSquare, CheckCircle2, X, Smartphone, ShieldCheck } from "lucide-react";

interface SmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  smsData: {
    recipientPhone: string;
    messageText: string;
    providerId?: string;
    orderNumber: string;
  } | null;
}

export function SmsModal({ isOpen, onClose, smsData }: SmsModalProps) {
  React.useEffect(() => {
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

  if (!isOpen || !smsData) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E5DFD5] max-w-md w-full p-6 shadow-xl relative space-y-4">
        
        {/* Aizvēršanas poga */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#A39D98] hover:text-[#2A2624] p-1 rounded-full hover:bg-[#FAF8F5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Galvene ar ikonu */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EEF2EC] text-[#606C5A] flex items-center justify-center border border-[#606C5A]/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-[#2A2624]">
              Automātiskais SMS Paziņojums
            </h3>
            <p className="text-xs text-[#7A736E]">
              Pasūtījumam <span className="font-mono font-semibold text-[#B85D3E]">{smsData.orderNumber}</span>
            </p>
          </div>
        </div>

        {/* Statusa apliecinājums */}
        <div className="bg-[#EEF2EC] rounded-2xl p-3 border border-[#606C5A]/20 flex items-center gap-2.5 text-xs text-[#606C5A] font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#606C5A] shrink-0" />
          <span>Statuss: Veiksmīgi piegādāts klientam</span>
        </div>

        {/* Tālrunis */}
        <div className="flex items-center justify-between text-xs py-1 px-1 border-b border-[#ECE6DC]">
          <span className="text-[#7A736E] flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            Saņēmējs:
          </span>
          <span className="font-mono font-bold text-[#2A2624]">{smsData.recipientPhone}</span>
        </div>

        {/* Oficiālais teksta lodziņš (Kanoniskais teksts no Lindas) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A736E]">
            Oficiālais paziņojuma teksts:
          </label>
          <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl p-4 text-xs text-[#2A2624] leading-relaxed font-sans shadow-inner">
            {smsData.messageText}
          </div>
        </div>

        {/* Drošība un vārteja */}
        <div className="flex items-center justify-between text-[11px] text-[#A39D98] pt-1">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#606C5A]" />
            <span>Dublikātu aizsardzība aktīva</span>
          </div>
          <span className="font-mono">{smsData.providerId || "LMT-SMS-GATEWAY"}</span>
        </div>

        {/* Aizvērt poga */}
        <button
          onClick={onClose}
          data-testid="sms-modal-close-btn"
          className="w-full bg-[#606C5A] hover:bg-[#4E5949] text-white py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
        >
          Labi, sapratu
        </button>

      </div>
    </div>
  );
}
