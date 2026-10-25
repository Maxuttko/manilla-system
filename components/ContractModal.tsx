"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Copy,
  Clock,
  User,
  Package,
  Store,
} from "lucide-react";
import { OrderData } from "./OrderCard";
import jsPDF from "jspdf";
import { toJpeg } from "html-to-image";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
}

export function ContractModal({ isOpen, onClose, order }: ContractModalProps) {
  const contractRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Izgūstam klienta parakstu no auditLogs vai kā noklusējumu
  const signatureLog = order.auditLogs?.find((l) => l.signatureDataUrl);
  const signatureUrl = signatureLog?.signatureDataUrl || null;

  // Drukas funkcija izmantojot pārlūka print
  const handlePrint = () => {
    window.print();
  };

  // PDF lejupielādes funkcija ar optimizētu izmēru (JPEG kompresija, ~250KB vietā 5MB)
  const handleDownloadPdf = async () => {
    if (!contractRef.current) return;
    try {
      setDownloading(true);
      const element = contractRef.current;
      
      const dataUrl = await toJpeg(element, {
        quality: 0.88,
        pixelRatio: 1.5,
        backgroundColor: "#FFFFFF",
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 8; // 8mm tīra mala
      const printWidth = pdfWidth - margin * 2; // 194mm
      const maxHeight = pdfHeight - margin * 2; // 281mm

      const imgProps = pdf.getImageProperties(dataUrl);
      let calculatedHeight = (imgProps.height * printWidth) / imgProps.width;
      let calculatedWidth = printWidth;

      // Ja aprēķinātais augstums pārsniedz vienu A4 lapu, proporcionāli samazinām, lai ietilptu tieši 1 lapā
      if (calculatedHeight > maxHeight) {
        const ratio = maxHeight / calculatedHeight;
        calculatedWidth = calculatedWidth * ratio;
        calculatedHeight = maxHeight;
      }

      const offsetX = margin + (printWidth - calculatedWidth) / 2;
      const offsetY = margin;

      pdf.addImage(dataUrl, "JPEG", offsetX, offsetY, calculatedWidth, calculatedHeight, undefined, "FAST");
      pdf.save(`MANILLA_Ligums_${order.orderNumber.replace("#", "")}.pdf`);
    } catch (err) {
      console.error("Kļūda ģenerējot PDF:", err);
      alert("Neizdevās tiešā PDF lejupielāde. Lūdzu, izmantojiet pogu 'Drukāt (A4)' un izvēlieties 'Saglabāt kā PDF'.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/contract/${order.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pickupDate = new Date(order.agreedPickupTime);
  const createdDate = new Date(order.createdAt);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
      
      {/* Modālais ietvars */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E5DFD5] max-w-4xl w-full my-auto flex flex-col shadow-2xl overflow-hidden font-sans max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:bg-white print:m-0 print:p-0 print:w-full print:block">
        
        {/* Rīkjosla (Darbības pirms/pēc drukas) */}
        <div className="px-6 py-3.5 bg-white border-b border-[#E5DFD5] flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2A2624] text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-[#FAF8F5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-[#2A2624]">
                  Iesaiņošanas Līgums & Akts
                </span>
                <span className="font-mono text-xs font-bold text-[#B85D3E] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E5DFD5]">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-[11px] text-[#7A736E]">
                Oficiāls pieņemšanas-nodošanas dokuments ar klienta parakstu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Kopēt līguma saiti"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#2A2624] border border-[#E5DFD5] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#7A736E]" />
              <span>{copied ? "Nokopēts!" : "Kopēt saiti"}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#2A2624] text-[#2A2624] hover:text-white border border-[#E5DFD5] hover:border-[#2A2624] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs group"
            >
              <Download className="w-3.5 h-3.5 text-[#B85D3E] group-hover:text-white" />
              <span>{downloading ? "Ģenerē PDF..." : "Lejupielādēt PDF"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#B85D3E] hover:bg-[#9E4D32] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Drukāt (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#A39D98] hover:text-[#2A2624] hover:bg-[#ECE6DC] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ritināmais A4 Līguma saturs ar patīkamu apakšējo atkāpi */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-16 sm:pb-24 flex justify-center bg-[#EFECE6]/50 print:overflow-visible print:p-0 print:m-0 print:bg-white print:block">
          
          {/* A4 Papīra lapa */}
          <div
            ref={contractRef}
            id="printable-contract"
            className="w-full max-w-[760px] bg-white border border-[#E5DFD5] shadow-lg rounded-2xl p-6 sm:p-8 pb-8 sm:pb-12 text-[#2A2624] font-sans space-y-4 print:space-y-3 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none print:max-w-full print:w-full my-auto"
          >
            {/* 1. Līguma Galvene: Zīmols un Rekvizīti */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#2A2624] pb-3 print:pb-2.5">
              <div>
                <div className="mb-2">
                  <img
                    src="/manilla-logo.png"
                    alt="MANILLA"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="text-[11px] text-[#7A736E] leading-relaxed">
                  <span className="font-semibold text-[#2A2624]">SIA &ldquo;MANILLA&rdquo;</span> • Reģ. Nr.: 40103789012 • PVN Nr.: LV40103789012<br />
                  Filiāle: <span className="font-medium text-[#2A2624]">{order.storeBranch}</span><br />
                  Tālr.: +371 67280088 • E-pasts: info@manilla.lv • www.manilla.lv
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#B85D3E]">
                  Pakalpojuma Līgums - Akts
                </div>
                <div className="font-mono font-bold text-xl text-[#2A2624]">
                  {order.orderNumber}
                </div>
                <div className="text-[11px] text-[#7A736E] mt-0.5">
                  Datums: {createdDate.toLocaleDateString("lv-LV")} plkst. {createdDate.toLocaleTimeString("lv-LV", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-[11px] text-[#606C5A] font-semibold mt-0.5">
                  Statuss: {order.status === "IZSNIEGTS" ? "Izpildīts & Nodots" : "Pieņemts izpildei"}
                </div>
              </div>
            </div>

            {/* 2. Puses un Izpildes termiņš */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF8F5] p-3.5 print:p-2.5 rounded-xl border border-[#E5DFD5] text-xs">
              <div>
                <span className="text-xs font-bold text-[#7A736E] block mb-1">
                  1. Pasūtītājs (Klients):
                </span>
                <div className="font-bold text-sm text-[#2A2624]">
                  {order.customer.fullName}
                </div>
                <div className="text-[#2A2624] font-mono mt-0.5">
                  Tālr.: {order.customer.phone}
                </div>
                {order.customer.email && (
                  <div className="text-[#7A736E] mt-0.5">
                    E-pasts: {order.customer.email}
                  </div>
                )}
              </div>

              <div className="sm:border-l sm:border-[#ECE6DC] sm:pl-4">
                <span className="text-xs font-bold text-[#7A736E] block mb-1">
                  2. Izpildes Termiņš & Meistars:
                </span>
                <div className="font-bold text-sm text-[#B85D3E] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {pickupDate.toLocaleDateString("lv-LV")} plkst. {pickupDate.toLocaleTimeString("lv-LV", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="text-[#7A736E] mt-1">
                  Atbildīgais meistars: <span className="font-semibold text-[#2A2624]">{order.assignedUser?.fullName || "Manilla Meistars (Ieva Kalniņa)"}</span>
                </div>
                <div className="text-[#7A736E]">
                  Apmaksas statuss:{" "}
                  <span className="font-semibold text-[#2A2624]">
                    {order.paymentStatus === "APMAKSATS"
                      ? `Apmaksāts (${order.cashReceiptNumber ? (order.cashReceiptNumber.startsWith("Čeks") ? order.cashReceiptNumber : `Čeks #${order.cashReceiptNumber}`) : "Kasē"})`
                      : "Apmaksa pie saņemšanas"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Pieņemto preču un materiālu protokols */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#2A2624] flex items-center justify-between">
                <span>3. Pieņemto priekšmetu un iesaiņojuma protokols</span>
                <span className="text-[#7A736E] font-normal">Kopā: {order.gifts.length} dāvanas</span>
              </div>

              <table className="w-full text-left text-xs border border-[#E5DFD5] rounded-xl overflow-hidden">
                <thead className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[#7A736E] font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-2.5 w-8">Nr.</th>
                    <th className="py-2 px-2.5">Priekšmets & Izcelsme</th>
                    <th className="py-2 px-2.5">Stāvoklis pirms iesaiņošanas</th>
                    <th className="py-2 px-2.5">Izvēlētie materiāli</th>
                    <th className="py-2 px-2.5 text-right">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE6DC]">
                  {order.gifts.map((gift, idx) => {
                    const giftMaterialsTotal = (gift.materials || []).reduce(
                      (sum, m) => sum + m.subtotal,
                      0
                    );

                    return (
                      <tr key={gift.id || idx} className="align-top">
                        <td className="py-2 px-2.5 font-mono font-bold text-[#7A736E]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2.5">
                          <div className="font-bold text-[#2A2624]">{gift.title}</div>
                          <div className="text-[10px] text-[#7A736E] mt-0.5">
                            {gift.isThirdParty ? (
                              <span className="text-[#B85D3E] font-semibold">Ārpus Manilla prece</span>
                            ) : (
                              <span>Manilla veikala prece</span>
                            )}
                          </div>
                          {gift.photoUrl && (
                            <div className="mt-1 w-12 h-9 rounded border border-[#E5DFD5] overflow-hidden bg-[#FAF8F5] shrink-0">
                              <img
                                src={gift.photoUrl}
                                alt={gift.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2.5 max-w-[190px]">
                          {gift.conditionNotes && gift.conditionNotes.trim().length > 0 ? (
                            <div className="text-[10px] text-[#B85D3E] bg-[#F7EBE7] p-1.5 rounded-lg border border-[#B85D3E]/20">
                              <span className="font-bold block">Fiksētas nepilnības:</span>
                              {gift.conditionNotes}
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#606C5A] font-medium">
                              ✓ Vizuālu bojājumu nav. Teicamā stāvoklī.
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-[10px] space-y-0.5">
                          {gift.materials && gift.materials.length > 0 ? (
                            gift.materials.map((m, mIdx) => (
                              <div key={mIdx} className="text-[#7A736E] flex justify-between gap-2">
                                <span>• {m.material.name} ({m.quantity} {m.material.unit === "METRS" ? "m" : "gab."})</span>
                                <span className="font-mono text-[#2A2624]">€ {m.subtotal.toFixed(2)}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[#A39D98]">Materiāli nav fiksēti</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-[#2A2624]">
                          € {giftMaterialsTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4. Finanšu kopsavilkums */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5] space-y-1 text-xs">
                <div className="flex justify-between text-[#7A736E]">
                  <span>Materiālu pašizmaksa:</span>
                  <span className="font-mono text-[#2A2624]">€ {order.materialsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#7A736E]">
                  <span>Iesaiņošanas darba samaksa:</span>
                  <span className="font-mono text-[#2A2624]">€ {order.laborCost.toFixed(2)}</span>
                </div>
                {order.provisionalLimit && (
                  <div className="flex justify-between text-[#B85D3E] font-semibold pt-1 border-t border-[#ECE6DC]">
                    <span>Saskaņotais budžeta limits:</span>
                    <span className="font-mono">Līdz € {order.provisionalLimit.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t-2 border-[#2A2624] text-[#2A2624]">
                  <span>Kopā apmaksai:</span>
                  <span className="font-mono text-[#B85D3E]">€ {order.totalPrice.toFixed(2)}</span>
                </div>
                {order.paymentStatus === "APMAKSATS" && order.cashReceiptNumber && (
                  <div className="flex justify-between text-[11px] text-[#606C5A] font-semibold pt-1 border-t border-[#ECE6DC]">
                    <span>Kases čeks (VID):</span>
                    <span className="font-mono">{order.cashReceiptNumber.startsWith("Čeks") ? order.cashReceiptNumber : `Čeks #${order.cashReceiptNumber}`}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Juridiskie noteikumi */}
            <div className="border-t border-[#E5DFD5] pt-2.5 text-[9.5px] text-[#7A736E] leading-relaxed space-y-0.5">
              <div className="font-bold text-[#2A2624] uppercase tracking-wider">
                Līguma un Pakalpojuma Noteikumi:
              </div>
              <p>
                1. Pasūtītājs apliecina, ka nodotie priekšmeti ir viņa personīgā manta un iepriekš protokolētais vizuālais stāvoklis atbilst patiesībai.
              </p>
              <p>
                2. SIA &ldquo;MANILLA&rdquo; apņemas veikt dāvanu iesaiņošanu ar vislielāko rūpību un profesionalitāti, izmantojot klienta apstiprinātos materiālus.
              </p>
              <p>
                3. Gatavie pasūtījumi tiek uzglabāti bez maksas 30 kalendārās dienas no SMS paziņojuma nosūtīšanas brīža.
              </p>
            </div>

            {/* 6. Parakstu Bloks */}
            <div className="border-t-2 border-[#2A2624] pt-3">
              <div className="grid grid-cols-2 gap-8 items-end">
                
                {/* Izpildītājs */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-[#2A2624]">
                    Izpildītājs (SIA &ldquo;MANILLA&rdquo; vārdā):
                  </div>
                  <div className="border-b border-[#2A2624] pb-1 font-serif italic text-xs text-[#2A2624] h-12 flex items-end">
                    {order.assignedUser?.fullName || "Ieva Kalniņa"}
                  </div>
                  <div className="text-[10px] text-[#7A736E]">
                    Atbildīgais meistars
                  </div>
                </div>

                {/* Pasūtītājs ar DZĪVO PARAKSTU */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-[#2A2624]">
                    Pasūtītājs (Klienta paraksts):
                  </div>
                  
                  {/* Dzīvā skārienjutīgā paraksta attēls */}
                  <div className="border-b border-[#2A2624] pb-1 h-14 print:h-11 flex items-center justify-center bg-[#FAF8F5]/50 rounded-t-lg">
                    {signatureUrl ? (
                      <img
                        src={signatureUrl}
                        alt="Klienta paraksts"
                        className="max-h-12 print:max-h-9 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-[10px] text-[#606C5A] font-semibold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Elektroniski apstiprināts uz planšetes</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-[10px] text-[#7A736E] text-right font-medium">
                    {order.customer.fullName}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
