"use client";

import React, { useState, useEffect } from "react";
import { OrderData } from "./OrderCard";
import {
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Gift,
  RotateCcw,
} from "lucide-react";

interface StatusConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options?: { customSmsText?: string; cashReceiptNumber?: string }) => void;
  order: OrderData | null;
  targetStatus: string | null;
  isLoading?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PIENEMTS: {
    label: "Pieņemts",
    badgeClass: "bg-[#F7EBE7] text-[#B85D3E] border-[#B85D3E]/30",
  },
  IESAINOSANA: {
    label: "Iesaiņošanā",
    badgeClass: "bg-[#FDF6E8] text-[#D99B26] border-[#D99B26]/40",
  },
  GATAVS: {
    label: "Gatavs saņemšanai",
    badgeClass: "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/40",
  },
  IZSNIEGTS: {
    label: "Izsniegts",
    badgeClass: "bg-[#FAF8F5] text-[#2A2624] border-[#E5DFD5]",
  },
};

export function StatusConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  targetStatus,
  isLoading = false,
}: StatusConfirmModalProps) {
  const getDefaultSmsText = (ord: OrderData) => {
    return `Labdien! Jūsu MANILLA dāvanu iesaiņojums (${ord.orderNumber}) ir gatavs saņemšanai veikalā ${ord.storeBranch}. Gaidīsim Jūs!`;
  };

  const [smsText, setSmsText] = useState("");
  const [cashReceiptInput, setCashReceiptInput] = useState("");

  useEffect(() => {
    if (order) {
      setSmsText(getDefaultSmsText(order));
      setCashReceiptInput(order.cashReceiptNumber || "");
    }
  }, [order?.id, order?.orderNumber, order?.storeBranch, targetStatus]);

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

  if (!isOpen || !order || !targetStatus) return null;

  const currentInfo = STATUS_LABELS[order.status] || {
    label: order.status,
    badgeClass: "bg-stone-100 text-stone-700 border-stone-200",
  };

  const targetInfo = STATUS_LABELS[targetStatus] || {
    label: targetStatus,
    badgeClass: "bg-stone-100 text-stone-700 border-stone-200",
  };

  const isMovingToIesainosana = targetStatus === "IESAINOSANA";
  const isMovingToGatavs = targetStatus === "GATAVS";
  const isMovingToIzsniegts = targetStatus === "IZSNIEGTS";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-[#2A2624]/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-2xl sm:rounded-3xl max-w-md sm:max-w-lg w-full shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-[#2A2624] scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modāļa galvene (kompakta) */}
        <div className="px-5 py-3.5 bg-white border-b border-[#ECE6DC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isMovingToGatavs
                  ? "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/30"
                  : isMovingToIzsniegts
                  ? "bg-[#FAF8F5] text-[#2A2624] border-[#E5DFD5]"
                  : "bg-[#FDF6E8] text-[#D99B26] border-[#D99B26]/30"
              }`}
            >
              {isMovingToGatavs ? (
                <MessageSquare className="w-4 h-4" />
              ) : isMovingToIzsniegts ? (
                <Gift className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-[#2A2624] leading-tight">
                {isMovingToIesainosana && "Sākt dāvanu iesaiņošanu?"}
                {isMovingToGatavs && "Pabeigt un nosūtīt SMS klientam?"}
                {isMovingToIzsniegts && "Izsniegt pasūtījumu klientam?"}
                {!isMovingToIesainosana && !isMovingToGatavs && !isMovingToIzsniegts && "Apstiprināt statusa maiņu"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#A39D98] hover:text-[#2A2624] hover:bg-[#F9F6F0] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modāļa saturs (ritināms ar kompaktām proporcijām) */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto text-xs">
          
          {/* Apvienotā pasūtījuma un statusa pārejas kartīte */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#ECE6DC] shadow-2xs space-y-2.5">
            
            {/* 1. Rinda: Numurs, Filāle, Summa */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#2A2624]">
                  {order.orderNumber}
                </span>
                <span className="text-[10px] bg-[#FAF8F5] text-[#7A736E] px-2 py-0.5 rounded-md border border-[#E5DFD5]">
                  {order.storeBranch}
                </span>
              </div>
              <div className="font-mono font-bold text-[#B85D3E] text-sm">
                € {order.totalPrice.toFixed(2)}
              </div>
            </div>

            {/* 2. Rinda: Klienta dati un Apmaksa */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[#A39D98] block text-[10px]">Klients</span>
                <span className="font-semibold text-[#2A2624] truncate block">
                  {order.customer.fullName}
                </span>
              </div>
              <div>
                <span className="text-[#A39D98] block text-[10px]">Tālrunis</span>
                <span className="font-mono font-medium text-[#2A2624] block">
                  {order.customer.phone}
                </span>
              </div>
              <div>
                <span className="text-[#A39D98] block text-[10px]">Dāvanas</span>
                <span className="font-medium text-[#2A2624]">
                  {order.gifts.length} {order.gifts.length === 1 ? "dāvana" : "dāvanas"}
                </span>
              </div>
              <div>
                <span className="text-[#A39D98] block text-[10px]">Apmaksa</span>
                <span
                  className={`font-semibold ${
                    order.paymentStatus === "APMAKSATS" ? "text-[#606C5A]" : "text-[#B85D3E]"
                  }`}
                >
                  {order.paymentStatus === "APMAKSATS" ? "Apmaksāts" : "Neapmaksāts"}
                </span>
              </div>
            </div>

            {/* 3. Kompakts statusa maiņas ceļvedis */}
            <div className="flex items-center justify-between bg-[#FAF8F5] rounded-xl px-3 py-2 border border-[#ECE6DC] text-xs">
              <span className="text-[10.5px] text-[#A39D98] font-medium">Statusa maiņa:</span>
              <div className="flex items-center gap-1.5 font-medium">
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${currentInfo.badgeClass}`}>
                  {currentInfo.label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A39D98] shrink-0" />
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${targetInfo.badgeClass}`}>
                  {targetInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Konteksta paziņojums: GATAVS (SMS) */}
          {isMovingToGatavs && (
            <div className="bg-[#EEF2EC] rounded-2xl p-3.5 border border-[#606C5A]/30 space-y-2 text-[#3E4739]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#606C5A]">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>Klientam tiks nosūtīta SMS īsziņa</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsText(getDefaultSmsText(order))}
                  className="text-[10px] text-[#606C5A] hover:text-[#2A2624] font-medium flex items-center gap-1 transition-colors cursor-pointer group"
                  title="Atjaunot noklusēto ziņas tekstu"
                >
                  <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform" />
                  <span>Atjaunot noklusēto</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  rows={3}
                  placeholder="Ievadiet SMS ziņas tekstu..."
                  className="w-full p-2.5 bg-white rounded-xl border border-[#606C5A]/30 focus:border-[#606C5A] focus:ring-2 focus:ring-[#606C5A]/20 font-mono text-[11px] text-[#2A2624] leading-relaxed resize-none transition-all outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#606C5A]/80 font-mono">
                <span>{smsText.length} zīmes ({Math.ceil(smsText.length / 160) || 1} SMS)</span>
                <span className="italic">Gatavs nosūtīšanai</span>
              </div>
            </div>
          )}

          {/* Konteksta paziņojums: IZSNIEGTS */}
          {isMovingToIzsniegts && (
            <div className="space-y-2.5">
              {order.paymentStatus !== "APMAKSATS" ? (
                <div className="bg-[#F7EBE7] rounded-2xl p-3.5 border border-[#B85D3E]/40 text-[#8C3F27] space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#B85D3E] mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-[#B85D3E]">
                        Pasūtījums ir NEAPMAKSĀTS (€ {order.totalPrice.toFixed(2)})
                      </div>
                      <p className="text-[11px] leading-snug">
                        Klients veic apmaksu pie kases. Pirms dāvanas atdošanas obligāti jāievada kases čeka numurs nodokļu uzskaitei:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#B85D3E] flex items-center justify-between">
                      <span>Kases čeka numurs *</span>
                      <span className="text-[10px] font-normal lowercase">obligāts nodokļu auditam</span>
                    </label>
                    <input
                      type="text"
                      placeholder="piem. Čeks #89455 vai 89455"
                      value={cashReceiptInput}
                      onChange={(e) => setCashReceiptInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#B85D3E]/40 rounded-xl text-xs font-mono font-bold text-[#2A2624] focus:outline-none focus:border-[#B85D3E] focus:ring-2 focus:ring-[#B85D3E]/20"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[#EEF2EC] rounded-2xl p-3 border border-[#606C5A]/30 text-[#3E4739] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#606C5A]">
                    <CheckCircle2 className="w-4 h-4 text-[#606C5A] shrink-0" />
                    <span>Pasūtījums jau ir apmaksāts!</span>
                  </div>
                  <div className="text-[11px] text-[#2A2624]">
                    Kases čeks: <strong className="font-mono text-[#606C5A]">{order.cashReceiptNumber || "Reģistrēts pieņemot"}</strong>
                  </div>
                </div>
              )}
              <div className="text-[10.5px] text-[#7A736E] px-1">
                Pārvietojot uz <strong>Izsniegts</strong>, kases čeks tiks neatgriezeniski piesaistīts pasūtījumam nodokļu auditā un pasūtījums tiks arhivēts.
              </div>
            </div>
          )}

          {/* Konteksta paziņojums: IESAINOSANA */}
          {isMovingToIesainosana && (
            <div className="bg-[#FDF6E8] rounded-2xl p-3 border border-[#D99B26]/30 text-[#8A6318] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-[#D99B26] mt-0.5" />
              <div className="space-y-0.5 text-[11px] leading-snug">
                <div className="font-bold text-xs text-[#966710]">
                  Darba uzsākšana pie meistara galda
                </div>
                <p>
                  Pasūtījums tiks nodots iesaiņošanas fāzē. Kolēģi redzēs, ka darbs pie dāvanas ir uzsākts.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Kājene ar rīcības pogām (kompakta) */}
        <div className="px-5 py-3 bg-white border-t border-[#ECE6DC] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#7A736E] hover:text-[#2A2624] border border-[#E5DFD5] rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Atcelt
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (isMovingToGatavs) {
                onConfirm({ customSmsText: smsText.trim() });
              } else if (isMovingToIzsniegts) {
                onConfirm({ cashReceiptNumber: cashReceiptInput.trim() });
              } else {
                onConfirm();
              }
            }}
            disabled={
              isLoading ||
              (isMovingToGatavs && smsText.trim().length === 0) ||
              (isMovingToIzsniegts && order.paymentStatus !== "APMAKSATS" && cashReceiptInput.trim().length === 0)
            }
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
              isMovingToGatavs
                ? "bg-[#606C5A] hover:bg-[#4E5949] text-white shadow-[#606C5A]/20"
                : isMovingToIzsniegts
                ? "bg-[#B85D3E] hover:bg-[#9E4D32] text-white shadow-[#B85D3E]/20"
                : "bg-[#B85D3E] hover:bg-[#9E4D32] text-white shadow-[#B85D3E]/20"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Apstrādā...</span>
              </span>
            ) : (
              <>
                <span>
                  {isMovingToIesainosana && "Jā, sākt iesaiņošanu"}
                  {isMovingToGatavs && "Pabeigt & Nosūtīt SMS"}
                  {isMovingToIzsniegts && "Apstiprināt izsniegšanu"}
                  {!isMovingToIesainosana && !isMovingToGatavs && !isMovingToIzsniegts && "Apstiprināt & Pārvietot"}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
