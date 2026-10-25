import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Clock, CheckCircle2, FileText } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractPage({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id).trim();
  const formattedNumber = decodedId.startsWith("#") ? decodedId : `#${decodedId}`;
  const unformattedNumber = decodedId.replace(/^#/, "");

  const order = await db.order.findFirst({
    where: {
      OR: [
        { id: decodedId },
        { id: id },
        { orderNumber: decodedId },
        { orderNumber: formattedNumber },
        { orderNumber: unformattedNumber },
      ],
    },
    include: {
      customer: true,
      assignedUser: true,
      gifts: {
        include: {
          materials: {
            include: {
              material: true,
            },
          },
        },
      },
      auditLogs: {
        orderBy: { timestamp: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const signatureLog = order.auditLogs.find((l) => l.signatureDataUrl);
  const signatureUrl = signatureLog?.signatureDataUrl || null;
  const pickupDate = new Date(order.agreedPickupTime);
  const createdDate = new Date(order.createdAt);

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8 pb-16 sm:pb-24 font-sans text-[#2A2624] print:min-h-0 print:bg-white print:p-0">
      {/* Augšējā josla (tikai drukāšanai / saglabāšanai, bez jebkādām saitēm uz iekšējo CRM sistēmu) */}
      <div className="max-w-[760px] mx-auto mb-4 sm:mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2 text-xs font-medium text-[#7A736E]">
          <span className="w-2 h-2 rounded-full bg-[#606C5A]" />
          <span>Oficiāls SIA &ldquo;MANILLA&rdquo; pasūtījuma dokuments</span>
        </div>

        <PrintButton />
      </div>

      {/* A4 Papīra Līgums */}
      <div
        id="printable-contract"
        className="max-w-[760px] mx-auto bg-white border border-[#E5DFD5] shadow-lg rounded-2xl p-6 sm:p-8 pb-8 sm:pb-12 space-y-4 print:space-y-3 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none print:max-w-full print:w-full"
      >
        
        {/* 1. Līguma Galvene: Zīmols un Rekvizīti */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#2A2624] pb-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E5DFD5] text-xs">
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
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#2A2624] flex items-center justify-between">
            <span>3. Pieņemto priekšmetu un iesaiņojuma protokols</span>
            <span className="text-[#7A736E] font-normal">Kopā: {order.gifts.length} dāvanas</span>
          </div>

          <table className="w-full text-left text-xs border border-[#E5DFD5] rounded-xl overflow-hidden">
            <thead className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[#7A736E] font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-8">Nr.</th>
                <th className="py-2.5 px-3">Priekšmets & Izcelsme</th>
                <th className="py-2.5 px-3">Stāvoklis pirms iesaiņošanas</th>
                <th className="py-2.5 px-3">Izvēlētie materiāli</th>
                <th className="py-2.5 px-3 text-right">Summa</th>
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
                    <td className="py-3 px-3 font-mono font-bold text-[#7A736E]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#2A2624]">{gift.title}</div>
                      <div className="text-[10px] text-[#7A736E] mt-0.5">
                        {gift.isThirdParty ? (
                          <span className="text-[#B85D3E] font-semibold">Ārpus Manilla prece</span>
                        ) : (
                          <span>Manilla veikala prece</span>
                        )}
                      </div>
                      {gift.photoUrl && (
                        <div className="mt-1.5 w-16 h-12 rounded border border-[#E5DFD5] overflow-hidden bg-[#FAF8F5]">
                          <img
                            src={gift.photoUrl}
                            alt={gift.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-[200px]">
                      {gift.conditionNotes && gift.conditionNotes.trim().length > 0 ? (
                        <div className="text-[11px] text-[#B85D3E] bg-[#F7EBE7] p-2 rounded-lg border border-[#B85D3E]/20">
                          <span className="font-bold block">Fiksētas nepilnības:</span>
                          {gift.conditionNotes}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#606C5A] font-medium">
                          ✓ Vizuālu bojājumu nav. Teicamā stāvoklī.
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px] space-y-1">
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
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#2A2624]">
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
          <div className="w-full sm:w-72 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DFD5] space-y-1.5 text-xs">
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
            <div className="flex justify-between font-bold text-sm pt-1.5 border-t-2 border-[#2A2624] text-[#2A2624]">
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
        <div className="border-t border-[#E5DFD5] pt-3 text-[10px] text-[#7A736E] leading-relaxed space-y-1">
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
        <div className="border-t-2 border-[#2A2624] pt-4">
          <div className="grid grid-cols-2 gap-8 items-end">
            
            {/* Izpildītājs */}
            <div className="space-y-3">
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
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#2A2624]">
                Pasūtītājs (Klienta paraksts):
              </div>
              
              {/* Dzīvā skārienjutīgā paraksta attēls */}
              <div className="border-b border-[#2A2624] pb-1 h-16 flex items-center justify-center bg-[#FAF8F5]/50 rounded-t-lg">
                {signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Klienta paraksts"
                    className="max-h-14 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-[11px] text-[#606C5A] font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
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
  );
}
