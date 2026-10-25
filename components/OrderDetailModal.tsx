"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Store,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Printer,
  ArrowRight,
  ShieldCheck,
  FileText,
  ZoomIn,
  Maximize2,
  Layers,
  ChevronRight,
  Barcode,
  ScanBarcode,
  Check,
  Copy,
} from "lucide-react";
import { OrderData } from "./OrderCard";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
  onStatusChange: (orderId: string, nextStatus: string) => void;
  onPrintTag: (order: OrderData) => void;
  onViewContract?: (order: OrderData) => void;
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onStatusChange,
  onPrintTag,
  onViewContract,
}: OrderDetailModalProps) {
  // Stāvoklis fotogrāfijas palielināšanai (Lightbox)
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string } | null>(null);

  // Stāvoklis pilnajai materiālu specifikācijai
  const [selectedMaterialsGift, setSelectedMaterialsGift] = useState<{
    title: string;
    giftIndex: number;
    materials: OrderData["gifts"][0]["materials"];
  } | null>(null);

  // Komplektēšanas atzīmes meistaram (paņemtie materiāli darbnīcā)
  const [pickedMaterials, setPickedMaterials] = useState<Record<string, boolean>>({});
  // Svītrkoda kopēšanas paziņojums
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

  // Multi-dāvanu neatkarīga pabeigšana
  const [giftCompletedMap, setGiftCompletedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (order?.gifts) {
      const map: Record<string, boolean> = {};
      order.gifts.forEach((g) => {
        if (g.id) map[g.id] = !!g.isCompleted;
      });
      setGiftCompletedMap(map);
    }
  }, [order]);

  const handleToggleGiftCompletion = async (giftId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setGiftCompletedMap((prev) => ({ ...prev, [giftId]: newVal }));
    try {
      const res = await fetch(`/api/orders/${order?.id}/gifts/${giftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newVal }),
      });
      if (!res.ok) {
        setGiftCompletedMap((prev) => ({ ...prev, [giftId]: currentVal }));
      }
    } catch {
      setGiftCompletedMap((prev) => ({ ...prev, [giftId]: currentVal }));
    }
  };

  const handleTogglePicked = (itemKey: string) => {
    setPickedMaterials((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const handleCopyBarcode = (e: React.MouseEvent, barcode: string) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(barcode);
      setCopiedBarcode(barcode);
      setTimeout(() => setCopiedBarcode(null), 2000);
    }
  };

  const resolveMaterialCode = (m: OrderData["gifts"][0]["materials"][0], idx: number) => {
    if (m.material.code) return m.material.code;
    const name = (m.material.name || "").toLowerCase();
    if (name.includes("chiyogami")) return "MNL-PAP-01";
    if (name.includes("botanica")) return "MNL-PAP-02";
    if (name.includes("kraft")) return "MNL-PAP-03";
    if (name.includes("marmora") || name.includes("terakota")) return "MNL-PAP-04";
    if (name.includes("samts")) return "MNL-LEN-04";
    if (name.includes("zīdains") || name.includes("satīns")) return "MNL-LEN-03";
    if (name.includes("lina lente")) return "MNL-LEN-01";
    if (name.includes("kaste")) return "MNL-BOX-M";
    if (name.includes("zīdpapīrs")) return "MNL-ZID-01";
    if (name.includes("zīmogs")) return "MNL-DEC-02";
    return `MNL-MAT-0${idx + 1}`;
  };

  const resolveMaterialBarcode = (m: OrderData["gifts"][0]["materials"][0], idx: number) => {
    if (m.material.barcode) return m.material.barcode;
    const name = (m.material.name || "").toLowerCase();
    if (name.includes("chiyogami")) return "475001000101";
    if (name.includes("botanica")) return "475001000102";
    if (name.includes("kraft")) return "475001000103";
    if (name.includes("marmora") || name.includes("terakota")) return "475001000104";
    if (name.includes("samts")) return "475001000204";
    if (name.includes("zīdains") || name.includes("satīns")) return "475001000203";
    if (name.includes("lina lente")) return "475001000201";
    if (name.includes("kaste")) return "475001000302";
    if (name.includes("zīdpapīrs")) return "475001000401";
    if (name.includes("zīmogs")) return "475001000502";
    return `475001000${10 + idx}`;
  };

  const resolveCategoryBadge = (category?: string, name?: string) => {
    const cat = (category || "").toUpperCase();
    const n = (name || "").toLowerCase();
    if (cat === "PAPIRS" || n.includes("papīrs") || n.includes("botanica") || n.includes("chiyogami") || n.includes("kraft")) {
      return { label: "Papīrs", color: "bg-[#FAF8F5] text-[#2A2624] border-[#E5DFD5]" };
    }
    if (cat === "LENTE" || n.includes("lente") || n.includes("samts") || n.includes("satīns")) {
      return { label: "Lente", color: "bg-[#FDF2EE] text-[#B85D3E] border-[#B85D3E]/30" };
    }
    if (cat === "ZIDPAPIRS" || n.includes("zīdpapīrs")) {
      return { label: "Zīdpapīrs", color: "bg-[#FAF8F5] text-[#7A736E] border-[#E5DFD5]" };
    }
    if (cat === "KASTE" || n.includes("kaste")) {
      return { label: "Kaste", color: "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/30" };
    }
    if (cat === "DEKORS" || n.includes("zīmogs") || n.includes("dekors")) {
      return { label: "Dekors", color: "bg-[#F7EBE7] text-[#B85D3E] border-[#B85D3E]/30" };
    }
    return { label: "Materiāls", color: "bg-[#FAF8F5] text-[#7A736E] border-[#E5DFD5]" };
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxPhoto) {
          setLightboxPhoto(null);
        } else if (selectedMaterialsGift) {
          setSelectedMaterialsGift(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, lightboxPhoto, selectedMaterialsGift]);

  if (!isOpen || !order) return null;

  const pickupDate = new Date(order.agreedPickupTime);
  const now = new Date();
  const isOverdue = pickupDate < now && order.status !== "IZSNIEGTS";

  const statusMap: Record<string, { label: string; color: string; border: string }> = {
    PIENEMTS: {
      label: "1. Pieņemts rindā",
      color: "bg-[#F7EBE7] text-[#B85D3E]",
      border: "border-[#B85D3E]/30",
    },
    IESAINOSANA: {
      label: "2. Iesaiņošanā",
      color: "bg-[#FDF6E8] text-[#D99B26]",
      border: "border-[#D99B26]/30",
    },
    GATAVS: {
      label: "3. Gatavs saņemšanai",
      color: "bg-[#EEF2EC] text-[#606C5A]",
      border: "border-[#606C5A]/30",
    },
    IZSNIEGTS: {
      label: "4. Izsniegts & Arhivēts",
      color: "bg-[#FAF8F5] text-[#7A736E]",
      border: "border-[#E5DFD5]",
    },
  };

  const currentStatusInfo = statusMap[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-800",
    border: "border-gray-200",
  };

  return (
    <div
      data-testid="order-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-[#E5DFD5] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Galvene */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5DFD5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B85D3E] text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-bold text-lg text-[#2A2624]">
                  {order.orderNumber}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatusInfo.color} ${currentStatusInfo.border}`}
                >
                  {currentStatusInfo.label}
                </span>
              </div>
              <p className="text-xs text-[#7A736E] flex items-center gap-2 mt-0.5">
                <Store className="w-3.5 h-3.5 text-[#B85D3E]" />
                <span>{order.storeBranch}</span>
                <span>•</span>
                <span>Reģistrēts: {new Date(order.createdAt).toLocaleString("lv-LV")}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewContract?.(order)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#2A2624] text-[#2A2624] hover:text-white border border-[#E5DFD5] hover:border-[#2A2624] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs group"
              title="Apskatīt un lejupielādēt oficiālo līgumu ar parakstu"
            >
              <FileText className="w-3.5 h-3.5 text-[#B85D3E] group-hover:text-white" />
              <span>Līgums (PDF)</span>
            </button>
            <button
              onClick={() => onPrintTag(order)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#2A2624] border border-[#E5DFD5] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#7A736E]" />
              <span>Drukāt birku</span>
            </button>
            <button
              onClick={onClose}
              data-testid="detail-modal-close-icon"
              className="p-2 text-[#A39D98] hover:text-[#2A2624] hover:bg-[#ECE6DC] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Saturs - Ritināms */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Rinda: Klients un Izpildes termiņš */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Klienta dati */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#7A736E] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Klienta informācija</span>
              </div>
              <div className="text-sm font-bold text-[#2A2624]">
                {order.customer.fullName}
              </div>
              <div className="text-xs text-[#2A2624] flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B85D3E]" />
                <span className="font-mono">{order.customer.phone}</span>
              </div>
              {order.customer.email && (
                <div className="text-xs text-[#7A736E] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#A39D98]" />
                  <span>{order.customer.email}</span>
                </div>
              )}
            </div>

            {/* Termiņš un Apmaksa */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#7A736E] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Termiņš & Apmaksa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7A736E]">Solītais gatavības laiks:</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${
                    isOverdue
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-[#FDF6E8] text-[#D99B26] border-[#D99B26]/30"
                  }`}
                >
                  {pickupDate.toLocaleString("lv-LV", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isOverdue && " (Kavējas)"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7A736E]">Apmaksas statuss:</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${
                    order.paymentStatus === "APMAKSATS"
                      ? "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/30"
                      : "bg-[#F7EBE7] text-[#B85D3E] border-[#B85D3E]/30"
                  }`}
                >
                  {order.paymentStatus === "APMAKSATS" ? "Apmaksāts uzreiz" : "Apmaksa pie saņemšanas"}
                </span>
              </div>

              {order.cashReceiptNumber && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7A736E]">Kases čeka numurs:</span>
                  <span className="font-mono font-bold text-[#606C5A] bg-white px-2 py-0.5 rounded border border-[#E5DFD5]">
                    {order.cashReceiptNumber}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* 2. Dāvanu saraksts (Pre-wrapping foto & Bojājumu fiksācija) */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#2A2624] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#B85D3E]" />
                <span>Pieņemtie priekšmeti & Materiāli ({order.gifts.length})</span>
              </div>
              {order.gifts.length > 1 && (
                <span className="text-[11px] font-normal text-[#606C5A] bg-[#EEF2EC] px-2.5 py-0.5 rounded-full border border-[#606C5A]/30">
                  Iesaiņotas {order.gifts.filter(g => g.id ? giftCompletedMap[g.id] : g.isCompleted).length} no {order.gifts.length}
                </span>
              )}
            </h3>

            <div className="space-y-4">
              {order.gifts.map((gift, idx) => {
                const isGiftDone = gift.id ? !!giftCompletedMap[gift.id] : !!gift.isCompleted;

                return (
                <div
                  key={gift.id || idx}
                  className="bg-[#FAF8F5]/60 rounded-2xl border border-[#E5DFD5] p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#ECE6DC] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#2A2624] text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-sm text-[#2A2624]">
                        {gift.title}
                      </span>
                      {gift.isThirdParty && (
                        <span className="text-[10px] bg-white text-[#7A736E] border border-[#E5DFD5] px-2 py-0.5 rounded-full font-medium">
                          Ārpus Manilla prece
                        </span>
                      )}
                    </div>

                    {/* Meistara pabeigšanas atzīme konkrētajai dāvanai */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => gift.id && handleToggleGiftCompletion(gift.id, isGiftDone)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                          isGiftDone
                            ? "bg-[#EEF2EC] hover:bg-[#E2EBE0] text-[#606C5A] border border-[#606C5A]/40"
                            : "bg-white hover:bg-[#FAF8F5] text-[#7A736E] hover:text-[#2A2624] border border-[#E5DFD5] hover:border-[#B85D3E]/40"
                        }`}
                        title={isGiftDone ? "Dāvana atzīmēta kā iesaiņota. Klikšķiniet, lai atceltu." : "Atzīmēt šo dāvanu kā pabeigtu"}
                      >
                        {isGiftDone ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#606C5A]" />
                            <span>Iesaiņota (Pabeigta)</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-[#A39D98]" />
                            <span>Atzīmēt kā iesaiņotu</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    
                    {/* Foto apskate */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-[#7A736E]">
                          Fiksētā fotogrāfija:
                        </span>
                        {gift.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setLightboxPhoto({ url: gift.photoUrl!, title: gift.title })}
                            className="text-[10px] text-[#B85D3E] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                            title="Atvērt fotogrāfiju pilnā izmērā"
                          >
                            <ZoomIn className="w-3 h-3" />
                            <span>Palielināt</span>
                          </button>
                        )}
                      </div>
                      {gift.photoUrl ? (
                        <div
                          onClick={() => setLightboxPhoto({ url: gift.photoUrl!, title: gift.title })}
                          className="relative group overflow-hidden rounded-xl border border-[#E5DFD5] bg-white cursor-pointer transition-all hover:border-[#B85D3E] hover:shadow-md"
                          title="Noklikšķiniet, lai atvērtu pilna izmēra fotogrāfiju"
                        >
                          <img
                            src={gift.photoUrl}
                            alt={gift.title}
                            className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[1px]">
                            <Maximize2 className="w-4 h-4" />
                            <span>Atvērt pilnā izmērā</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-36 rounded-xl border border-dashed border-[#E5DFD5] bg-white flex flex-col items-center justify-center text-[#A39D98] text-xs">
                          <Package className="w-6 h-6 mb-1" />
                          <span>Foto nav pievienots</span>
                        </div>
                      )}
                    </div>

                    {/* Bojājumu un stāvokļa piezīmes */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-semibold text-[#7A736E]">
                        Priekšmeta stāvokļa piezīmes:
                      </span>
                      <div className="p-3 bg-white rounded-xl border border-[#E5DFD5] min-h-[144px] text-xs flex flex-col justify-between">
                        {gift.conditionNotes && gift.conditionNotes.trim().length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-[#D99B26] font-semibold">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              <span>Fiksētas vizuālas nepilnības:</span>
                            </div>
                            <p className="text-[#2A2624] leading-relaxed">
                              {gift.conditionNotes}
                            </p>
                          </div>
                        ) : (
                          <div className="text-[#606C5A] flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Vizuālu bojājumu nav. Teicamā stāvoklī.</span>
                          </div>
                        )}
                        <span className="text-[10px] text-[#A39D98] border-t border-[#ECE6DC] pt-1">
                          Fiksēts klienta klātbūtnē
                        </span>
                      </div>
                    </div>

                    {/* Izvēlētie materiāli šai dāvanai */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-[#7A736E]">
                          Iesaiņošanas materiāli:
                        </span>
                        {gift.materials && gift.materials.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMaterialsGift({
                                title: gift.title,
                                giftIndex: idx + 1,
                                materials: gift.materials,
                              })
                            }
                            className="text-[10px] text-[#B85D3E] hover:text-[#A24E32] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                            title="Atvērt pilno materiālu specifikāciju"
                          >
                            <Layers className="w-3 h-3" />
                            <span>Pilns saraksts ({gift.materials.length})</span>
                          </button>
                        )}
                      </div>

                      <div
                        onClick={() => {
                          if (gift.materials && gift.materials.length > 0) {
                            setSelectedMaterialsGift({
                              title: gift.title,
                              giftIndex: idx + 1,
                              materials: gift.materials,
                            });
                          }
                        }}
                        className={`p-3 bg-white rounded-xl border border-[#E5DFD5] min-h-[144px] text-xs space-y-2 flex flex-col justify-between transition-all ${
                          gift.materials && gift.materials.length > 0
                            ? "cursor-pointer hover:border-[#B85D3E]/60 hover:shadow-xs group"
                            : ""
                        }`}
                        title={
                          gift.materials && gift.materials.length > 0
                            ? "Noklikšķiniet, lai atvērtu pilno materiālu sarakstu ar cenām"
                            : undefined
                        }
                      >
                        {gift.materials && gift.materials.length > 0 ? (
                          <>
                            <div className="space-y-2">
                              {gift.materials.map((m, mIdx) => {
                                const code = resolveMaterialCode(m, mIdx);
                                return (
                                  <div
                                    key={mIdx}
                                    className="flex items-center justify-between gap-1.5 pb-1 border-b border-[#ECE6DC] last:border-0 last:pb-0"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {m.material.swatchColor && (
                                        <span
                                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                                          style={{ backgroundColor: m.material.swatchColor }}
                                        />
                                      )}
                                      <span className="truncate text-[#2A2624] font-medium group-hover:text-[#B85D3E] transition-colors">
                                        {m.material.name}
                                      </span>
                                      <span className="font-mono text-[9px] font-bold text-[#7A736E] bg-[#FAF8F5] px-1 py-0.2 rounded border border-[#E5DFD5] shrink-0">
                                        {code}
                                      </span>
                                    </div>
                                    <div className="text-right shrink-0 font-mono text-[#7A736E] text-[11px]">
                                      {m.quantity} {m.material.unit === "METRS" ? "m" : "gab."} • € {m.subtotal.toFixed(2)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="pt-2 border-t border-[#ECE6DC] flex items-center justify-between text-[11px] text-[#B85D3E] font-medium group-hover:underline">
                              <span className="flex items-center gap-1.5">
                                <Barcode className="w-3.5 h-3.5" />
                                <span>Meistara darba lapa & svītrkodi</span>
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-[#A39D98]">
                            Materiāli nav piesaistīti
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* 3. Izmaksu aprēķins un Klienta Paraksts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Finanšu sadalījums */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#7A736E] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Izmaksu sadalījums</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7A736E]">Materiālu pašizmaksa:</span>
                  <span className="font-mono text-[#2A2624]">€ {order.materialsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A736E]">Meistara darba samaksa:</span>
                  <span className="font-mono text-[#2A2624]">€ {order.laborCost.toFixed(2)}</span>
                </div>
                {order.provisionalLimit && (
                  <div className="flex justify-between text-[#B85D3E]">
                    <span>Klienta saskaņotais limits:</span>
                    <span className="font-mono font-bold">Līdz € {order.provisionalLimit.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#ECE6DC] font-bold text-sm">
                  <span className="text-[#2A2624]">Kopējā summa:</span>
                  <span className="font-mono text-[#B85D3E]">€ {order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Klienta digitālais paraksts */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#7A736E] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#606C5A]" />
                <span>Klienta paraksts</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#606C5A]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Elektroniski parakstīts uz planšetes</span>
                </div>
                <p className="text-[11px] text-[#7A736E]">
                  Klients saskaņojis preču stāvokli, iesaiņošanas materiālus un izmaksas.
                </p>
                <button
                  type="button"
                  onClick={() => onViewContract?.(order)}
                  className="w-full mt-2 py-2 bg-[#FAF8F5] hover:bg-[#2A2624] text-[#2A2624] hover:text-white border border-[#E5DFD5] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs group/b"
                >
                  <FileText className="w-3.5 h-3.5 text-[#B85D3E] group-hover/b:text-white transition-colors" />
                  <span>Apskatīt / Lejupielādēt Līgumu (PDF)</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Kājene ar darbībām */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between">
          <button
            onClick={onClose}
            data-testid="detail-modal-close-btn"
            className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#2A2624] border border-[#E5DFD5] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Aizvērt
          </button>

          {/* Dinamiska statusa maiņa no modāļa */}
          {order.status === "PIENEMTS" && (
            <button
              onClick={() => {
                onStatusChange(order.id, "IESAINOSANA");
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B85D3E] hover:bg-[#9E4D32] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span>Sākt iesaiņošanu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {order.status === "IESAINOSANA" && (
            <button
              onClick={() => {
                onStatusChange(order.id, "GATAVS");
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#606C5A] hover:bg-[#4E5849] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pabeigt & Izsūtīt SMS</span>
            </button>
          )}

          {order.status === "GATAVS" && (
            <button
              onClick={() => {
                onStatusChange(order.id, "IZSNIEGTS");
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B85D3E] hover:bg-[#9E4D32] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Izsniegt klientam</span>
            </button>
          )}

          {order.status === "IZSNIEGTS" && (
            <span className="text-xs text-[#7A736E] italic">
              Pasūtījums ir pabeigts un nodots arhīvā
            </span>
          )}
        </div>

      </div>

      {/* 1. Fotogrāfijas palielināšanas Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center bg-[#1A1816] rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox galvene */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-white">
              <div>
                <h4 className="font-heading font-bold text-base text-[#FAF8F5]">
                  {lightboxPhoto.title}
                </h4>
                <p className="text-xs text-[#A39D98]">
                  Pasūtījums {order.orderNumber} • Fiksētā fotogrāfija pirms iesaiņošanas
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Aizvērt fotogrāfiju (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lielā bilde */}
            <div className="relative overflow-hidden rounded-2xl max-h-[75vh] w-full flex items-center justify-center bg-black/50 p-2">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                className="max-h-[72vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Pilnais materiālu specifikācijas modālis meistaram */}
      {selectedMaterialsGift && (
        <div
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 font-sans"
          onClick={() => setSelectedMaterialsGift(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl border border-[#E5DFD5] shadow-2xl p-6 space-y-4 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Galvene */}
            <div className="flex items-start justify-between border-b border-[#ECE6DC] pb-4 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#F7EBE7] text-[#B85D3E] flex items-center justify-center font-bold shadow-2xs border border-[#B85D3E]/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-lg text-[#2A2624]">
                      Iesaiņošanas Materiāli & Meistara Specifikācija
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2EC] text-[#606C5A] border border-[#606C5A]/30 uppercase tracking-wider">
                      Darba Lapa
                    </span>
                  </div>
                  <p className="text-xs text-[#7A736E] mt-0.5">
                    Dāvana #{selectedMaterialsGift.giftIndex}: <strong className="text-[#2A2624]">{selectedMaterialsGift.title}</strong> • Pasūtījums <span className="font-mono font-semibold text-[#B85D3E]">{order.orderNumber}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMaterialsGift(null)}
                className="p-2 rounded-xl hover:bg-[#FAF8F5] text-[#7A736E] hover:text-[#2A2624] border border-[#E5DFD5] transition-colors cursor-pointer"
                title="Aizvērt (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meistara noliktavas & skenēšanas vadlīnija */}
            <div className="px-4 py-2.5 bg-[#FAF8F5] rounded-2xl border border-[#E5DFD5] flex flex-wrap items-center justify-between text-xs text-[#7A736E] gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <ScanBarcode className="w-4 h-4 text-[#B85D3E] shrink-0" />
                <span>
                  <strong>Meistara ateljē galds:</strong> Verificējiet produkta artikulu un noskenējiet svītrkodu pirms lentas griešanas vai papīra locīšanas.
                </span>
              </div>
              <span className="text-[10.5px] font-semibold text-[#606C5A] bg-[#EEF2EC] px-2 py-0.5 rounded-lg border border-[#606C5A]/20">
                Svītrkodu skenera atbalsts aktīvs
              </span>
            </div>

            {/* Materiālu saraksts tabulā ar pilniem nosaukumiem, artikuliem un svītrkodiem */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E5DFD5] text-[#A39D98] text-[10.5px] uppercase font-bold text-left sticky top-0 bg-white z-10">
                    <th className="py-2.5 pl-2">Materiāls & Artikuls</th>
                    <th className="py-2.5">Svītrkods (EAN-13)</th>
                    <th className="py-2.5 text-center">Daudzums</th>
                    <th className="py-2.5 text-right">Cena</th>
                    <th className="py-2.5 text-right">Summa</th>
                    <th className="py-2.5 pr-2 text-right">Komplektēts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE6DC]">
                  {selectedMaterialsGift.materials.map((m, mIdx) => {
                    const unitPrice = m.quantity > 0 ? m.subtotal / m.quantity : 0;
                    const code = resolveMaterialCode(m, mIdx);
                    const barcode = resolveMaterialBarcode(m, mIdx);
                    const cat = resolveCategoryBadge(m.material.category, m.material.name);
                    const itemKey = `${order.id}-${selectedMaterialsGift.giftIndex}-${code}-${mIdx}`;
                    const isPicked = !!pickedMaterials[itemKey];

                    return (
                      <tr
                        key={mIdx}
                        className={`transition-colors ${
                          isPicked ? "bg-[#EEF2EC]/30 hover:bg-[#EEF2EC]/50" : "hover:bg-[#FAF8F5]"
                        }`}
                      >
                        {/* Materiāls, krāsa un Artikuls */}
                        <td className="py-3 pl-2 pr-3">
                          <div className="flex items-start gap-3">
                            {m.material.imageUrl ? (
                              <img
                                src={m.material.imageUrl}
                                alt={m.material.name}
                                className="w-9 h-9 rounded-xl object-cover border border-[#E5DFD5] shrink-0 shadow-2xs mt-0.5"
                              />
                            ) : m.material.swatchColor ? (
                              <span
                                className="w-9 h-9 rounded-xl border border-black/15 shrink-0 shadow-2xs flex items-center justify-center text-white/70 text-[9px] font-bold mt-0.5"
                                style={{ backgroundColor: m.material.swatchColor }}
                              >
                                {code.slice(-2)}
                              </span>
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] shrink-0 flex items-center justify-center text-[#7A736E] mt-0.5">
                                <Layers className="w-4 h-4" />
                              </div>
                            )}

                            <div className="space-y-1">
                              <span className="font-semibold text-[#2A2624] text-sm leading-snug block">
                                {m.material.name}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 font-mono text-[10.5px] font-bold text-[#2A2624] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E5DFD5]">
                                  ART: {code}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${cat.color}`}>
                                  {cat.label}
                                </span>
                                {m.material.inStock !== undefined && (
                                  <span className="text-[10px] text-[#A39D98]">
                                    Noliktavā: {m.material.inStock}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Svītrkods ar skenera atbalstu & kopēšanu */}
                        <td className="py-3 pr-3">
                          <div className="flex flex-col items-start gap-1">
                            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#2A2624] bg-[#FAF8F5] px-2.5 py-1.5 rounded-xl border border-[#E5DFD5] group/bc">
                              <Barcode className="w-4 h-4 text-[#7A736E]" />
                              <span className="tracking-wider">{barcode}</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyBarcode(e, barcode)}
                                className="ml-1 p-1 hover:bg-white rounded-md text-[#7A736E] hover:text-[#B85D3E] transition-colors cursor-pointer"
                                title="Kopēt svītrkodu starpliktuvei"
                              >
                                {copiedBarcode === barcode ? (
                                  <Check className="w-3.5 h-3.5 text-[#606C5A]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className="text-[9.5px] text-[#A39D98] flex items-center gap-1">
                              {copiedBarcode === barcode ? (
                                <span className="text-[#606C5A] font-semibold">Svītrkods nokopēts!</span>
                              ) : (
                                <span>EAN-13 • Skenēšanai</span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Daudzums ar meistara norādi */}
                        <td className="py-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono font-bold text-sm text-[#2A2624] px-2.5 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5]">
                              {m.quantity} {m.material.unit === "METRS" ? "m" : "gab."}
                            </span>
                            <span className="text-[10px] text-[#7A736E] mt-0.5">
                              {m.material.unit === "METRS"
                                ? `Piegriezt ${(m.quantity * 100).toFixed(0)} cm`
                                : m.material.unit === "LOKSNE"
                                ? "Loksne (50x70)"
                                : "1 vienība"}
                            </span>
                          </div>
                        </td>

                        {/* Vienības cena */}
                        <td className="py-3 text-right font-mono text-[#7A736E] text-xs">
                          € {unitPrice.toFixed(2)}
                        </td>

                        {/* Kopējā rindiņas summa */}
                        <td className="py-3 text-right font-mono font-bold text-[#B85D3E] text-xs">
                          € {m.subtotal.toFixed(2)}
                        </td>

                        {/* Komplektēšanas poga meistaram */}
                        <td className="py-3 pr-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleTogglePicked(itemKey)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isPicked
                                ? "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/40 shadow-2xs"
                                : "bg-white hover:bg-[#FAF8F5] text-[#7A736E] border-[#E5DFD5] hover:border-[#B85D3E]/40"
                            }`}
                          >
                            {isPicked ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Paņemts</span>
                              </>
                            ) : (
                              <>
                                <div className="w-3 h-3 rounded-sm border border-[#A39D98]" />
                                <span>Atzīmēt</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Apakšējā kopsavilkuma josla ar komplektēšanas progresu */}
            <div className="pt-3 border-t border-[#ECE6DC] flex flex-wrap items-center justify-between bg-[#FAF8F5] -mx-6 -mb-6 p-4 rounded-b-3xl shrink-0 gap-3">
              <div className="flex items-center gap-4 text-xs text-[#7A736E]">
                <div>
                  Pozīciju skaits: <strong className="text-[#2A2624]">{selectedMaterialsGift.materials.length}</strong>
                </div>
                <div className="w-[1px] h-4 bg-[#E5DFD5]" />
                <div className="flex items-center gap-1.5">
                  <span>Komplektēšana:</span>
                  {(() => {
                    const totalCount = selectedMaterialsGift.materials.length;
                    const pickedCount = selectedMaterialsGift.materials.filter((m, mIdx) => {
                      const code = resolveMaterialCode(m, mIdx);
                      const key = `${order.id}-${selectedMaterialsGift.giftIndex}-${code}-${mIdx}`;
                      return !!pickedMaterials[key];
                    }).length;
                    const isAllPicked = totalCount > 0 && pickedCount === totalCount;

                    return (
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md text-[11px] border ${
                          isAllPicked
                            ? "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/30"
                            : "bg-white text-[#7A736E] border-[#E5DFD5]"
                        }`}
                      >
                        {pickedCount} no {totalCount} paņemti
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#7A736E]">Materiālu summa:</span>
                <span className="font-mono font-bold text-base text-[#B85D3E]">
                  € {selectedMaterialsGift.materials.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMaterialsGift(null)}
                  className="px-4 py-2 bg-[#B85D3E] hover:bg-[#A24E32] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs ml-2"
                >
                  Gatavs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
