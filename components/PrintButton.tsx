"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-1.5 px-4 py-2 bg-[#B85D3E] hover:bg-[#9E4D32] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
    >
      <Printer className="w-4 h-4" />
      <span>Drukāt Līgumu (A4 / PDF)</span>
    </button>
  );
}
