"use client";

import React, { useState } from "react";
import { OrderCard, OrderData } from "./OrderCard";
import {
  Package,
  Sparkles,
  CheckCircle,
  Archive,
  ArrowRight,
  Clock,
  ArrowUpDown,
  ArrowDownAZ,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";

interface KanbanBoardProps {
  orders: OrderData[];
  onStatusChange: (orderId: string, nextStatus: string) => void;
  onPrintTag: (order: OrderData) => void;
  onViewDetails?: (order: OrderData) => void;
  onViewContract?: (order: OrderData) => void;
  onOpenArchive?: () => void;
}

type SortCriteria = "urgency" | "price" | "name";
type SortDirection = "asc" | "desc";

interface ColumnSort {
  by: SortCriteria;
  direction: SortDirection;
}

export function KanbanBoard({
  orders,
  onStatusChange,
  onPrintTag,
  onViewDetails,
  onViewContract,
  onOpenArchive,
}: KanbanBoardProps) {
  // Stāvoklis: vai kolonna ir izvērsta (parāda visas kartītes, nevis tikai 5)
  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});

  // Stāvoklis: vai kolonnas filtru panelis ir atvērts
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({});

  const toggleColumnFilter = (colId: string) => {
    setOpenFilters((prev) => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  // Kārtošanas/filtra stāvoklis katrai kolonnai atsevišķi
  const [colSorts, setColSorts] = useState<Record<string, ColumnSort>>({
    PIENEMTS: { by: "urgency", direction: "asc" },
    IESAINOSANA: { by: "urgency", direction: "asc" },
    GATAVS: { by: "urgency", direction: "asc" },
    IZSNIEGTS: { by: "urgency", direction: "asc" },
  });

  const toggleColumnExpanded = (colId: string) => {
    setExpandedCols((prev) => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  const handleSortChange = (colId: string, criteria: SortCriteria) => {
    setColSorts((prev) => {
      const current = prev[colId] || { by: "urgency", direction: "asc" };
      if (current.by === criteria) {
        // Mainām virzienu (asc <-> desc)
        return {
          ...prev,
          [colId]: {
            by: criteria,
            direction: current.direction === "asc" ? "desc" : "asc",
          },
        };
      }
      // Jauna kritērija izvēle (cenai noklusējums ir dārgākie vispirms desc)
      return {
        ...prev,
        [colId]: {
          by: criteria,
          direction: criteria === "price" ? "desc" : "asc",
        },
      };
    });
  };

  const sortOrders = (ordersList: OrderData[], sort: ColumnSort) => {
    return [...ordersList].sort((a, b) => {
      if (sort.by === "urgency") {
        const timeA = new Date(a.agreedPickupTime).getTime();
        const timeB = new Date(b.agreedPickupTime).getTime();
        return sort.direction === "asc" ? timeA - timeB : timeB - timeA;
      }
      if (sort.by === "name") {
        const nameA = a.customer.fullName.toLowerCase();
        const nameB = b.customer.fullName.toLowerCase();
        return sort.direction === "asc"
          ? nameA.localeCompare(nameB, "lv")
          : nameB.localeCompare(nameA, "lv");
      }
      if (sort.by === "price") {
        return sort.direction === "asc"
          ? a.totalPrice - b.totalPrice
          : b.totalPrice - a.totalPrice;
      }
      return 0;
    });
  };

  const columns = [
    {
      id: "PIENEMTS",
      title: "1. Pieņemts",
      subtitle: "Gaidīt rindā iesaiņošanai",
      icon: Package,
      badgeColor: "bg-[#F7EBE7] text-[#B85D3E] border-[#B85D3E]/20",
      columnBorder: "border-t-[#B85D3E]",
    },
    {
      id: "IESAINOSANA",
      title: "2. Iesaiņošanā",
      subtitle: "Meistara darba galds",
      icon: Sparkles,
      badgeColor: "bg-[#FDF6E8] text-[#D99B26] border-[#D99B26]/30",
      columnBorder: "border-t-[#D99B26]",
    },
    {
      id: "GATAVS",
      title: "3. Gatavs saņemšanai",
      subtitle: "SMS nosūtīts klientam",
      icon: CheckCircle,
      badgeColor: "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/30",
      columnBorder: "border-t-[#606C5A]",
    },
    {
      id: "IZSNIEGTS",
      title: "4. Izsniegts",
      subtitle: "Nodots & Apmaksāts",
      icon: Archive,
      badgeColor: "bg-[#FAF8F5] text-[#7A736E] border-[#E5DFD5]",
      columnBorder: "border-t-[#A39D98]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4.5 items-start font-sans">
      {columns.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.id);
        const Icon = col.icon;
        const isExpanded = !!expandedCols[col.id];
        const currentSort = colSorts[col.id] || { by: "urgency", direction: "asc" };

        // Sakārtotie pasūtījumi
        const sortedOrders = sortOrders(colOrders, currentSort);

        // Attēlojamie pasūtījumi: maksimāli 5 (vai visi, ja izvērsts), arhīvam 2
        const displayedOrders =
          col.id === "IZSNIEGTS"
            ? sortedOrders.slice(0, 2)
            : isExpanded
            ? sortedOrders
            : sortedOrders.slice(0, 5);

        const hasMoreThanFive = col.id !== "IZSNIEGTS" && colOrders.length > 5;

        return (
          <div
            key={col.id}
            className={`bg-[#FAF8F5]/80 rounded-2xl border border-[#E5DFD5] border-t-4 ${col.columnBorder} p-3.5 sm:p-4 min-h-[500px] flex flex-col gap-3 shadow-xs transition-all`}
          >
            {/* Kolonnas galvene */}
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE6DC] gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="w-4 h-4 text-[#7A736E] shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-sm text-[#2A2624] truncate">
                    {col.title}
                  </h3>
                  <p className="text-[10px] text-[#A39D98] -mt-0.5 truncate">{col.subtitle}</p>
                </div>
              </div>

              {/* Labā puse pretī nosaukumam: Arhīva poga vai "Atvērt visu sarakstu" */}
              {col.id === "IZSNIEGTS" ? (
                <button
                  type="button"
                  onClick={onOpenArchive}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2A2624] hover:bg-[#B85D3E] text-white rounded-xl text-[11px] font-bold shadow-xs hover:shadow-sm transition-all duration-200 transform active:scale-95 cursor-pointer shrink-0 group border border-[#1A1816]"
                  title="Atvērt pilno izsniegto pasūtījumu arhīvu"
                >
                  <Archive className="w-3.5 h-3.5 text-[#F9F6F0] shrink-0 group-hover:scale-105 transition-transform" />
                  <span className="tracking-wide">Arhīvs</span>
                  <span className="bg-white/25 text-white px-1.5 py-0.2 rounded-md text-[10.5px] font-mono font-bold">
                    {colOrders.length}
                  </span>
                  <ArrowRight className="w-3 h-3 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  data-testid={`toggle-expand-${col.id.toLowerCase()}`}
                  onClick={() => toggleColumnExpanded(col.id)}
                  disabled={colOrders.length === 0}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-2xs transition-all shrink-0 group ${
                    colOrders.length === 0
                      ? "bg-white/50 border border-[#E5DFD5] text-[#A39D98] cursor-default"
                      : "bg-white hover:bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#B85D3E]/50 text-[#B85D3E] cursor-pointer"
                  }`}
                  title={
                    colOrders.length === 0
                      ? "Pasūtījumu nav"
                      : isExpanded && colOrders.length > 5
                      ? "Rādīt tikai 5 kartītes"
                      : `Atvērt visu sarakstu (${colOrders.length} pasūtījumi)`
                  }
                >
                  <span>
                    {isExpanded && colOrders.length > 5
                      ? "Rādīt 5"
                      : `Atvērt visus (${colOrders.length})`}
                  </span>
                  {colOrders.length > 0 && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded && colOrders.length > 5 ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              )}
            </div>

            {/* Kolonnas filtra poga un izvēršamie filtri */}
            {col.id !== "IZSNIEGTS" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    data-testid={`toggle-filter-${col.id.toLowerCase()}`}
                    onClick={() => toggleColumnFilter(col.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                      openFilters[col.id]
                        ? "bg-[#FAF8F5] text-[#B85D3E] border-[#B85D3E]/40 shadow-2xs"
                        : currentSort.by !== "urgency"
                        ? "bg-[#FAF8F5] text-[#B85D3E] border-[#B85D3E]/30"
                        : "bg-white/70 hover:bg-white text-[#7A736E] hover:text-[#2A2624] border-[#E5DFD5]"
                    }`}
                    title="Atvērt / paslēpt kolonnas kārtošanas filtrus"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-[#B85D3E]" />
                    <span>Filtrs</span>
                    {currentSort.by !== "urgency" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B85D3E]" title="Filtrs ir aktīvs" />
                    )}
                    <ChevronDown
                      className={`w-3 h-3 text-[#A39D98] transition-transform duration-200 ${
                        openFilters[col.id] ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Ja filtrs ir sakļauts, bet nav pēc noklusējuma, parādām mazu indikatoru */}
                  {!openFilters[col.id] && currentSort.by !== "urgency" && (
                    <span className="text-[10px] text-[#B85D3E] font-medium bg-[#F7EBE7] px-1.5 py-0.5 rounded border border-[#B85D3E]/20">
                      {currentSort.by === "price"
                        ? `Cena (${currentSort.direction === "desc" ? "↓" : "↑"})`
                        : `Klients (${currentSort.direction === "desc" ? "Z-A" : "A-Z"})`}
                    </span>
                  )}
                </div>

                {/* Izvēršamais filtru panelis */}
                {openFilters[col.id] && (
                  <div className="flex items-center justify-between gap-1 bg-white border border-[#ECE6DC] px-2 py-1.5 rounded-xl text-[10.5px] animate-in fade-in slide-in-from-top-1 duration-150">
                    <span className="text-[#A39D98] font-bold uppercase tracking-wider text-[9px] shrink-0">
                      Kārtot:
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {/* 1. Srochnost / Termiņš */}
                      <button
                        type="button"
                        data-testid={`sort-urgency-${col.id.toLowerCase()}`}
                        onClick={() => handleSortChange(col.id, "urgency")}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                          currentSort.by === "urgency"
                            ? "bg-[#FAF8F5] text-[#B85D3E] border border-[#B85D3E]/40 shadow-2xs"
                            : "text-[#7A736E] hover:text-[#2A2624] hover:bg-white border border-transparent"
                        }`}
                        title="Kārtot pēc termiņa / steidzamības"
                      >
                        <Clock className="w-3 h-3 text-[#606C5A]" />
                        <span>Termiņš</span>
                      </button>

                      {/* 2. Cena */}
                      <button
                        type="button"
                        data-testid={`sort-price-${col.id.toLowerCase()}`}
                        onClick={() => handleSortChange(col.id, "price")}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                          currentSort.by === "price"
                            ? "bg-[#FAF8F5] text-[#B85D3E] border border-[#B85D3E]/40 shadow-2xs"
                            : "text-[#7A736E] hover:text-[#2A2624] hover:bg-white border border-transparent"
                        }`}
                        title="Kārtot pēc pasūtījuma summas (€)"
                      >
                        <ArrowUpDown className="w-3 h-3 text-[#B85D3E]" />
                        <span>Cena</span>
                        {currentSort.by === "price" && (
                          <span className="text-[9px] font-mono font-bold">
                            {currentSort.direction === "desc" ? "↓" : "↑"}
                          </span>
                        )}
                      </button>

                      {/* 3. Klienta vārds */}
                      <button
                        type="button"
                        data-testid={`sort-name-${col.id.toLowerCase()}`}
                        onClick={() => handleSortChange(col.id, "name")}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                          currentSort.by === "name"
                            ? "bg-[#FAF8F5] text-[#B85D3E] border border-[#B85D3E]/40 shadow-2xs"
                            : "text-[#7A736E] hover:text-[#2A2624] hover:bg-white border border-transparent"
                        }`}
                        title="Kārtot alfabētiski pēc klienta vārda"
                      >
                        <ArrowDownAZ className="w-3 h-3 text-[#7A736E]" />
                        <span>Klients</span>
                        {currentSort.by === "name" && (
                          <span className="text-[9px] font-mono font-bold">
                            {currentSort.direction === "desc" ? "Z-A" : "A-Z"}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pasūtījumu kartīšu saraksts */}
            <div className="flex flex-col gap-3 flex-1">
              {colOrders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#A39D98] border-2 border-dashed border-[#E5DFD5]/60 rounded-xl">
                  <p className="text-xs">Šajā statusā pasūtījumu nav</p>
                </div>
              ) : (
                <>
                  {displayedOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={onStatusChange}
                      onPrintTag={onPrintTag}
                      onViewDetails={onViewDetails}
                      onViewContract={onViewContract}
                    />
                  ))}

                  {/* Ja ir vairāk par 5 pasūtījumiem un saraksts nav atvērts: Poga apakšā */}
                  {col.id !== "IZSNIEGTS" && colOrders.length > 5 && !isExpanded && (
                    <button
                      type="button"
                      data-testid={`bottom-expand-${col.id.toLowerCase()}`}
                      onClick={() => toggleColumnExpanded(col.id)}
                      className="w-full py-2 px-3 bg-white hover:bg-[#FAF8F5] border border-dashed border-[#E5DFD5] hover:border-[#B85D3E]/40 rounded-xl text-xs font-bold text-[#B85D3E] flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
                    >
                      <span>+ vēl {colOrders.length - 5} pasūtījumi • Atvērt visu sarakstu</span>
                      <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  )}

                  {/* Ja ir izvērsts: Ērta aizvēršanas poga apakšā */}
                  {col.id !== "IZSNIEGTS" && colOrders.length > 5 && isExpanded && (
                    <button
                      type="button"
                      onClick={() => toggleColumnExpanded(col.id)}
                      className="w-full py-1.5 px-3 bg-white/70 hover:bg-white border border-[#E5DFD5] rounded-xl text-[11px] font-semibold text-[#7A736E] hover:text-[#2A2624] flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Rādīt mazāk (pirmos 5)</span>
                    </button>
                  )}

                  {/* Ja šī ir Izsniegts kolonna un ir vairāk par 2 pasūtījumiem, saite uz arhīvu */}
                  {col.id === "IZSNIEGTS" && colOrders.length > 2 && (
                    <div className="text-center py-1.5">
                      <button
                        type="button"
                        onClick={onOpenArchive}
                        className="text-[11px] text-[#7A736E] hover:text-[#B85D3E] font-medium transition-colors cursor-pointer hover:underline"
                      >
                        + vēl {colOrders.length - 2} pasūtījumi arhīvā
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
