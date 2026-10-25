"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Archive,
  Search,
  Calendar,
  CheckCircle2,
  DollarSign,
  Printer,
  Eye,
  Store,
  FileText,
  Clock,
  User,
} from "lucide-react";
import { OrderData } from "./OrderCard";

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderData[];
  onPrintTag: (order: OrderData) => void;
  onViewContract?: (order: OrderData) => void;
}

export function ArchiveModal({
  isOpen,
  onClose,
  orders,
  onPrintTag,
  onViewContract,
}: ArchiveModalProps) {
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedOrderForAudit, setSelectedOrderForAudit] = useState<OrderData | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedOrderForAudit) {
          setSelectedOrderForAudit(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedOrderForAudit, onClose]);

  if (!isOpen) return null;

  // Filtrējam tikai izsniegtos pasūtījumus
  const deliveredOrders = orders.filter((o) => o.status === "IZSNIEGTS");

  const filtered = deliveredOrders.filter((o) => {
    // 1. Meklēšana
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNumber = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customer.fullName.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.toLowerCase().includes(q);
      const matchReceipt = o.cashReceiptNumber?.toLowerCase().includes(q);
      if (!matchNumber && !matchName && !matchPhone && !matchReceipt) return false;
    }

    // 2. Filiāle
    if (selectedBranch !== "all" && o.storeBranch !== selectedBranch) {
      return false;
    }

    // 3. Datums
    if (dateFilter !== "all") {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      if (dateFilter === "today") {
        if (
          orderDate.getDate() !== now.getDate() ||
          orderDate.getMonth() !== now.getMonth() ||
          orderDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (orderDate < weekAgo) return false;
      } else if (dateFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (orderDate < monthAgo) return false;
      }
    }

    return true;
  });

  // Statistika
  const totalRevenue = filtered.reduce((sum, o) => sum + o.totalPrice, 0);
  const avgCheck = filtered.length > 0 ? totalRevenue / filtered.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E5DFD5] max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Galvene */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5DFD5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2A2624] text-white flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-[#2A2624]">
                Izsniegto Pasūtījumu Arhīvs
              </h2>
              <p className="text-xs text-[#7A736E]">
                Pabeigto pasūtījumu vēsture, kases čeki, klientu paraksti un audita protokoli
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A39D98] hover:text-[#2A2624] hover:bg-[#ECE6DC] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statistika kopsavilkums */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD5] border-b border-[#E5DFD5] bg-white">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#2A2624] flex items-center justify-center border border-[#E5DFD5]">
              <FileText className="w-5 h-5 text-[#B85D3E]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#7A736E]">
                Izsniegti pasūtījumi
              </div>
              <div className="font-mono font-bold text-lg text-[#2A2624]">
                {filtered.length} <span className="text-xs text-[#7A736E] font-sans">pasūtījumi</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#606C5A] flex items-center justify-center border border-[#E5DFD5]">
              <DollarSign className="w-5 h-5 text-[#606C5A]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#7A736E]">
                Kopējais apgrozījums
              </div>
              <div className="font-mono font-bold text-lg text-[#606C5A]">
                € {totalRevenue.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#D99B26] flex items-center justify-center border border-[#E5DFD5]">
              <Clock className="w-5 h-5 text-[#D99B26]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#7A736E]">
                Vidējais pasūtījuma čeks
              </div>
              <div className="font-mono font-bold text-lg text-[#2A2624]">
                € {avgCheck.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Filtru josla */}
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E5DFD5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Meklētājs */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7A736E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Meklēt pēc #MNL, klienta, tālruņa vai čeka nr..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs text-[#2A2624] focus:outline-none focus:border-[#B85D3E]"
            />
          </div>

          {/* Filiāle un Laika posms */}
          <div className="flex items-center gap-2">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-white border border-[#E5DFD5] text-[#2A2624] text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="all">Visas filiāles</option>
              <option value="Tērbatas iela 55">Tērbatas iela 55</option>
              <option value="T/C Galerija Centrs">T/C Galerija Centrs</option>
              <option value="Tērbatas iela 54">Manilla Kids</option>
            </select>

            <div className="flex items-center bg-white border border-[#E5DFD5] p-1 rounded-xl text-xs">
              {[
                { id: "all", label: "Viss" },
                { id: "today", label: "Šodien" },
                { id: "week", label: "7 d." },
                { id: "month", label: "Mēnesis" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDateFilter(t.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    dateFilter === t.id
                      ? "bg-[#2A2624] text-white font-semibold"
                      : "text-[#7A736E] hover:text-[#2A2624]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Tabulas saraksts */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[#7A736E] font-heading font-semibold uppercase tracking-wider text-[11px] sticky top-0">
              <tr>
                <th className="py-3 px-4">Nr.</th>
                <th className="py-3 px-4">Klients</th>
                <th className="py-3 px-4">Dāvanas & Materiāli</th>
                <th className="py-3 px-4">Filiāle</th>
                <th className="py-3 px-4">Čeka numurs</th>
                <th className="py-3 px-4">Summa</th>
                <th className="py-3 px-4">Izpildītājs</th>
                <th className="py-3 px-4 text-right">Darbības</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE6DC] text-[#2A2624]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A39D98]">
                    Arhīvā nav atrasts neviens pasūtījums pēc šiem kritērijiem
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#B85D3E]">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{order.customer.fullName}</div>
                        <div className="text-[11px] text-[#7A736E] font-mono">{order.customer.phone}</div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-medium truncate">{order.gifts[0]?.title || "Dāvana"}</div>
                        <div className="text-[11px] text-[#7A736E]">
                          {order.gifts.length} {order.gifts.length === 1 ? "priekšmets" : "priekšmeti"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#7A736E] whitespace-nowrap">
                        {order.storeBranch}
                      </td>
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        {order.cashReceiptNumber ? (
                          <span className="text-[#606C5A] font-semibold bg-[#EEF2EC] px-2 py-0.5 rounded border border-[#606C5A]/20">
                            {order.cashReceiptNumber}
                          </span>
                        ) : (
                          <span className="text-[#A39D98]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        € {order.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-[#7A736E] whitespace-nowrap">
                        {order.assignedUser?.fullName || "—"}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPrintTag(order)}
                            title="Atkārtoti drukāt birku"
                            className="p-1.5 text-[#7A736E] hover:text-[#2A2624] hover:bg-[#FAF8F5] rounded-lg transition-colors border border-[#E5DFD5] cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewContract?.(order)}
                            title="Apskatīt / Drukāt līgumu (PDF)"
                            className="p-1.5 text-[#7A736E] hover:text-[#B85D3E] hover:bg-[#FAF8F5] rounded-lg transition-colors border border-[#E5DFD5] cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedOrderForAudit(order)}
                            title="Skatīt audita vēsturi un parakstu"
                            className="p-1.5 text-[#B85D3E] hover:text-white hover:bg-[#B85D3E] rounded-lg transition-colors border border-[#B85D3E]/30 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Kājene */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between text-xs text-[#7A736E]">
          <span>Kopā arhīvā: {deliveredOrders.length} izsniegti pasūtījumi</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#2A2624] border border-[#E5DFD5] rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Aizvērt arhīvu
          </button>
        </div>

        {/* Audita detaļu modālis, ja noklikšķina uz "Eye" */}
        {selectedOrderForAudit && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl border border-[#E5DFD5] max-w-md w-full p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setSelectedOrderForAudit(null)}
                className="absolute right-4 top-4 text-[#A39D98] hover:text-[#2A2624]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EEF2EC] text-[#606C5A] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#2A2624]">
                    Pasūtījuma {selectedOrderForAudit.orderNumber} Audits
                  </h3>
                  <p className="text-[11px] text-[#7A736E]">
                    Klients: {selectedOrderForAudit.customer.fullName}
                  </p>
                </div>
              </div>

              {/* Informācijas bloks */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E5DFD5] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#7A736E]">Kases čeks:</span>
                  <span className="font-mono font-bold text-[#606C5A]">
                    {selectedOrderForAudit.cashReceiptNumber || "Nav norādīts"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A736E]">Kopējā summa:</span>
                  <span className="font-mono font-bold text-[#2A2624]">
                    € {selectedOrderForAudit.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A736E]">Filiāle:</span>
                  <span>{selectedOrderForAudit.storeBranch}</span>
                </div>
              </div>

              {/* Klienta paraksts */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A736E]">
                  Klienta paraksta fiksācija:
                </label>
                <div className="border border-[#E5DFD5] rounded-xl bg-white p-3 text-center">
                  <div className="text-xs text-[#606C5A] font-semibold flex items-center justify-center gap-1.5 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Parakstīts uz ekrāna pieņemšanas brīdī
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForAudit(null)}
                className="w-full py-2 bg-[#2A2624] text-white rounded-xl text-xs font-semibold"
              >
                Aizvērt
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
