"use client";

import React from "react";
import { Clock, AlertTriangle, Package, ExternalLink, CheckCircle2, ArrowRight, User, Eye, FileText, QrCode } from "lucide-react";

export interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  storeBranch: string;
  createdAt: string;
  agreedPickupTime: string;
  notes: string | null;
  laborCost: number;
  materialsCost: number;
  provisionalLimit: number | null;
  totalPrice: number;
  paymentStatus: string;
  cashReceiptNumber: string | null;
  customer: {
    fullName: string;
    phone: string;
    email: string | null;
  };
  assignedUser?: {
    fullName: string;
    role: string;
  } | null;
  gifts: Array<{
    id: string;
    title: string;
    isThirdParty: boolean;
    conditionNotes: string | null;
    photoUrl: string | null;
    isCompleted: boolean;
    materials: Array<{
      quantity: number;
      unitPrice: number;
      subtotal: number;
      material: {
        id?: string;
        code?: string;
        barcode?: string;
        category?: string;
        name: string;
        unit: string;
        pricePerUnit?: number;
        inStock?: number;
        swatchColor: string | null;
        imageUrl?: string | null;
      };
    }>;
  }>;
  auditLogs?: Array<{
    id: string;
    action: string;
    details: string | null;
    signatureDataUrl: string | null;
    ipAddress: string | null;
    timestamp: string;
    user?: {
      id: string;
      fullName: string;
      role: string;
    } | null;
  }>;
  smsLogs?: Array<{
    status: string;
    sentAt: string;
  }>;
}

interface OrderCardProps {
  order: OrderData;
  onStatusChange: (orderId: string, nextStatus: string) => void;
  onPrintTag: (order: OrderData) => void;
  onViewDetails?: (order: OrderData) => void;
  onViewContract?: (order: OrderData) => void;
}

