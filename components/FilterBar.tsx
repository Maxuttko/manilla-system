"use client";

import React from "react";
import { Search, LayoutGrid, List, AlertCircle, Sparkles } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  urgentOnly: boolean;
  onUrgentToggle: () => void;
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  stats: {
    total: number;
    pienemts: number;
    iesainosana: number;
    gatavs: number;
    izsniegts: number;
    urgent: number;
  };
}

export function FilterBar({
  search,
  onSearchChange,
  urgentOnly,
  onUrgentToggle,
  viewMode,
  onViewModeChange,
  selectedStatus,
  onStatusChange,
  stats,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Augšējā rinda: Meklēšana un pogas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Meklēšanas lauks */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7A736E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Meklēt pēc Nr. (#MNL-1042), klienta vai tālruņa..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-sm text-[#2A2624] placeholder-[#A39D98] focus:outline-none focus:border-[#B85D3E] focus:ring-2 focus:ring-[#B85D3E]/15 shadow-xs transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A39D98] hover:text-[#2A2624]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Labā puse: Steidzamo filtrs un Skata režīmi */}
        <div className="flex items-center gap-2.5">
          
          {/* Steidzamie šodien */}
          <button
            onClick={onUrgentToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              urgentOnly
                ? "bg-[#B85D3E] text-white border-[#B85D3E] shadow-sm"
                : "bg-white text-[#7A736E] border-[#E5DFD5] hover:bg-[#FAF8F5] hover:text-[#2A2624]"
            }`}
          >
            <AlertCircle className={`w-3.5 h-3.5 ${urgentOnly ? "text-white" : "text-[#B85D3E]"}`} />
            <span>Šodien izpildāmie</span>
            {stats.urgent > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  urgentOnly ? "bg-white/20 text-white" : "bg-[#F7EBE7] text-[#B85D3E]"
                }`}
              >
                {stats.urgent}
              </span>
            )}
          </button>

          {/* Skata pārslēgs: Kanban / Tabula */}
          <div className="flex items-center bg-white border border-[#E5DFD5] p-1 rounded-xl shadow-xs">
            <button
              onClick={() => onViewModeChange("kanban")}
              title="Kanban kolonnu dēlis (Meistara skats)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-[#FAF8F5] text-[#2A2624] font-semibold shadow-xs border border-[#E5DFD5]"
                  : "text-[#7A736E] hover:text-[#2A2624]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#B85D3E]" />
              <span className="hidden md:inline">Kanban</span>
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              title="Saraksta skats (Kases / Admina tabula)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#FAF8F5] text-[#2A2624] font-semibold shadow-xs border border-[#E5DFD5]"
                  : "text-[#7A736E] hover:text-[#2A2624]"
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#606C5A]" />
              <span className="hidden md:inline">Saraksts</span>
            </button>
          </div>

        </div>

      </div>

      {/* Apakšējā josla: Statusu ātrās cilnes */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { key: "all", label: "Visi pasūtījumi", count: stats.total },
          { key: "PIENEMTS", label: "1. Pieņemts", count: stats.pienemts, color: "border-[#B85D3E]" },
          { key: "IESAINOSANA", label: "2. Iesaiņošanā", count: stats.iesainosana, color: "border-[#D99B26]" },
          { key: "GATAVS", label: "3. Gatavs saņemšanai", count: stats.gatavs, color: "border-[#606C5A]" },
          { key: "IZSNIEGTS", label: "4. Izsniegts", count: stats.izsniegts, color: "border-[#A39D98]" },
        ].map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onStatusChange(tab.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? "bg-white text-[#2A2624] border-[#2A2624] font-semibold shadow-xs"
                  : "bg-white/60 text-[#7A736E] border-[#E5DFD5] hover:bg-white hover:text-[#2A2624]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                  isActive ? "bg-[#2A2624] text-white" : "bg-[#FAF8F5] text-[#7A736E] border border-[#E5DFD5]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
