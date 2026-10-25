"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { FilterBar } from "@/components/FilterBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TableView } from "@/components/TableView";
import { SmsModal } from "@/components/SmsModal";
import { TagPrintModal } from "@/components/TagPrintModal";
import { NewOrderWizard } from "@/components/NewOrderWizard";
import { ArchiveModal } from "@/components/ArchiveModal";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { ContractModal } from "@/components/ContractModal";
import { StatusConfirmModal } from "@/components/StatusConfirmModal";
import { OrderData } from "@/components/OrderCard";
import { RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Automātiski uzstādām filiāli atbilstoši pieslēgtā darbinieka darba vietai
  useEffect(() => {
    if (currentUser?.storeBranch) {
      setSelectedBranch(currentUser.storeBranch);
    }
  }, [currentUser?.id, currentUser?.storeBranch]);

  // Modāļu stāvokļi
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [smsModalData, setSmsModalData] = useState<{
    recipientPhone: string;
    messageText: string;
    providerId?: string;
    orderNumber: string;
  } | null>(null);
  const [tagModalOrder, setTagModalOrder] = useState<OrderData | null>(null);
  const [detailModalOrder, setDetailModalOrder] = useState<OrderData | null>(null);
  const [contractModalOrder, setContractModalOrder] = useState<OrderData | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    order: OrderData;
    targetStatus: string;
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Statistika
  const [stats, setStats] = useState({
    total: 0,
    pienemts: 0,
    iesainosana: 0,
    gatavs: 0,
    izsniegts: 0,
    urgent: 0,
  });

  // Datu ielāde no backend API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedBranch && selectedBranch !== "all") params.append("branch", selectedBranch);
      if (selectedStatus && selectedStatus !== "all") params.append("status", selectedStatus);
      if (urgentOnly) params.append("urgentOnly", "true");

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Neizdevās ielādēt pasūtījumus");
      const data = await res.json();
      setOrders(data.orders || []);
      if (data.stats) setStats(data.stats);
    } catch (error) {
      console.error("Kļūda ielādējot pasūtījumus:", error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedBranch, selectedStatus, urgentOnly]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 1. Statusa maiņas pieprasījums - atver apstiprinājuma modāli pret kļūdainiem klikšķiem
  const handleStatusChange = (orderId: string, newStatus: string) => {
    const targetOrder =
      orders.find((o) => o.id === orderId) ||
      (detailModalOrder?.id === orderId ? detailModalOrder : null);

    if (!targetOrder) {
      console.warn("Pasūtījums netika atrasts statusa maiņai:", orderId);
      return;
    }

    setPendingStatusChange({ order: targetOrder, targetStatus: newStatus });
  };

  // 2. Faktiskā statusa maiņa pēc tam, kad meistars apstiprinājis modālī
  const handleConfirmStatusChange = async (options?: { customSmsText?: string; cashReceiptNumber?: string }) => {
    if (!pendingStatusChange) return;
    const { order, targetStatus } = pendingStatusChange;

    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus: targetStatus,
          customSmsText: options?.customSmsText || undefined,
          cashReceiptNumber: options?.cashReceiptNumber || undefined,
          userId: currentUser?.id || undefined,
        }),
      });

      if (!res.ok) throw new Error("Kļūda statusa maiņā");
      const data = await res.json();

      // Aizveram apstiprinājuma logu
      setPendingStatusChange(null);

      // Tūlītējs lokālais stāvokļa atjauninājums (optimistic UI sync)
      if (data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
        );
        setDetailModalOrder((prev) =>
          prev && prev.id === data.order.id ? { ...prev, ...data.order } : prev
        );
      }

      // Ja nostrādājis SMS, parādām SMS nosūtīšanas paziņojumu
      if (data.smsTriggered && data.smsInfo) {
        setSmsModalData({
          recipientPhone: data.smsInfo.recipientPhone,
          messageText: data.smsInfo.messageText,
          providerId: data.smsInfo.providerId,
          orderNumber: data.order.orderNumber,
        });
      }

      // Pārlādējam datus no datubāzes
      await fetchOrders();
    } catch (error) {
      console.error("Kļūda:", error);
      alert("Neizdevās atjaunot pasūtījuma statusu.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleNewOrder = () => {
    setIsNewOrderOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col font-sans print:min-h-0 print:bg-white">
      {/* Galvenā lietotnes daļa (paslēpta drukas laikā, lai neietekmētu līguma A4 lapu skaitu) */}
      <div className="print:hidden flex flex-col flex-1 min-h-screen">
        {/* Augšējā navigācijas josla */}
        <Navbar
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          onNewOrder={handleNewOrder}
        />

        {/* Galvenā satura zona */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
          
          {/* Filtru josla */}
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            urgentOnly={urgentOnly}
            onUrgentToggle={() => setUrgentOnly((prev) => !prev)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            stats={stats}
          />

          {/* Ielādes indikators vai saturs */}
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#7A736E] space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#B85D3E]" />
              <p className="text-sm font-medium">Ielādējam Manilla pasūtījumus no SQLite datubāzes...</p>
            </div>
          ) : viewMode === "kanban" ? (
            <KanbanBoard
              orders={orders}
              onStatusChange={handleStatusChange}
              onPrintTag={(order) => setTagModalOrder(order)}
              onViewDetails={(order) => setDetailModalOrder(order)}
              onViewContract={(order) => setContractModalOrder(order)}
              onOpenArchive={() => setIsArchiveOpen(true)}
            />
          ) : (
            <TableView
              orders={orders}
              onStatusChange={handleStatusChange}
              onPrintTag={(order) => setTagModalOrder(order)}
              onViewDetails={(order) => setDetailModalOrder(order)}
              onViewContract={(order) => setContractModalOrder(order)}
            />
          )}

        </main>

        {/* Apakšējā kājene (iekšējai sistēmai) */}
        <footer className="border-t border-[#E5DFD5] bg-[#FAF8F5]/60 py-3 px-4 text-center text-[11px] text-[#A39D98] flex items-center justify-center gap-2">
          <span>MANILLA Dāvanu Iesaiņošanas Sistēma v1.0 MVP</span>
          <span>•</span>
          <span>Japandi Paper Atelier</span>
          <span>•</span>
          <span>SQLite + Prisma RDBMS</span>
        </footer>
      </div>

      {/* Modālie logi ar stingru z-indeksu un pārklājuma hierarhiju */}
      {isNewOrderOpen && (
        <NewOrderWizard
          isOpen={isNewOrderOpen}
          onClose={() => setIsNewOrderOpen(false)}
          onOrderCreated={(createdOrder) => {
            fetchOrders();
            setIsNewOrderOpen(false);
            if (createdOrder) {
              setTagModalOrder(createdOrder);
            }
          }}
          defaultBranch={selectedBranch !== "all" ? selectedBranch : "Tērbatas iela 55"}
        />
      )}

      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        orders={orders}
        onPrintTag={(order) => setTagModalOrder(order)}
        onViewContract={(order) => setContractModalOrder(order)}
      />

      {/* Sinhronizēts aktīvā pasūtījuma stāvoklis ar datubāzi */}
      {(() => {
        const liveDetailOrder = detailModalOrder
          ? orders.find((o) => o.id === detailModalOrder.id) || detailModalOrder
          : null;
        return (
          <OrderDetailModal
            isOpen={!!liveDetailOrder}
            onClose={() => setDetailModalOrder(null)}
            order={liveDetailOrder}
            onStatusChange={handleStatusChange}
            onPrintTag={(order) => setTagModalOrder(order)}
            onViewContract={(order) => setContractModalOrder(order)}
          />
        );
      })()}

      <TagPrintModal
        isOpen={!!tagModalOrder}
        onClose={() => setTagModalOrder(null)}
        order={tagModalOrder}
      />

      <ContractModal
        isOpen={!!contractModalOrder}
        onClose={() => setContractModalOrder(null)}
        order={contractModalOrder}
      />

      <StatusConfirmModal
        isOpen={!!pendingStatusChange}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={handleConfirmStatusChange}
        order={pendingStatusChange?.order || null}
        targetStatus={pendingStatusChange?.targetStatus || null}
        isLoading={isUpdatingStatus}
      />

      <SmsModal
        isOpen={!!smsModalData}
        onClose={() => setSmsModalData(null)}
        smsData={smsModalData}
      />
    </div>
  );
}