export function OrderCard({
  order,
  onStatusChange,
  onPrintTag,
  onViewDetails,
  onViewContract,
}: OrderCardProps) {
  const pickupDate = new Date(order.agreedPickupTime);
  const now = new Date();
  const diffMs = pickupDate.getTime() - now.getTime();
  const isOverdue = diffMs < 0 && order.status !== "IZSNIEGTS";

  // Check today, tomorrow, yesterday
  const isToday =
    pickupDate.getDate() === now.getDate() &&
    pickupDate.getMonth() === now.getMonth() &&
    pickupDate.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    pickupDate.getDate() === tomorrow.getDate() &&
    pickupDate.getMonth() === tomorrow.getMonth() &&
    pickupDate.getFullYear() === tomorrow.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    pickupDate.getDate() === yesterday.getDate() &&
    pickupDate.getMonth() === yesterday.getMonth() &&
    pickupDate.getFullYear() === yesterday.getFullYear();

  const formattedTime = pickupDate.toLocaleTimeString("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const MONTHS_SHORT = [
    "janv.", "febr.", "marts", "apr.", "maijs", "jūn.",
    "jūl.", "aug.", "sept.", "okt.", "nov.", "dec."
  ];
  const dateFormatted = `${pickupDate.getDate()}. ${MONTHS_SHORT[pickupDate.getMonth()]}`;

  let targetDeadlineText = "";
  if (isToday) {
    targetDeadlineText = `Šodien ${formattedTime}`;
  } else if (isTomorrow) {
    targetDeadlineText = `Rīt ${formattedTime}`;
  } else if (isYesterday) {
    targetDeadlineText = `Vakar ${formattedTime}`;
  } else {
    targetDeadlineText = `${dateFormatted} ${formattedTime}`;
  }

  // Overdue delay calculation & compact time string
  const overdueTimeLabel = isToday
    ? formattedTime
    : isYesterday
    ? `Vakar ${formattedTime}`
    : `${dateFormatted} ${formattedTime}`;

  let overdueDelayText = "";
  if (isOverdue) {
    const elapsedMinutes = Math.abs(Math.round(diffMs / 60000));
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedDays >= 1) {
      overdueDelayText = `${elapsedDays} d.`;
    } else if (elapsedHours >= 1) {
      overdueDelayText = `${elapsedHours} st.`;
    } else {
      overdueDelayText = `${elapsedMinutes} min.`;
    }
  }

  const isUrgentToday = !isOverdue && isToday && diffMs > 0 && diffMs <= 60 * 60 * 1000;

  const hasThirdParty = order.gifts.some((g) => g.isThirdParty);
  const hasDefects = order.gifts.some((g) => g.conditionNotes && g.conditionNotes.trim().length > 0);

  return (
    <div
      onClick={() => onViewDetails?.(order)}
      className="bg-white rounded-2xl border border-[#E5DFD5] p-4 shadow-xs hover:shadow-md hover:border-[#B85D3E]/50 transition-all duration-200 flex flex-col justify-between group cursor-pointer relative"
    >
      
      {/* 1. Augša: Pasūtījuma numurs, Termiņš un Cena */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#ECE6DC]">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono font-bold text-sm text-[#2A2624] group-hover:text-[#B85D3E] tracking-tight transition-colors whitespace-nowrap">
                {order.orderNumber}
              </span>
              <span className="text-[10px] bg-[#FAF8F5] text-[#7A736E] px-1.5 py-0.2 rounded-md border border-[#E5DFD5] whitespace-nowrap shrink-0">
                {order.gifts.length} {order.gifts.length === 1 ? "dāvana" : "dāvanas"}
              </span>
            </div>
            <div className="text-xs text-[#7A736E] mt-0.5 truncate">
              {order.customer.fullName} • <span className="font-mono">{order.customer.phone}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-mono font-bold text-sm text-[#B85D3E]">
              € {order.totalPrice.toFixed(2)}
            </div>
            {order.provisionalLimit && (
              <div className="text-[10px] text-[#7A736E] font-mono">
                Līdz € {order.provisionalLimit.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* 2. Statuss: Termiņš & Apmaksa (Japandi Ateljē Kopsavilkums bez apgriešanas) */}
        <div
          className={`my-2 rounded-xl p-2.5 border text-xs transition-colors ${
            isOverdue
              ? "bg-[#FDF2EE] border-[#B85D3E]/30 text-[#2A2624]"
              : isUrgentToday
              ? "bg-[#FDF8EE] border-[#D99B26]/35 text-[#2A2624]"
              : "bg-[#FAF8F5] border-[#ECE6DC] text-[#2A2624]"
          }`}
        >
          {/* Rinda 1: Termiņš */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium min-w-0">
              {order.status === "IZSNIEGTS" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#606C5A] shrink-0" />
                  <span className="text-[#606C5A] font-semibold text-[11px]">Izsniegts klientam</span>
                </>
              ) : isOverdue ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#B85D3E] shrink-0" />
                  <span className="text-[#B85D3E] font-bold text-[11px] truncate">
                    Kavējas (+{overdueDelayText})
                  </span>
                </>
              ) : isUrgentToday ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#D99B26] shrink-0" />
                  <span className="text-[#A67114] font-bold text-[11px] truncate">
                    Drīz termiņš ({Math.round(diffMs / 60000)}m)
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#606C5A] shrink-0" />
                  <span className="text-[#7A736E] text-[11px]">Termiņš:</span>
                </>
              )}
            </div>

            <div className="font-mono font-bold text-xs shrink-0 text-[#2A2624]">
              {order.status === "IZSNIEGTS" ? dateFormatted : targetDeadlineText}
            </div>
          </div>

          {/* Rinda 2: Apmaksa */}
          <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-[#ECE6DC] text-[11px]">
            <span className="text-[#7A736E]">Apmaksas statuss:</span>

            {order.paymentStatus === "APMAKSATS" ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#606C5A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#606C5A] shrink-0" />
                <span>Apmaksāts</span>
                {order.cashReceiptNumber && (
                  <span className="font-mono text-[10px] text-[#2A2624] font-bold bg-white px-1.5 py-0.2 rounded border border-[#E5DFD5] shadow-2xs">
                    #{order.cashReceiptNumber.replace(/^Čeks\s*#?/, "")}
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#B85D3E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B85D3E] shrink-0" />
                <span>Pie saņemšanas</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Dāvanu pārskats ar foto un brīdinājumiem (parāda visas pasūtījuma dāvanas) */}
        <div className="bg-[#FAF8F5] rounded-xl p-2.5 border border-[#ECE6DC] my-2 space-y-2 max-h-[260px] overflow-y-auto">
          {order.gifts && order.gifts.length > 0 ? (
            order.gifts.map((gift, idx) => {
              const isGiftThirdParty = gift.isThirdParty;
              const hasGiftDefects = Boolean(
                gift.conditionNotes && gift.conditionNotes.trim().length > 0
              );

              return (
                <div
                  key={gift.id || idx}
                  className={`flex items-center gap-2.5 ${
                    idx > 0 ? "pt-2 border-t border-[#ECE6DC]" : ""
                  }`}
                >
                  {/* Foto vai ikona */}
                  {gift.photoUrl ? (
                    <img
                      src={gift.photoUrl}
                      alt={gift.title}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                      className="w-10 h-10 rounded-lg object-cover border border-[#E5DFD5] shrink-0 bg-[#F9F6F0]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] border border-[#E5DFD5] flex items-center justify-center shrink-0 text-[#A39D98]">
                      <Package className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {order.gifts.length > 1 && (
                        <span className="font-mono text-[9px] font-bold text-[#A39D98] bg-white px-1.5 py-0.2 rounded border border-[#E5DFD5] shrink-0">
                          {idx + 1}/{order.gifts.length}
                        </span>
                      )}
                      <div className="text-xs font-semibold text-[#2A2624] truncate">
                        {gift.title || `Dāvana #${idx + 1}`}
                      </div>
                    </div>

                    {/* Pazīmes: Ārpus veikala & Defekti & Pabeigšanas statuss */}
                    {(isGiftThirdParty || hasGiftDefects || gift.isCompleted) && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {gift.isCompleted && (
                          <span className="text-[9.5px] bg-[#EEF2EC] text-[#606C5A] border border-[#606C5A]/30 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-[#606C5A]" />
                            Iesaiņota
                          </span>
                        )}
                        {isGiftThirdParty && (
                          <span className="text-[9.5px] bg-white text-[#7A736E] border border-[#E5DFD5] px-1.5 py-0.2 rounded font-medium">
                            Ārpus Manilla prece
                          </span>
                        )}
                        {hasGiftDefects && (
                          <span className="text-[9.5px] bg-[#FDF6E8] text-[#D99B26] border border-[#D99B26]/30 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Bojājumu atzīme
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center gap-2 text-[#A39D98] text-xs py-1">
              <Package className="w-4 h-4" />
              <span>Dāvana nav pievienota</span>
            </div>
          )}
        </div>

        {/* 4. Piezīmes un Meistars */}
        <div className="flex items-center justify-between text-[11px] text-[#7A736E] pt-1">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-[#A39D98]" />
            <span>{order.assignedUser?.fullName || "Nav piesaistīts"}</span>
          </div>
          {order.smsLogs && order.smsLogs.length > 0 && (
            <span className="text-[#606C5A] flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              SMS nosūtīts
            </span>
          )}
        </div>
      </div>

      {/* 5. Apakšējās rīcības pogas */}
      <div className="pt-3 mt-2 border-t border-[#ECE6DC] flex items-center justify-between gap-1.5">
        
        {/* Papildus darbības: Birka, Līgums & Detaļas */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrintTag(order);
            }}
            title="Drukāt dāvanas birku ar QR kodu"
            className="p-1.5 text-[#7A736E] hover:text-[#2A2624] hover:bg-[#FAF8F5] rounded-xl transition-colors border border-[#E5DFD5] cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#2A2624]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewContract?.(order);
            }}
            title="Apskatīt / Lejupielādēt oficiālo līgumu (PDF)"
            className="p-1.5 text-[#7A736E] hover:text-[#B85D3E] hover:bg-[#FAF8F5] rounded-xl transition-colors border border-[#E5DFD5] cursor-pointer"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(order);
            }}
            title="Skatīt pasūtījuma pilnās detaļas un fotogrāfiju"
            className="p-1.5 text-[#7A736E] hover:text-[#B85D3E] hover:bg-[#FAF8F5] rounded-xl transition-colors border border-[#E5DFD5] cursor-pointer group/btn"
          >
            <Eye className="w-4 h-4 text-[#B85D3E] group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>

        {/* Galvenā statusa maiņas poga */}
        {order.status === "PIENEMTS" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, "IESAINOSANA");
            }}
            className="min-w-0 flex-1 flex items-center justify-center gap-1 bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 text-[#B85D3E] border border-[#B85D3E]/30 px-2 py-1.5 rounded-xl font-semibold text-xs shadow-2xs hover:border-[#B85D3E] transition-all cursor-pointer"
          >
            <span className="truncate">Sākt iesaiņošanu</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        )}

        {order.status === "IESAINOSANA" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, "GATAVS");
            }}
            className="min-w-0 flex-1 flex items-center justify-center gap-1 bg-[#606C5A] hover:bg-[#4E5949] text-white px-2 py-1.5 rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span className="truncate">Pabeigt & SMS</span>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          </button>
        )}

        {order.status === "GATAVS" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, "IZSNIEGTS");
            }}
            className="min-w-0 flex-1 flex items-center justify-center gap-1 bg-[#B85D3E] hover:bg-[#A24E32] text-white px-2 py-1.5 rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span className="truncate">Izsniegt klientam</span>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          </button>
        )}

        {order.status === "IZSNIEGTS" && (
          <span className="text-[11px] text-[#A39D98] font-medium italic py-1 truncate">
            Izsniegts & Arhivēts
          </span>
        )}

      </div>

    </div>
  );
}
