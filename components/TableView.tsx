"use client";

import React from "react";
import { OrderData } from "./OrderCard";
import { Clock, CheckCircle2, ArrowRight, Eye, FileText, QrCode, AlertTriangle } from "lucide-react";

interface TableViewProps {
  orders: OrderData[];
  onStatusChange: (orderId: string, nextStatus: string) => void;
  onPrintTag: (order: OrderData) => void;
  onViewDetails?: (order: OrderData) => void;
  onViewContract?: (order: OrderData) => void;
}

export function TableView({
  orders,
  onStatusChange,
  onPrintTag,
  onViewDetails,
  onViewContract,
}: TableViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PIENEMTS":
        return <span className="bg-[#F7EBE7] text-[#B85D3E] border border-[#B85D3E]/20 px-2 py-0.5 rounded-md text-xs font-medium">1. Pieņemts</span>;
      case "IESAINOSANA":
        return <span className="bg-[#FDF6E8] text-[#D99B26] border border-[#D99B26]/30 px-2 py-0.5 rounded-md text-xs font-medium">2. Iesaiņošanā</span>;
      case "GATAVS":
        return <span className="bg-[#EEF2EC] text-[#606C5A] border border-[#606C5A]/30 px-2 py-0.5 rounded-md text-xs font-medium">3. Gatavs</span>;
      case "IZSNIEGTS":
        return <span className="bg-[#FAF8F5] text-[#7A736E] border border-[#E5DFD5] px-2 py-0.5 rounded-md text-xs font-medium">4. Izsniegts</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[#7A736E] font-heading font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Nr.</th>
              <th className="py-3 px-4">Klients & Tālrunis</th>
              <th className="py-3 px-4">Dāvanas</th>
              <th className="py-3 px-4">Termiņš</th>
              <th className="py-3 px-4">Statuss</th>
              <th className="py-3 px-4">Summa</th>
              <th className="py-3 px-4">Apmaksa</th>
              <th className="py-3 px-4">Meistars</th>
              <th className="py-3 px-4 text-right">Darbības</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE6DC] text-[#2A2624]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#A39D98]">
                  Nav atrasts neviens pasūtījums
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const now = new Date();
                const pickupDate = new Date(order.agreedPickupTime);
                const diffMs = pickupDate.getTime() - now.getTime();
                const isOverdue = order.status !== "IZSNIEGTS" && diffMs < 0;

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

                const formattedTime = pickupDate.toLocaleTimeString("lv-LV", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const MONTHS_SHORT = [
                  "janv.", "febr.", "marts", "apr.", "maijs", "jūn.",
                  "jūl.", "aug.", "sept.", "okt.", "nov.", "dec."
                ];
                const dateFormatted = `${pickupDate.getDate()}. ${MONTHS_SHORT[pickupDate.getMonth()]}`;

                const overdueTimeLabel = isToday
                  ? formattedTime
                  : isTomorrow
                  ? `Rīt ${formattedTime}`
                  : `${dateFormatted} ${formattedTime}`;

                let targetDeadlineText = "";
                if (isToday) {
                  targetDeadlineText = `Šodien ${formattedTime}`;
                } else if (isTomorrow) {
                  targetDeadlineText = `Rīt ${formattedTime}`;
                } else {
                  targetDeadlineText = `${dateFormatted} ${formattedTime}`;
                }

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

                return (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#B85D3E]">
                      <button
                        type="button"
                        onClick={() => onViewDetails?.(order)}
                        className="hover:underline cursor-pointer"
                        title="Skatīt pasūtījuma kartīti"
                      >
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{order.customer.fullName}</div>
                      <div className="text-[#7A736E] font-mono text-[11px]">{order.customer.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium truncate max-w-[180px]">
                        {order.gifts[0]?.title || "Dāvana"}
                      </div>
                      <div className="text-[11px] text-[#7A736E]">
                        {order.gifts.length} {order.gifts.length === 1 ? "priekšmets" : "priekšmeti"}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {order.status === "IZSNIEGTS" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF8F5] text-[#7A736E] border border-[#E5DFD5] text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#606C5A] shrink-0" />
                          <span>Izsniegts ({dateFormatted})</span>
                        </div>
                      ) : isOverdue ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FDF2EE] text-[#B85D3E] border border-[#B85D3E]/25 text-[11px] font-medium shadow-2xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#B85D3E] shrink-0" />
                          <span className="font-bold">Kavējas {overdueDelayText}</span>
                          <span className="text-[#B85D3E]/40">•</span>
                          <span className="font-mono text-[10.5px] opacity-90">{overdueTimeLabel}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF8F5] text-[#2A2624] border border-[#E5DFD5] text-[11px] font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#606C5A] shrink-0" />
                          <span className="font-semibold">{targetDeadlineText}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                      € {order.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {order.paymentStatus === "APMAKSATS" ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#EEF2EC] text-[#606C5A] border border-[#606C5A]/25 text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#606C5A]" />
                          <span>Apmaksāts</span>
                          {order.cashReceiptNumber && (
                            <span className="font-mono text-[9.5px] text-[#606C5A] font-bold bg-white/80 px-1.5 py-0.2 rounded border border-[#606C5A]/20">
                              #{order.cashReceiptNumber.replace(/^Čeks\s*#?/, "")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FAF8F5] text-[#7A736E] border border-[#E5DFD5] text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B85D3E]" />
                          <span>Neapmaksāts</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#7A736E] whitespace-nowrap">
                      {order.assignedUser?.fullName || "—"}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPrintTag(order)}
                          title="Drukāt dāvanas QR birku"
                          className="p-1.5 text-[#7A736E] hover:text-[#2A2624] hover:bg-[#FAF8F5] rounded-lg transition-colors border border-[#E5DFD5] cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#2A2624]" />
                        </button>
                        <button
                          onClick={() => onViewContract?.(order)}
                          title="Apskatīt / Lejupielādēt oficiālo līgumu (PDF)"
                          className="p-1.5 text-[#7A736E] hover:text-[#B85D3E] hover:bg-[#FAF8F5] rounded-lg transition-colors border border-[#E5DFD5] cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onViewDetails?.(order)}
                          title="Skatīt pasūtījuma pilnās detaļas"
                          className="p-1.5 text-[#B85D3E] hover:text-white hover:bg-[#B85D3E] rounded-lg transition-colors border border-[#B85D3E]/30 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {order.status === "PIENEMTS" && (
                          <button
                            onClick={() => onStatusChange(order.id, "IESAINOSANA")}
                            className="bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 text-[#B85D3E] border border-[#B85D3E]/30 px-2.5 py-1 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Sākt</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {order.status === "IESAINOSANA" && (
                          <button
                            onClick={() => onStatusChange(order.id, "GATAVS")}
                            className="bg-[#606C5A] hover:bg-[#4E5949] text-white px-2.5 py-1 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Gatavs & SMS</span>
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                        )}

                        {order.status === "GATAVS" && (
                          <button
                            onClick={() => onStatusChange(order.id, "IZSNIEGTS")}
                            className="bg-[#B85D3E] hover:bg-[#A24E32] text-white px-2.5 py-1 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Izsniegt</span>
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
