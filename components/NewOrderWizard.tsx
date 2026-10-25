"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Package,
  Camera,
  AlertTriangle,
  Plus,
  Trash2,
  Barcode,
  Search,
  CheckCircle2,
  PenTool,
  RotateCcw,
  Store,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  AlertCircle,
  Upload,
  RefreshCw,
} from "lucide-react";

interface NewOrderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (createdOrder?: any) => void;
  defaultBranch?: string;
}

interface GiftDraft {
  id: string;
  title: string;
  isThirdParty: boolean;
  conditionNotes: string;
  photoUrl: string;
  materials: Array<{
    materialId: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    swatchColor?: string;
    imageUrl?: string;
  }>;
}

export function NewOrderWizard({
  isOpen,
  onClose,
  onOrderCreated,
  defaultBranch = "Tērbatas iela 55",
}: NewOrderWizardProps) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

  // 1. Solis: Klients un Laiks
  const [storeBranch, setStoreBranch] = useState(defaultBranch);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+371 ");
  const [customerEmail, setCustomerEmail] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [timeMode, setTimeMode] = useState<"standart" | "specifiska" | "custom">("standart");
  const [orderNotes, setOrderNotes] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);

  const validateStep = (currentStep: number): boolean => {
    setStepError(null);
    if (currentStep === 1) {
      if (!customerName.trim()) {
        setStepError("Lūdzu, ievadiet klienta vārdu un uzvārdu!");
        return false;
      }
      if (!customerPhone.trim() || customerPhone.trim() === "+371") {
        setStepError("Lūdzu, ievadiet klienta tālruņa numuru!");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!gifts[0]?.title.trim()) {
        setStepError("Lūdzu, ievadiet vismaz vienas dāvanas nosaukumu!");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((step + 1) as any);
    }
  };

  // 2. & 3. Solis: Dāvanas un Materiāli
  const [gifts, setGifts] = useState<GiftDraft[]>([
    {
      id: "gift-1",
      title: "",
      isThirdParty: false,
      conditionNotes: "",
      photoUrl: "",
      materials: [],
    },
  ]);
  const [activeGiftIndex, setActiveGiftIndex] = useState(0);

  // Pieejamie materiāli no kataloga
  const [catalogMaterials, setCatalogMaterials] = useState<any[]>([]);

  // Pārklājuma kataloga modālais logs (Step 3) ar integrētu svītrkodu skenēšanu
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState<string>("ALL");
  const [catalogDraftQuantities, setCatalogDraftQuantities] = useState<Record<string, number>>({});
  const [catalogScanFeedback, setCatalogScanFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const catalogSearchInputRef = useRef<HTMLInputElement>(null);

  // Kameras un failu augšupielādes atsauce un stāvoklis
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset vērtību, lai varētu atkārtoti izvēlēties to pašu failu
    e.target.value = "";

    setIsProcessingPhoto(true);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        // Mērogojam uz max 1000px, lai neslogotu atmiņu un tīklu
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          updateActiveGift("photoUrl", compressedDataUrl);
        } else {
          updateActiveGift("photoUrl", readerEvent.target?.result as string);
        }
        setIsProcessingPhoto(false);
      };
      img.onerror = () => {
        setIsProcessingPhoto(false);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  // Automātisks fokuss uz svītrkoda / meklētāja ievadi, atverot katalogu
  useEffect(() => {
    if (isCatalogModalOpen) {
      setTimeout(() => {
        catalogSearchInputRef.current?.focus();
      }, 100);
    } else {
      setCatalogScanFeedback(null);
      setCatalogSearch("");
    }
  }, [isCatalogModalOpen]);

  // 4. Solis: Cenas un Paraksts
  const [packagingChoice, setPackagingChoice] = useState<"MANUAL" | "TRUST_MASTER">("MANUAL");
  const [provisionalLimit, setProvisionalLimit] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("NEAPMAKSATS");
  const [cashReceiptNo, setCashReceiptNo] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Canvas atsauce parakstam
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Inicializējam šodienas datumu un ielādējam materiālus
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchMaterials();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleTimeModeSelect = (mode: "standart" | "specifiska" | "custom") => {
    setTimeMode(mode);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    setPickupDate(`${year}-${month}-${day}`);

    if (mode === "standart") {
      now.setMinutes(now.getMinutes() + 15);
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setPickupTime(`${hours}:${mins}`);
    } else if (mode === "specifiska") {
      now.setMinutes(now.getMinutes() + 40);
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setPickupTime(`${hours}:${mins}`);
    } else {
      now.setHours(now.getHours() + 2);
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setPickupTime(`${hours}:${mins}`);
    }
  };

  const adjustPickupMinutes = (deltaMinutes: number) => {
    if (!pickupTime) return;
    const [hStr, mStr] = pickupTime.split(":");
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    const date = new Date();
    date.setHours(h, m + deltaMinutes, 0, 0);
    const hours = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    setPickupTime(`${hours}:${mins}`);
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials");
      if (res.ok) {
        const data = await res.json();
        setCatalogMaterials(data.materials || []);
      }
    } catch (e) {
      console.error("Neizdevās ielādēt materiālus:", e);
    }
  };

  // Cenu aprēķins
  const calculateTotals = () => {
    let labor = 0;
    let materials = 0;

    gifts.forEach((g) => {
      // Linda noteikums: standartā €2.50, ja iegādāts ārpus Manilla: €3.50
      labor += g.isThirdParty ? 3.5 : 2.5;
      g.materials.forEach((m) => {
        materials += m.quantity * m.unitPrice;
      });
    });

    const total = labor + materials;
    return { labor, materials, total };
  };

  const { labor, materials, total } = calculateTotals();

  // Dāvanu pārvaldība
  const addGift = () => {
    const newGift: GiftDraft = {
      id: `gift-${Date.now()}`,
      title: "",
      isThirdParty: false,
      conditionNotes: "",
      photoUrl: "",
      materials: [],
    };
    setGifts([...gifts, newGift]);
    setActiveGiftIndex(gifts.length);
  };

  const removeGift = (index: number) => {
    if (gifts.length === 1) return;
    const updated = gifts.filter((_, idx) => idx !== index);
    setGifts(updated);
    setActiveGiftIndex(Math.max(0, index - 1));
  };

  const updateActiveGift = (field: keyof GiftDraft, value: any) => {
    const updated = [...gifts];
    updated[activeGiftIndex] = {
      ...updated[activeGiftIndex],
      [field]: value,
    };
    setGifts(updated);
  };

  // Materiālu pievienošana aktīvajai dāvanai
  const addMaterialToActiveGift = (material: any, qty: number = 1) => {
    const safeQty = Math.max(1, Math.round(qty));
    const current = gifts[activeGiftIndex];
    const existingIndex = current.materials.findIndex((m) => m.materialId === material.id);

    const updatedMaterials = [...current.materials];
    if (existingIndex >= 0) {
      updatedMaterials[existingIndex].quantity += safeQty;
    } else {
      updatedMaterials.push({
        materialId: material.id,
        name: material.name,
        quantity: safeQty,
        unit: material.unit,
        unitPrice: material.pricePerUnit,
        swatchColor: material.swatchColor,
        imageUrl: material.imageUrl || undefined,
      });
    }

    updateActiveGift("materials", updatedMaterials);
  };

  // Daudzuma rediģēšana jau pievienotam materiālam (tikai veseli skaitļi, bez decimāldaļām)
  const updateMaterialQuantity = (materialId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeMaterialFromActiveGift(materialId);
      return;
    }
    const current = gifts[activeGiftIndex];
    const safeQty = Math.max(1, Math.round(newQuantity));
    const updated = current.materials.map((m) =>
      m.materialId === materialId ? { ...m, quantity: safeQty } : m
    );
    updateActiveGift("materials", updated);
  };

  // Materiāla iestatīšana ar konkrētu lietotāja izvēlētu daudzumu/metriem (tikai veseli skaitļi)
  const setOrAddMaterialInActiveGift = (material: any, qty: number) => {
    const safeQty = Math.max(1, Math.round(qty));
    const current = gifts[activeGiftIndex];
    const existingIndex = current.materials.findIndex((m) => m.materialId === material.id);

    const updatedMaterials = [...current.materials];
    if (existingIndex >= 0) {
      updatedMaterials[existingIndex].quantity = safeQty;
    } else {
      updatedMaterials.push({
        materialId: material.id,
        name: material.name,
        quantity: safeQty,
        unit: material.unit,
        unitPrice: material.pricePerUnit,
        swatchColor: material.swatchColor,
        imageUrl: material.imageUrl || undefined,
      });
    }

    updateActiveGift("materials", updatedMaterials);
  };

  // Kataloga drafta daudzuma nolasīšana konkrētai kartei (tikai veseli skaitļi)
  const getDraftQuantity = (material: any): number => {
    if (catalogDraftQuantities[material.id] !== undefined) {
      return Math.max(1, Math.round(catalogDraftQuantities[material.id]));
    }
    const existing = gifts[activeGiftIndex]?.materials.find((m) => m.materialId === material.id);
    if (existing) return Math.max(1, Math.round(existing.quantity));
    return 1;
  };

  const setDraftQuantity = (materialId: string, qty: number) => {
    setCatalogDraftQuantities((prev) => ({
      ...prev,
      [materialId]: Math.max(1, Math.round(qty)),
    }));
  };

  const removeMaterialFromActiveGift = (materialId: string) => {
    const current = gifts[activeGiftIndex];
    const updated = current.materials.filter((m) => m.materialId !== materialId);
    updateActiveGift("materials", updated);
  };

  // Svītrkoda skenēšanas un meklēšanas apstrāde kataloga modālī (Prasība 3 no Lindas)
  const handleCatalogScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = catalogSearch.trim();
    if (!query) return;

    // 1. Meklējam precīzu atbilstību pēc svītrkoda vai produkta koda
    const found = catalogMaterials.find(
      (m) =>
        (m.barcode && m.barcode.toLowerCase() === query.toLowerCase()) ||
        m.code.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      const isRibbon = found.unit === "METRS";
      const draftQty = getDraftQuantity(found);
      const qtyToAdd = draftQty > 0 ? draftQty : 1;

      addMaterialToActiveGift(found, qtyToAdd);

      setCatalogScanFeedback({
        type: "success",
        message: `Pievienots: ${found.name} (${qtyToAdd} ${isRibbon ? "m" : "gab."})`,
      });

      // Notīrām meklētāju nākamajam skenējumam
      setCatalogSearch("");

      setTimeout(() => {
        setCatalogScanFeedback(null);
      }, 3500);
    } else {
      // 2. Ja svītrkods nav atrasts, rādām Lindas prasīto skaidro paziņojumu
      setCatalogScanFeedback({
        type: "error",
        message: `Svītrkods "${query}" nav atrasts Manilla katalogā. Lūdzu, izvēlieties no saraksta vai precizējiet kodu.`,
      });
    }
  };

  // Paraksta zīmēšana (HTML5 Canvas)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#2A2624";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL("image/png"));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  // Pilnīga formas atiestatīšana no nulles katram jaunam pasūtījumam
  const resetForm = () => {
    setStep(1);
    setStoreBranch(defaultBranch);
    setCustomerName("");
    setCustomerPhone("+371 ");
    setCustomerEmail("");
    setOrderNotes("");
    setGifts([
      {
        id: `gift-${Date.now()}`,
        title: "",
        isThirdParty: false,
        conditionNotes: "",
        photoUrl: "",
        materials: [],
      },
    ]);
    setActiveGiftIndex(0);
    setCatalogScanFeedback(null);
    setIsCatalogModalOpen(false);
    setCatalogSearch("");
    setCatalogCategory("ALL");
    setCatalogDraftQuantities({});
    setPackagingChoice("MANUAL");
    setProvisionalLimit("");
    setPaymentStatus("NEAPMAKSATS");
    setCashReceiptNo("");
    setSignatureData(null);
    clearSignature();
    handleTimeModeSelect("standart");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Galīgā pasūtījuma iesniegšana datubāzē
  const handleSubmitOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Lūdzu ievadiet klienta vārdu un tālruni!");
      setStep(1);
      return;
    }

    const effectivePaymentStatus = packagingChoice === "TRUST_MASTER" ? "NEAPMAKSATS" : paymentStatus;
    const effectiveCashReceiptNumber = effectivePaymentStatus === "APMAKSATS" ? cashReceiptNo.trim() : null;

    if (effectivePaymentStatus === "APMAKSATS" && !cashReceiptNo.trim()) {
      alert("Lūdzu ievadiet kases čeka numuru, lai reģistrētu tūlītēju apmaksu!");
      return;
    }

    try {
      setSubmitting(true);

      const pickupDateTime = new Date(`${pickupDate}T${pickupTime || "18:00"}:00`);

      const payload = {
        storeBranch,
        customer: {
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || null,
        },
        agreedPickupTime: pickupDateTime.toISOString(),
        notes: orderNotes.trim() || null,
        laborCost: labor,
        materialsCost: materials,
        provisionalLimit:
          packagingChoice === "TRUST_MASTER" && provisionalLimit
            ? parseFloat(provisionalLimit)
            : null,
        totalPrice: total,
        paymentStatus: effectivePaymentStatus,
        cashReceiptNumber: effectiveCashReceiptNumber,
        gifts: gifts.map((g) => ({
          title: g.title.trim() || "Dāvana",
          isThirdParty: g.isThirdParty,
          conditionNotes: g.conditionNotes.trim() || null,
          photoUrl: g.photoUrl || null,
          materials: g.materials.map((m) => ({
            materialId: m.materialId,
            quantity: m.quantity,
            unitPrice: m.unitPrice,
            subtotal: m.quantity * m.unitPrice,
          })),
        })),
        signatureDataUrl: signatureData,
        userId: currentUser?.id || null,
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Neizdevās izveidot pasūtījumu");
      const data = await res.json();

      onOrderCreated(data.order);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Kļūda izveidojot pasūtījumu:", error);
      alert("Kļūda saglabājot pasūtījumu datubāzē.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E5DFD5] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Galvene un Soļu josla */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5DFD5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B85D3E] text-white flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-[#2A2624]">
                Jauns Iesaiņošanas Pasūtījums
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#7A736E]">
                <span>Solis {step} no 4</span>
                <span>•</span>
                <span>
                  {step === 1 && "Klients un Saņemšanas Termiņš"}
                  {step === 2 && "Dāvanu Uzskaite un Foto"}
                  {step === 3 && "Materiāli un Cenas Aprēķins"}
                  {step === 4 && "Klienta Paraksts un Apstiprinājums"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-[#A39D98] hover:text-[#2A2624] hover:bg-[#ECE6DC] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Soļu progresa indikators */}
        <div className="grid grid-cols-4 border-b border-[#E5DFD5] text-xs font-semibold">
          {[
            { num: 1, label: "1. Klients & Laiks" },
            { num: 2, label: "2. Dāvanas & Foto" },
            { num: 3, label: "3. Materiāli & Cena" },
            { num: 4, label: "4. Paraksts" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num > step) {
                  if (validateStep(step)) setStep(s.num as any);
                } else {
                  setStepError(null);
                  setStep(s.num as any);
                }
              }}
              className={`py-2.5 text-center transition-all cursor-pointer border-b-2 ${
                step === s.num
                  ? "border-[#B85D3E] text-[#B85D3E] bg-[#F7EBE7]/40"
                  : step > s.num
                  ? "border-[#606C5A] text-[#606C5A] bg-transparent"
                  : "border-transparent text-[#A39D98] bg-transparent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Galvenā satura zona ar ritināšanu */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {stepError && (
            <div className="p-3 bg-[#FDF2EE] border border-[#B85D3E]/30 rounded-xl flex items-center gap-2 text-xs text-[#B85D3E] font-medium animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          {/* ================= SOLIS 1: Klients & Laiks ================= */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Veikala filiāle */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A736E] block mb-2">
                  Veikala Filiāle (Pieņemšanas vieta)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "Tērbatas iela 55", name: "Tērbatas iela 55", desc: "Flagship ateljē" },
                    { id: "T/C Galerija Centrs", name: "T/C Galerija Centrs", desc: "Audēju 16, 2.st." },
                    { id: "Tērbatas iela 54", name: "Manilla Kids", desc: "Tērbatas 54" },
                  ].map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => setStoreBranch(branch.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        storeBranch === branch.id
                          ? "bg-[#FAF8F5] border-[#B85D3E] ring-2 ring-[#B85D3E]/20"
                          : "border-[#E5DFD5] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[#2A2624]">{branch.name}</div>
                      <div className="text-[11px] text-[#7A736E]">{branch.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Klienta kontakti */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-4">
                <h3 className="font-heading font-semibold text-sm text-[#2A2624] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#B85D3E]" />
                  Klienta Informācija
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#7A736E] block mb-1">
                      Vārds un Uzvārds <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="piem. Anna Liepiņa"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-sm text-[#2A2624] focus:outline-none focus:border-[#B85D3E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#7A736E] block mb-1">
                      Tālrunis (obligāts SMS saņemšanai) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#7A736E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="+371 29123456"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-sm font-mono text-[#2A2624] focus:outline-none focus:border-[#B85D3E]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#7A736E] block mb-1">
                    E-pasts (neobligāts)
                  </label>
                  <input
                    type="email"
                    placeholder="anna@piemers.lv"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-sm text-[#2A2624] focus:outline-none focus:border-[#B85D3E]"
                  />
                </div>
              </div>

              {/* Saņemšanas termiņš: Standart, Specifiska vai Custom */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-sm text-[#2A2624] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B85D3E]" />
                    Saskaņotais Saņemšanas Laiks
                  </h3>
                  <span className="text-[11px] text-[#7A736E]">Manilla servisa standarti</span>
                </div>

                {/* 3 Galvenās opcijas: Standart, Specifiska, Custom */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTimeModeSelect("standart")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      timeMode === "standart"
                        ? "bg-white border-[#B85D3E] shadow-sm ring-2 ring-[#B85D3E]/20"
                        : "bg-white/60 border-[#E5DFD5] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2A2624]">⚡ Standart</span>
                      <span className="text-[10px] bg-[#F7EBE7] text-[#B85D3E] px-1.5 py-0.5 rounded font-bold font-mono">
                        15 min
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A736E] mt-1">
                      Ātrais iesaiņojums uz vietas
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTimeModeSelect("specifiska")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      timeMode === "specifiska"
                        ? "bg-white border-[#B85D3E] shadow-sm ring-2 ring-[#B85D3E]/20"
                        : "bg-white/60 border-[#E5DFD5] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2A2624]">⏱ Specifiska</span>
                      <span className="text-[10px] bg-[#FDF6E8] text-[#D99B26] px-1.5 py-0.5 rounded font-bold font-mono">
                        40 min
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A736E] mt-1">
                      Sarežģīta forma vai trausls
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTimeModeSelect("custom")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      timeMode === "custom"
                        ? "bg-white border-[#B85D3E] shadow-sm ring-2 ring-[#B85D3E]/20"
                        : "bg-white/60 border-[#E5DFD5] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2A2624]">🗓 Custom</span>
                      <span className="text-[10px] bg-[#EEF2EC] text-[#606C5A] px-1.5 py-0.5 rounded font-bold font-mono">
                        Cits laiks
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A736E] mt-1">
                      Brīvs datums un pulkstenis
                    </p>
                  </button>
                </div>

                {/* Dinamiskais saturs: Standart/Specifiska ar ērti rediģējamu pulksteni un soļiem, vai Custom */}
                {timeMode !== "custom" ? (
                  <div className="bg-white border border-[#E5DFD5] rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 sm:gap-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-[#7A736E]">
                      <Clock className="w-3.5 h-3.5 text-[#B85D3E]" />
                      <span>
                        Gatavs saņemšanai:{" "}
                        <strong className="text-[#2A2624]">Šodien</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Ātrās laika korekcijas soļu pogas */}
                      <div className="flex items-center bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => adjustPickupMinutes(-5)}
                          className="px-2 py-1 hover:bg-[#ECE6DC] text-[#7A736E] hover:text-[#2A2624] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="-5 minūtes"
                        >
                          -5m
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustPickupMinutes(5)}
                          className="px-2 py-1 hover:bg-[#ECE6DC] text-[#7A736E] hover:text-[#2A2624] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="+5 minūtes"
                        >
                          +5m
                        </button>
                      </div>

                      {/* Brīvi rediģējams laika lauks */}
                      <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DFD5] focus-within:border-[#B85D3E] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#B85D3E]/20 rounded-xl px-2.5 py-1 transition-all">
                        <span className="text-[#7A736E] text-[11px] font-medium">plkst.</span>
                        <input
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="bg-transparent font-mono font-bold text-sm text-[#2A2624] focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#ECE6DC]">
                    <div>
                      <label className="text-xs font-medium text-[#7A736E] block mb-1">
                        Izvēlieties Datumu
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs text-[#2A2624] focus:outline-none focus:border-[#B85D3E]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#7A736E] block mb-1">
                        Izvēlieties Laiku
                      </label>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-mono text-[#2A2624] focus:outline-none focus:border-[#B85D3E]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pasūtījuma kopējās piezīmes */}
              <div>
                <label className="text-xs font-medium text-[#7A736E] block mb-1">
                  Kopējās piezīmes par pasūtījumu
                </label>
                <textarea
                  rows={2}
                  placeholder="piem. Klients steidzas, zvanīt tiklīdz gatavs; dāvana kāzām..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-xl text-sm text-[#2A2624] focus:outline-none focus:border-[#B85D3E]"
                />
              </div>

            </div>
          )}

          {/* ================= SOLIS 2: Dāvanas & Foto ================= */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Dāvanu cilnes (Multi-gifts atbalsts!) */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD5]">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {gifts.map((g, idx) => {
                    const giftLabel = g.title.trim() ? `${idx + 1}. ${g.title.trim()}` : `Dāvana ${idx + 1}`;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setActiveGiftIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer max-w-[200px] truncate ${
                          activeGiftIndex === idx
                            ? "bg-[#B85D3E] text-white shadow-xs"
                            : "bg-[#FAF8F5] text-[#7A736E] border border-[#E5DFD5] hover:text-[#2A2624]"
                        }`}
                        title={g.title.trim() || `Dāvana ${idx + 1}`}
                      >
                        {giftLabel}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={addGift}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 text-[#B85D3E] border border-[#B85D3E]/30 rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Pievienot vēl dāvanu</span>
                </button>
              </div>

              {/* Aktīvās dāvanas rediģēšana */}
              <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E5DFD5] space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-[#2A2624] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#B85D3E]" />
                    <span>
                      {gifts[activeGiftIndex]?.title.trim()
                        ? `${activeGiftIndex + 1}. ${gifts[activeGiftIndex].title.trim()}`
                        : `Dāvana #${activeGiftIndex + 1}`} Informācija
                    </span>
                  </h3>

                  {gifts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGift(activeGiftIndex)}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Dzēst šo dāvanu
                    </button>
                  )}
                </div>

                {/* Nosaukums */}
                <div>
                  <label className="text-xs font-medium text-[#7A736E] block mb-1">
                    Priekšmeta apraksts vai nosaukums <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="piem. Porcelāna tējkanna, Plānotājs, Svece..."
                    value={gifts[activeGiftIndex]?.title || ""}
                    onChange={(e) => updateActiveGift("title", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-sm text-[#2A2624] focus:outline-none focus:border-[#B85D3E]"
                  />
                </div>

                {/* Izcelsme: Manilla vai Ārpus Manilla ar skaidrām cenām */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#2A2624] block">
                    Preces izcelsme & Iesaiņošanas darba samaksa
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateActiveGift("isThirdParty", false)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        !gifts[activeGiftIndex]?.isThirdParty
                          ? "bg-white border-[#606C5A] ring-2 ring-[#606C5A]/20 shadow-xs"
                          : "bg-white/60 border-[#E5DFD5] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2A2624]">🎁 Manilla veikalā iegādāta</span>
                        <span className="text-xs font-mono font-bold text-[#606C5A] bg-[#EEF2EC] px-2 py-0.5 rounded-md">
                          € 2.50
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A736E]">
                        Standarta iesaiņošanas darba maksa
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateActiveGift("isThirdParty", true)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        gifts[activeGiftIndex]?.isThirdParty
                          ? "bg-white border-[#B85D3E] ring-2 ring-[#B85D3E]/20 shadow-xs"
                          : "bg-white/60 border-[#E5DFD5] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2A2624]">🛍️ Ārpus veikala iegādāta</span>
                        <span className="text-xs font-mono font-bold text-[#B85D3E] bg-[#F7EBE7] px-2 py-0.5 rounded-md">
                          € 3.50
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A736E]">
                        Ārpus Manilla pirkta priekšmeta apstrāde
                      </p>
                    </button>
                  </div>
                </div>

                {/* Defektu / Bojājumu fiksācija (Juridiskā aizsardzība!) */}
                <div>
                  <label className="text-xs font-semibold text-[#2A2624] block mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D99B26]" />
                    Piezīmes par priekšmeta stāvokli pirms iesaiņošanas
                  </label>
                  <p className="text-[11px] text-[#7A736E] mb-2">
                    Fiksējiet redzamus defektus, skrāpējumus, plaisas vai trauslumu, lai aizsargātu Manilla no pretenzijām.
                  </p>
                  <textarea
                    rows={2}
                    placeholder="piem. Neliels skrāpējums uz vāciņa; trausla keramika bez rūpnīcas iepakojuma..."
                    value={gifts[activeGiftIndex]?.conditionNotes || ""}
                    onChange={(e) => updateActiveGift("conditionNotes", e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-xl text-sm text-[#2A2624] focus:outline-none focus:border-[#B85D3E]"
                  />
                </div>

                {/* Foto fiksācija ar kameru vai failu */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#2A2624] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#606C5A]" />
                      <span>Priekšmeta foto pirms iesaiņošanas</span>
                    </label>
                    <span className="text-[11px] text-[#7A736E]">
                      Juridiskā aizsardzība & stāvokļa fiksācija
                    </span>
                  </div>

                  {/* Slēptais kameras / failu ievades lauks */}
                  <input
                    ref={photoInputRef}
                    data-testid="gift-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <div className="flex items-start gap-4 p-3.5 bg-white border border-[#E5DFD5] rounded-2xl shadow-2xs">
                    {/* Foto priekšskatījums vai klikšķināms lodziņš */}
                    {gifts[activeGiftIndex]?.photoUrl ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#E5DFD5] shadow-xs group shrink-0">
                        <img
                          src={gifts[activeGiftIndex].photoUrl}
                          alt="Priekšmeta foto"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="p-1.5 bg-white text-[#2A2624] hover:text-[#B85D3E] rounded-lg shadow-sm transition-colors cursor-pointer"
                            title="Aizstāt foto"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            data-testid="remove-gift-photo-btn"
                            onClick={() => updateActiveGift("photoUrl", "")}
                            className="p-1.5 bg-white text-[#2A2624] hover:text-red-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                            title="Dzēst foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        data-testid="upload-photo-tile-btn"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={isProcessingPhoto}
                        className="w-24 h-24 rounded-xl bg-[#FAF8F5] hover:bg-[#F7EBE7]/50 border-2 border-dashed border-[#E5DFD5] hover:border-[#B85D3E]/50 flex flex-col items-center justify-center text-[#7A736E] hover:text-[#B85D3E] transition-all cursor-pointer shrink-0"
                      >
                        {isProcessingPhoto ? (
                          <RefreshCw className="w-6 h-6 animate-spin text-[#B85D3E]" />
                        ) : (
                          <>
                            <Camera className="w-6 h-6 mb-1 text-[#606C5A]" />
                            <span className="text-[10px] font-semibold">Pievienot</span>
                            <span className="text-[9px] text-[#A39D98]">foto</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Vadības pogas un paskaidrojums */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          data-testid="take-photo-btn"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={isProcessingPhoto}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#606C5A] hover:bg-[#4E5849] active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          {isProcessingPhoto ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Camera className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isProcessingPhoto
                              ? "Apstrādā foto..."
                              : gifts[activeGiftIndex]?.photoUrl
                              ? "Nomainīt fotoattēlu"
                              : "Nofotografēt / Augšupielādēt"}
                          </span>
                        </button>

                        {/* Parauga poga testa nolūkiem, ja nav kameras pie rokas */}
                        <button
                          type="button"
                          data-testid="sample-photo-btn"
                          onClick={() =>
                            updateActiveGift(
                              "photoUrl",
                              "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80"
                            )
                          }
                          className="flex items-center gap-1 px-3 py-2 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E5DFD5] text-[#7A736E] hover:text-[#2A2624] rounded-xl text-xs font-medium transition-colors cursor-pointer"
                        >
                          <span>☕ Parauga foto</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-[#7A736E] space-y-0.5">
                        <p>
                          Planšetē automātiski atveras kamera, lai iemūžinātu nodotā priekšmeta sākotnējo stāvokli pirms iesaiņošanas.
                        </p>
                        <p className="text-[10px] text-[#A39D98]">
                          Fotoattēls tiek piesaistīts klienta pieņemšanas aktam ar laika zīmogu.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= SOLIS 3: Materiāli & Cena ================= */}
          {step === 3 && (
            <div className="space-y-6">
              
              {/* Materiālu izvēles veids: Klients izvēlas pats VAI Uzticas meistaram */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A736E] block">
                  Iesaiņojuma Materiālu Izvēles Veids
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPackagingChoice("MANUAL");
                      setProvisionalLimit("");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      packagingChoice === "MANUAL"
                        ? "bg-white border-[#B85D3E] ring-2 ring-[#B85D3E]/20 shadow-xs"
                        : "bg-white/60 border-[#E5DFD5] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#2A2624] flex items-center gap-1.5">
                        <span>🎨</span> Klients pats izvēlas materiālus
                      </span>
                      {packagingChoice === "MANUAL" && (
                        <span className="w-2 h-2 rounded-full bg-[#B85D3E]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A736E] leading-relaxed">
                      Klients izvēlas konkrētu papīru un lenti no kataloga. Precīzs fiksēts materiālu aprēķins bez budžeta limita.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPackagingChoice("TRUST_MASTER");
                      setPaymentStatus("NEAPMAKSATS");
                      setCashReceiptNo("");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      packagingChoice === "TRUST_MASTER"
                        ? "bg-white border-[#606C5A] ring-2 ring-[#606C5A]/20 shadow-xs"
                        : "bg-white/60 border-[#E5DFD5] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#2A2624] flex items-center gap-1.5">
                        <span>✨</span> Uzticēties meistara gaumei
                      </span>
                      {packagingChoice === "TRUST_MASTER" && (
                        <span className="w-2 h-2 rounded-full bg-[#606C5A]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A736E] leading-relaxed">
                      Meistars ateljē piemeklēs harmoniskāko papīru un lenti. Tiek noteikts un saskaņots maksimālais cenas limits.
                    </p>
                  </button>
                </div>
              </div>

              {/* Ja uzticas meistaram: PARĀDĀS PROVIZORISKĀ BUDŽETA LIMITA KARTĪTE */}
              {packagingChoice === "TRUST_MASTER" && (
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#606C5A]/40 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#606C5A]">
                      <Sparkles className="w-4 h-4 text-[#606C5A]" />
                      <span>Saskaņotais provizoriskais budžeta limits</span>
                    </div>
                    <span className="text-[10px] text-[#606C5A] uppercase tracking-wider font-semibold bg-[#EEF2EC] px-2 py-0.5 rounded-md">
                      Meistara darba uzdevums
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A736E] leading-relaxed">
                    Norādiet maksimālo summu, ko meistars nedrīkst pārsniegt, komplektējot dāvanas materiālus un iesaiņojumu.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs font-bold text-[#2A2624]">Maksimālais limits:</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#7A736E]">
                        €
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        placeholder="piem. 20.00"
                        value={provisionalLimit}
                        onChange={(e) => setProvisionalLimit(e.target.value)}
                        className="w-40 pl-8 pr-3 py-2 bg-white border border-[#606C5A]/40 rounded-xl text-xs font-mono font-bold text-[#2A2624] focus:outline-none focus:border-[#606C5A] focus:ring-2 focus:ring-[#606C5A]/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dāvanas izvēle, kurai liekam materiālus */}
              {gifts.length > 1 && (
                <div className="flex items-center gap-2 pb-2 border-b border-[#E5DFD5] overflow-x-auto">
                  <span className="text-xs text-[#7A736E] shrink-0">Izvēlieties dāvanu:</span>
                  {gifts.map((g, idx) => {
                    const giftLabel = g.title.trim() ? `${idx + 1}. ${g.title.trim()}` : `Dāvana ${idx + 1}`;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setActiveGiftIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 max-w-[220px] truncate ${
                          activeGiftIndex === idx
                            ? "bg-[#2A2624] text-white shadow-xs"
                            : "bg-white border border-[#E5DFD5] text-[#7A736E] hover:text-[#2A2624] hover:bg-[#FAF8F5]"
                        }`}
                        title={g.title.trim() || `Dāvana ${idx + 1}`}
                      >
                        {giftLabel}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pievienotie materiāli šai dāvanai */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#7A736E]">
                    Izvēlētie materiāli dāvanai:{" "}
                    <strong className="text-[#2A2624]">
                      {gifts[activeGiftIndex]?.title.trim()
                        ? `${activeGiftIndex + 1}. ${gifts[activeGiftIndex].title.trim()}`
                        : `Dāvana #${activeGiftIndex + 1}`}
                    </strong>
                  </label>
                  <span className="text-[11px] font-semibold text-[#B85D3E]">
                    {gifts[activeGiftIndex]?.materials.length || 0}{" "}
                    {gifts[activeGiftIndex]?.materials.length === 1 ? "materiāls pievienots" : "materiāli pievienoti"}
                  </span>
                </div>

                {/* Materiālu saraksts */}
                {gifts[activeGiftIndex]?.materials.length === 0 ? (
                  <div className="p-6 bg-white border-2 border-dashed border-[#E5DFD5] rounded-3xl text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FAF8F5] text-[#B85D3E] flex items-center justify-center">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-[#2A2624]">
                        Šai dāvanai vēl nav izvēlēti materiāli
                      </h4>
                      <p className="text-xs text-[#7A736E] max-w-md mx-auto mt-0.5">
                        Atveriet katalogu, lai izvēlētos iesaiņojuma papīru, lentes ar precīziem metriem vai ieskenētu svītrkodu.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCatalogModalOpen(true)}
                      className="px-5 py-2.5 bg-[#B85D3E] hover:bg-[#9E4D32] text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Barcode className="w-4 h-4" />
                      <span>Atvērt materiālu katalogu & Skenēt svītrkodu</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="divide-y divide-[#ECE6DC] bg-white border border-[#E5DFD5] rounded-2xl overflow-hidden shadow-2xs">
                      {gifts[activeGiftIndex]?.materials.map((m) => {
                        const isRibbon = m.unit === "METRS";
                        return (
                          <div
                            key={m.materialId}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {m.imageUrl ? (
                                <img
                                  src={m.imageUrl}
                                  alt={m.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-[#E5DFD5] shrink-0 shadow-2xs"
                                />
                              ) : m.swatchColor ? (
                                <span
                                  className="w-5 h-5 rounded-full border border-black/15 shrink-0"
                                  style={{ backgroundColor: m.swatchColor }}
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-[#E5DFD5] shrink-0" />
                              )}
                              <div className="min-w-0">
                                <span className="font-bold text-[#2A2624] block truncate">
                                  {m.name}
                                </span>
                                <span className="text-[11px] text-[#7A736E] font-mono">
                                  Bāzes cena: € {m.unitPrice.toFixed(2)} / {isRibbon ? "m" : "gab."}
                                </span>
                              </div>
                            </div>

                            {/* Daudzuma / metru regulēšana un matemātika */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-auto">
                              {/* Stepper pogas (tikai veseli skaitļi) */}
                              <div className="flex items-center bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateMaterialQuantity(
                                      m.materialId,
                                      Math.max(1, m.quantity - 1)
                                    )
                                  }
                                  className="w-6 h-6 flex items-center justify-center hover:bg-[#ECE6DC] text-[#7A736E] hover:text-[#2A2624] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  title={isRibbon ? "-1 m" : "-1 gab."}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  step="1"
                                  min="1"
                                  value={Math.round(m.quantity)}
                                  onKeyDown={(e) => {
                                    if (e.key === "." || e.key === "," || e.key === "-" || e.key === "e") {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    updateMaterialQuantity(
                                      m.materialId,
                                      isNaN(val) || val < 1 ? 1 : val
                                    );
                                  }}
                                  className="w-12 text-center bg-transparent font-mono font-bold text-xs text-[#2A2624] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[10px] text-[#7A736E] pr-1.5 font-medium">
                                  {isRibbon ? "m" : "gab."}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateMaterialQuantity(
                                      m.materialId,
                                      m.quantity + 1
                                    )
                                  }
                                  className="w-6 h-6 flex items-center justify-center hover:bg-[#ECE6DC] text-[#7A736E] hover:text-[#2A2624] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  title={isRibbon ? "+1 m" : "+1 gab."}
                                >
                                  +
                                </button>
                              </div>

                              {/* Precīzā summa */}
                              <span className="font-mono font-bold text-xs text-[#B85D3E] min-w-[55px] text-right">
                                € {(m.quantity * m.unitPrice).toFixed(2)}
                              </span>

                              {/* Dzēst */}
                              <button
                                type="button"
                                onClick={() => removeMaterialFromActiveGift(m.materialId)}
                                className="text-[#A39D98] hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Dzēst materiālu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Poga atvērt katalogu jaunu materiālu pievienošanai */}
                    <button
                      type="button"
                      onClick={() => setIsCatalogModalOpen(true)}
                      className="w-full py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#B85D3E] border border-dashed border-[#B85D3E]/40 hover:border-[#B85D3E] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B85D3E] group-hover:scale-125 transition-transform" />
                      <span>Pievienot vēl materiālus no kataloga</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Kopsavilkuma kalkulators (Puncts 4 no Lindas) */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-3">
                <h4 className="font-heading font-semibold text-sm text-[#2A2624]">
                  Cenas un Apmaksas Aprēķins
                </h4>

                <div className="space-y-1.5 text-xs text-[#7A736E]">
                  <div className="flex justify-between">
                    <span>Iesaiņošanas darba samaksa ({gifts.length} dāv.):</span>
                    <span className="font-mono font-semibold text-[#2A2624]">€ {labor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Izvēlētie materiāli:</span>
                    <span className="font-mono font-semibold text-[#2A2624]">€ {materials.toFixed(2)}</span>
                  </div>
                  {packagingChoice === "TRUST_MASTER" && provisionalLimit && (
                    <div className="flex justify-between text-[#606C5A] font-semibold">
                      <span>Saskaņotais budžeta limits:</span>
                      <span className="font-mono">max € {parseFloat(provisionalLimit).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#ECE6DC] text-sm font-bold text-[#2A2624]">
                    <span>Kopējā aprēķinātā summa:</span>
                    <span className="font-mono text-[#B85D3E]">€ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-[#7A736E] border-t border-[#ECE6DC]/60">
                  {packagingChoice === "TRUST_MASTER" ? (
                    <span className="text-[#606C5A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      Meistars izvēlēsies materiālus norādītā budžeta ietvaros. Kases čeks un apmaksa tiek fiksēta 4. solī vai pie saņemšanas.
                    </span>
                  ) : (
                    <span>
                      🎨 Precīzs aprēķins pēc kataloga materiāliem. Apmaksa un kases čeks tiks reģistrēti 4. solī pēc klienta parakstīšanās.
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ================= SOLIS 4: Paraksts ================= */}
          {step === 4 && (
            <div className="space-y-6">
              
              <div className="text-center space-y-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#B85D3E]">
                  Pēdējais solis pirms pasūtījuma nodošanas
                </span>
                <h3 className="font-heading font-bold text-lg text-[#2A2624]">
                  Pasūtījuma Kopsavilkums & Klienta Paraksts
                </h3>
                <p className="text-xs text-[#7A736E]">
                  Lūdzu pagrieziet planšeti klientam, lai viņš iepazīstas ar pasūtījuma čeku un apstiprina to ar parakstu.
                </p>
              </div>

              {/* ČEKA VEIDA KOPSAVILKUMS (RECEIPT AUDIT CARD) */}
              <div className="bg-white rounded-3xl border border-[#E5DFD5] shadow-xs overflow-hidden">
                
                {/* Čeka galvene */}
                <div className="bg-[#FAF8F5] px-5 py-3.5 border-b border-[#E5DFD5] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#2A2624] text-white flex items-center justify-center font-serif font-bold text-sm">
                      M
                    </div>
                    <div>
                      <span className="font-heading font-bold text-xs text-[#2A2624] block uppercase tracking-wider">
                        SIA Manilla Dāvanu Čeks
                      </span>
                      <span className="text-[11px] text-[#7A736E]">
                        Filiāle: {storeBranch}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#7A736E] block font-medium">Gatavs saņemšanai:</span>
                    <span className="text-xs font-bold text-[#2A2624] font-mono">
                      {pickupDate} plkst. {pickupTime}
                    </span>
                  </div>
                </div>

                {/* Klienta dati */}
                <div className="px-5 py-2.5 bg-white border-b border-[#ECE6DC] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#7A736E] text-[10px] block uppercase tracking-wider">Klients</span>
                    <span className="font-bold text-[#2A2624]">{customerName || "Klients"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#7A736E] text-[10px] block uppercase tracking-wider">Tālrunis (SMS paziņojumam)</span>
                    <span className="font-bold font-mono text-[#2A2624]">{customerPhone}</span>
                  </div>
                </div>

                {/* Dāvanu saraksts kā čekā */}
                <div className="p-5 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#7A736E] flex items-center justify-between">
                    <span>Nodotie priekšmeti & iesaiņojums ({gifts.length}):</span>
                    <span className="text-[11px] font-normal lowercase text-[#A39D98]">darba maksa un materiāli</span>
                  </div>

                  <div className="space-y-4 divide-y divide-[#ECE6DC]">
                    {gifts.map((g, idx) => {
                      const giftLabor = g.isThirdParty ? 3.5 : 2.5;
                      const giftMatTotal = g.materials.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0);
                      const giftTotal = giftLabor + giftMatTotal;

                      return (
                        <div key={g.id} className={idx > 0 ? "pt-4 space-y-2.5" : "space-y-2.5"}>
                          
                          {/* Dāvanas nosaukums, foto un darba samaksa */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              {g.photoUrl ? (
                                <img
                                  src={g.photoUrl}
                                  alt="Priekšmeta foto"
                                  className="w-12 h-12 rounded-xl object-cover border border-[#E5DFD5] shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-[#B85D3E] flex items-center justify-center shrink-0 font-bold text-xs">
                                  {idx + 1}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-xs text-[#2A2624]">
                                  {idx + 1}. {g.title.trim() || `Dāvana #${idx + 1}`}
                                </h4>

                                {/* Izcelsmes un darba samaksas cena: ĀRPUS vs MANILLA */}
                                <div className="flex items-center gap-2 mt-1">
                                  {g.isThirdParty ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B85D3E] bg-[#F7EBE7] px-2 py-0.5 rounded-md border border-[#B85D3E]/20">
                                      🛍️ Ārpus veikala — Darba samaksa: € 3.50
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#606C5A] bg-[#EEF2EC] px-2 py-0.5 rounded-md border border-[#606C5A]/20">
                                      🎁 Manilla prece — Darba samaksa: € 2.50
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-[#7A736E] block">Kopā dāvanai:</span>
                              <span className="font-mono font-bold text-xs text-[#2A2624]">
                                € {giftTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Klienta komentārs / priekšmeta stāvoklis pirms iesaiņošanas */}
                          {g.conditionNotes && g.conditionNotes.trim() && (
                            <div className="bg-[#FAF8F5] border-l-2 border-[#D99B26] px-3 py-2 rounded-r-xl text-xs text-[#7A736E] flex items-start gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#D99B26] shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-[#2A2624] font-semibold">Piezīme par stāvokli / Defekti:</strong>{" "}
                                <span>{g.conditionNotes.trim()}</span>
                              </div>
                            </div>
                          )}

                          {/* Šai dāvanai izvēlētie materiāli */}
                          {g.materials.length > 0 && (
                            <div className="pl-3 sm:pl-11 space-y-1 text-xs">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A736E] block">
                                Izvēlētie materiāli ({g.materials.length}):
                              </span>
                              <div className="space-y-1 bg-[#FAF8F5]/60 p-2.5 rounded-xl border border-[#ECE6DC]">
                                {g.materials.map((m) => {
                                  const isRibbon = m.unit === "METRS";
                                  return (
                                    <div key={m.materialId} className="flex justify-between items-center text-[#7A736E]">
                                      <div className="flex items-center gap-2 min-w-0">
                                        {m.imageUrl ? (
                                          <img
                                            src={m.imageUrl}
                                            alt=""
                                            className="w-5 h-5 rounded-md object-cover border border-black/10 shrink-0"
                                          />
                                        ) : m.swatchColor ? (
                                          <span
                                            className="w-3 h-3 rounded-full shrink-0 border border-black/15"
                                            style={{ backgroundColor: m.swatchColor }}
                                          />
                                        ) : null}
                                        <span className="truncate">
                                          {m.name} ({m.quantity} {isRibbon ? "m" : "gab."})
                                        </span>
                                      </div>
                                      <span className="font-mono text-xs font-semibold text-[#2A2624] shrink-0 pl-2">
                                        € {(m.quantity * m.unitPrice).toFixed(2)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                  {/* Kopsavilkuma rēķins / Aprēķins */}
                  <div className="pt-3.5 border-t-2 border-dashed border-[#E5DFD5] space-y-1.5 text-xs text-[#7A736E]">
                    <div className="flex justify-between">
                      <span>Iesaiņošanas darba samaksa ({gifts.length} dāv.):</span>
                      <span className="font-mono font-semibold text-[#2A2624]">€ {labor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Visi izvēlētie materiāli:</span>
                      <span className="font-mono font-semibold text-[#2A2624]">€ {materials.toFixed(2)}</span>
                    </div>

                    {packagingChoice === "TRUST_MASTER" && provisionalLimit && (
                      <div className="flex justify-between text-[#606C5A] font-semibold">
                        <span>Saskaņotais provizoriskais limits:</span>
                        <span className="font-mono font-bold">max € {parseFloat(provisionalLimit).toFixed(2)}</span>
                      </div>
                    )}

                    {packagingChoice === "TRUST_MASTER" ? (
                      <div className="flex justify-between text-[#7A736E]">
                        <span>Apmaksas statuss:</span>
                        <span className="font-semibold text-[#B85D3E]">Apmaksa pie saņemšanas (Provizoriska cena)</span>
                      </div>
                    ) : paymentStatus === "APMAKSATS" ? (
                      <div className="flex justify-between text-[#606C5A] font-semibold">
                        <span>Apmaksas statuss:</span>
                        <span className="font-mono">Apmaksāts kasē {cashReceiptNo ? `(${cashReceiptNo})` : ""}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-[#7A736E]">
                        <span>Apmaksas statuss:</span>
                        <span className="font-medium text-[#2A2624]">Apmaksa pie pasūtījuma saņemšanas</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2.5 border-t border-[#ECE6DC] text-base font-bold text-[#2A2624]">
                      <span>Kopā apmaksai:</span>
                      <span className="font-mono text-[#B85D3E] text-lg">€ {total.toFixed(2)}</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Dzīvais skārienjutīgais Canvas paraksts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#2A2624] flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-[#B85D3E]" />
                    Klienta paraksts (ar pirkstu vai irbuli)
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs text-[#7A736E] hover:text-[#2A2624] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Notīrīt parakstu
                  </button>
                </div>

                <div className="border-2 border-dashed border-[#E5DFD5] rounded-2xl bg-white p-2">
                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 bg-[#FAF8F5]/30 rounded-xl cursor-crosshair touch-none"
                  />
                  <div className="text-center text-[10px] text-[#A39D98] pt-1">
                    Parakstoties, klients apliecina nodoto priekšmetu stāvokli un pasūtījuma noteikumus.
                  </div>
                </div>
              </div>

              {/* Apmaksas reģistrācija kasē (Kases čeks) */}
              <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E5DFD5] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#2A2624]">
                      Apmaksas Reģistrācija Kasē
                    </h4>
                    <p className="text-[11px] text-[#7A736E] mt-0.5">
                      {packagingChoice === "TRUST_MASTER"
                        ? "Tā kā klients uzticas meistara gaumei, gala summa būs zināma tikai pēc iesaiņošanas. Apmaksa iespējama tikai pie saņemšanas."
                        : "Norādiet, vai klients veic apmaksu uzreiz pie pieņemšanas vai saņemot dāvanu."}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#B85D3E] bg-[#F7EBE7] px-2.5 py-1 rounded-xl border border-[#B85D3E]/20">
                    {packagingChoice === "TRUST_MASTER" && provisionalLimit
                      ? `Limits: līdz € ${parseFloat(provisionalLimit).toFixed(2)}`
                      : `Kopā: € ${total.toFixed(2)}`}
                  </span>
                </div>

                {/* Brīdinājums, ja izvēlēts uzticēties meistaram */}
                {packagingChoice === "TRUST_MASTER" && (
                  <div className="bg-[#EEF2EC] p-3 rounded-2xl border border-[#606C5A]/30 text-xs text-[#3E4739] flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 shrink-0 text-[#606C5A]" />
                    <div>
                      <strong className="text-[#606C5A]">Provizoriskā cena:</strong> Tūlītēja priekšapmaksa ir atspējota, jo meistars materiālus piemeklēs ateljē darba gaitā. Klients veiks apmaksu pie saņemšanas.
                    </div>
                  </div>
                )}

                {/* 2 varianti: Apmaksāts tagad VAI Apmaksa pie saņemšanas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={packagingChoice === "TRUST_MASTER"}
                    onClick={() => {
                      if (packagingChoice !== "TRUST_MASTER") {
                        setPaymentStatus("APMAKSATS");
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      packagingChoice === "TRUST_MASTER"
                        ? "bg-[#FAF8F5]/80 border-[#E5DFD5] opacity-45 cursor-not-allowed select-none"
                        : paymentStatus === "APMAKSATS"
                        ? "bg-white border-[#606C5A] ring-2 ring-[#606C5A]/20 shadow-xs cursor-pointer"
                        : "bg-white/60 border-[#E5DFD5] hover:bg-white cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#2A2624] flex items-center gap-1.5">
                        <span>💳</span> Apmaksāts tagad kasē (Priekšapmaksa)
                      </span>
                      {paymentStatus === "APMAKSATS" && packagingChoice !== "TRUST_MASTER" && (
                        <CheckCircle2 className="w-4 h-4 text-[#606C5A]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A736E]">
                      {packagingChoice === "TRUST_MASTER"
                        ? "Nav pieejams provizoriskajai cenai (gala summa taps zināma pēc materiālu izlietojuma)."
                        : "Klients apmaksā uz vietas. Obligāti jāievada kases čeka numurs nodokļu uzskaitei."}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("NEAPMAKSATS");
                      setCashReceiptNo("");
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentStatus === "NEAPMAKSATS" || packagingChoice === "TRUST_MASTER"
                        ? "bg-white border-[#B85D3E] ring-2 ring-[#B85D3E]/20 shadow-xs"
                        : "bg-white/60 border-[#E5DFD5] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#2A2624] flex items-center gap-1.5">
                        <span>🕒</span> Apmaksa pie saņemšanas (Pēcapmaksa)
                      </span>
                      {(paymentStatus === "NEAPMAKSATS" || packagingChoice === "TRUST_MASTER") && (
                        <CheckCircle2 className="w-4 h-4 text-[#B85D3E]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A736E]">
                      {packagingChoice === "TRUST_MASTER"
                        ? "Obligāts režīms meistara gaumei. Čeks tiks pieprasīts pie pasūtījuma izsniegšanas pēc gala aprēķina."
                        : "Klients maksās saņemot dāvanu. Čeka numurs tiks pieprasīts pie pasūtījuma izsniegšanas."}
                    </p>
                  </button>
                </div>

                {/* Ja izvēlēts Apmaksāts tagad kasē (tikai manuālajā režīmā) -> OBLIGĀTS kases čeka numurs */}
                {paymentStatus === "APMAKSATS" && packagingChoice !== "TRUST_MASTER" && (
                  <div className="bg-white p-3.5 rounded-2xl border border-[#606C5A]/30 space-y-2 animate-in fade-in">
                    <label className="text-xs font-bold text-[#2A2624] flex items-center justify-between">
                      <span>Kases čeka numurs <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-[#606C5A] font-semibold uppercase tracking-wider">
                        Fiskālā atskaite / VID
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="piem. Čeks #89455 vai 89455"
                      value={cashReceiptNo}
                      onChange={(e) => setCashReceiptNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-xs font-mono font-bold text-[#2A2624] focus:outline-none focus:border-[#606C5A]"
                    />
                    <p className="text-[10px] text-[#7A736E]">
                      Čeka numurs tiks neatgriezeniski piesaistīts pasūtījuma audita failam un uzrādīts klienta līgumā.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Apakšējā pogu josla */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5DFD5] hover:bg-[#FAF8F5] text-[#7A736E] hover:text-[#2A2624] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atpakaļ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 bg-white border border-[#E5DFD5] hover:bg-[#FAF8F5] text-[#7A736E] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Atcelt
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B85D3E] hover:bg-[#A24E32] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Nākamais solis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitOrder}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#606C5A] hover:bg-[#4E5949] text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Saglabājam..." : "Apstiprināt & Izveidot pasūtījumu"}</span>
            </button>
          )}
        </div>

      </div>

      {/* ================= PĀRKLĀJUMA MODĀLAIS LOGS: MATERIĀLU KATALOGS AR PRECIZU DAUDZUMU ================= */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E5DFD5] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            
            {/* Galvene */}
            <div className="px-6 py-4 bg-white border-b border-[#E5DFD5] flex items-center justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#B85D3E] bg-[#F7EBE7] px-2.5 py-0.5 rounded-lg border border-[#B85D3E]/20">
                    Dāvana: {gifts[activeGiftIndex]?.title.trim() || `Dāvana #${activeGiftIndex + 1}`}
                  </span>
                  <h3 className="font-heading font-bold text-base text-[#2A2624]">
                    Materiālu Katalogs & Garuma Izvēle
                  </h3>
                </div>
                <p className="text-[11px] text-[#7A736E] mt-0.5">
                  Izvēlieties iesaiņojuma papīru, lentes ar precīziem metriem, kastes un dekorus
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="p-1.5 text-[#A39D98] hover:text-[#2A2624] hover:bg-[#ECE6DC] rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kategoriju cilnes un meklēšana */}
            <div className="px-6 py-3 bg-[#FAF8F5] border-b border-[#E5DFD5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              {/* Kategorijas */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                {[
                  { id: "ALL", label: "Visi materiāli" },
                  { id: "PAPIRS", label: "Papīrs" },
                  { id: "LENTE", label: "Lentes (m)" },
                  { id: "KASTE", label: "Kastes" },
                  { id: "ZIDPAPIRS", label: "Zīdpapīrs" },
                  { id: "DEKORS", label: "Dekors" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCatalogCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium whitespace-nowrap ${
                      catalogCategory === cat.id
                        ? "bg-[#2A2624] text-white shadow-2xs font-semibold"
                        : "bg-white text-[#7A736E] hover:text-[#2A2624] border border-[#E5DFD5]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Svītrkoda skeneris un meklētājs */}
              <form onSubmit={handleCatalogScanSubmit} className="relative min-w-[260px] sm:min-w-[320px]">
                <Barcode className="w-4 h-4 text-[#B85D3E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={catalogSearchInputRef}
                  type="text"
                  placeholder="Ieskenējiet svītrkodu (EAN) vai meklējiet..."
                  value={catalogSearch}
                  onChange={(e) => {
                    setCatalogSearch(e.target.value);
                    if (catalogScanFeedback) setCatalogScanFeedback(null);
                  }}
                  className="w-full pl-9 pr-24 py-1.5 bg-white border border-[#E5DFD5] rounded-xl text-xs text-[#2A2624] focus:outline-none focus:border-[#B85D3E] shadow-2xs font-sans"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-[#606C5A] font-bold bg-[#EEF2EC] hover:bg-[#E2EAE0] px-2 py-0.5 rounded-lg border border-[#606C5A]/25 cursor-pointer transition-colors"
                  title="Pievienot ieskenēto svītrkodu"
                >
                  <Barcode className="w-3 h-3 text-[#606C5A]" />
                  <span>Skenēt</span>
                </button>
              </form>
            </div>

            {/* Skenēšanas paziņojums (Veiksmīgs / Neatrasts svītrkods) */}
            {catalogScanFeedback && (
              <div
                className={`px-6 py-2.5 border-b flex items-center justify-between text-xs animate-in fade-in duration-150 shrink-0 ${
                  catalogScanFeedback.type === "success"
                    ? "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/30 font-semibold"
                    : "bg-[#F7EBE7] text-[#B85D3E] border-[#B85D3E]/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {catalogScanFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#606C5A] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#B85D3E] shrink-0" />
                  )}
                  <span>{catalogScanFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCatalogScanFeedback(null)}
                  className="text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer ml-3 shrink-0"
                >
                  Aizvērt
                </button>
              </div>
            )}

            {/* Materiālu saraksts/režģis */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-[#FAF8F5]/60">
              {catalogMaterials
                .filter((item) => {
                  const matchCat = catalogCategory === "ALL" || item.category === catalogCategory;
                  const query = catalogSearch.trim().toLowerCase();
                  const matchQuery =
                    !query ||
                    item.name.toLowerCase().includes(query) ||
                    item.code.toLowerCase().includes(query) ||
                    (item.barcode && item.barcode.toLowerCase().includes(query));
                  return matchCat && matchQuery;
                })
                .map((item) => {
                  const isRibbon = item.unit === "METRS";
                  const currentDraftQty = getDraftQuantity(item);
                  const itemSubtotal = currentDraftQty * item.pricePerUnit;
                  const alreadyAdded = gifts[activeGiftIndex]?.materials.find(
                    (m) => m.materialId === item.id
                  );

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-3 sm:p-3.5 border transition-all flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md ${
                        alreadyAdded
                          ? "border-[#606C5A] ring-2 ring-[#606C5A]/30 bg-[#FAF8F5]/40"
                          : "border-[#E5DFD5] hover:border-[#B85D3E]/40"
                      }`}
                    >
                      <div>
                        {/* Preces fotogrāfija klientam un meistaram */}
                        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E5DFD5] mb-2.5 group">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : item.swatchColor ? (
                            <div
                              className="w-full h-full flex items-center justify-center opacity-75"
                              style={{ backgroundColor: item.swatchColor }}
                            >
                              <Layers className="w-8 h-8 text-white/50" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#E5DFD5]">
                              <Layers className="w-8 h-8 text-[#A39D98]" />
                            </div>
                          )}

                          {/* Peldošās nozīmītes virs attēla */}
                          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A2624] bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-black/10 shadow-xs">
                              {item.category === "PAPIRS" && "Papīrs"}
                              {item.category === "LENTE" && "Lente"}
                              {item.category === "KASTE" && "Kaste"}
                              {item.category === "ZIDPAPIRS" && "Zīdpapīrs"}
                              {item.category === "DEKORS" && "Dekors"}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#B85D3E] bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-[#B85D3E]/20 shadow-xs">
                              € {item.pricePerUnit.toFixed(2)} / {isRibbon ? "m" : item.unit === "LOKSNE" ? "loksne" : "gab."}
                            </span>
                          </div>

                          {alreadyAdded && (
                            <div className="absolute bottom-2 left-2 bg-[#606C5A] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <span>✓ Pievienots</span>
                            </div>
                          )}
                        </div>

                        {/* Nosaukums, kods un krāsas paraugs */}
                        <div className="flex items-start gap-2">
                          {item.swatchColor && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 mt-0.5 shadow-2xs"
                              style={{ backgroundColor: item.swatchColor }}
                              title={`Krāsa: ${item.swatchColor}`}
                            />
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#2A2624] leading-snug line-clamp-2">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#A39D98] font-mono mt-0.5 flex-wrap">
                              <span>Kods: {item.code}</span>
                              {item.barcode && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#606C5A] bg-[#EEF2EC] px-1.5 py-0.5 rounded border border-[#606C5A]/20 flex items-center gap-1 font-semibold">
                                    <Barcode className="w-3 h-3 text-[#606C5A]" />
                                    {item.barcode}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Daudzuma un metru izvēle ar reāllaika aprēķinu */}
                      <div className="space-y-2 pt-2 border-t border-[#ECE6DC]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#7A736E] text-[11px] font-medium">
                            {isRibbon ? "Izvēlieties garumu:" : "Izvēlieties daudzumu:"}
                          </span>

                          {/* REĀLLAIKA MATEMĀTIKA */}
                          <span className="font-mono font-bold text-xs text-[#2A2624]">
                            Kopā: <strong className="text-[#B85D3E]">€ {itemSubtotal.toFixed(2)}</strong>
                          </span>
                        </div>

                        {/* Ātrās pogas lentēm (1m, 2m, 3m, 4m - tikai veseli metri) */}
                        {isRibbon && (
                          <div className="grid grid-cols-4 gap-1">
                            {[1, 2, 3, 4].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setDraftQuantity(item.id, preset)}
                                className={`py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                                  currentDraftQty === preset
                                    ? "bg-[#B85D3E] text-white border-[#B85D3E] shadow-2xs"
                                    : "bg-[#FAF8F5] text-[#7A736E] border-[#E5DFD5] hover:bg-white"
                                }`}
                              >
                                {preset} m
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Daudzuma regulētājs un pievienošana (tikai veseli skaitļi) */}
                        <div className="flex items-center justify-between gap-2 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E5DFD5]">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setDraftQuantity(
                                  item.id,
                                  Math.max(1, currentDraftQty - 1)
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center bg-white hover:bg-[#ECE6DC] text-[#2A2624] rounded-lg border border-[#E5DFD5] text-xs font-bold transition-colors cursor-pointer"
                              title={isRibbon ? "-1 m" : "-1 gab."}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              inputMode="numeric"
                              step="1"
                              min="1"
                              value={Math.round(currentDraftQty)}
                              onKeyDown={(e) => {
                                if (e.key === "." || e.key === "," || e.key === "-" || e.key === "e") {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setDraftQuantity(item.id, isNaN(val) || val < 1 ? 1 : val);
                              }}
                              className="w-14 text-center bg-white border border-[#E5DFD5] rounded-lg font-mono font-bold text-xs text-[#2A2624] py-1 focus:outline-none focus:border-[#B85D3E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[11px] text-[#7A736E] font-medium pl-0.5">
                              {isRibbon ? "m" : item.unit === "LOKSNE" ? "loksnes" : "gab."}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setDraftQuantity(item.id, currentDraftQty + 1)
                              }
                              className="w-7 h-7 flex items-center justify-center bg-white hover:bg-[#ECE6DC] text-[#2A2624] rounded-lg border border-[#E5DFD5] text-xs font-bold transition-colors cursor-pointer"
                              title={isRibbon ? "+1 m" : "+1 gab."}
                            >
                              +
                            </button>
                          </div>

                          {/* Poga: Pievienot vai Atjaunot */}
                          <button
                            type="button"
                            onClick={() => setOrAddMaterialInActiveGift(item, currentDraftQty)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              alreadyAdded
                                ? "bg-[#606C5A] hover:bg-[#4E5949] text-white shadow-2xs"
                                : "bg-[#2A2624] hover:bg-[#B85D3E] text-white shadow-2xs"
                            }`}
                          >
                            {alreadyAdded ? "✓ Atjaunot" : "+ Pievienot"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Kājene */}
            <div className="px-6 py-3.5 bg-white border-t border-[#E5DFD5] flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#7A736E]">
                Šai dāvanai izvēlēti:{" "}
                <strong className="text-[#2A2624]">
                  {gifts[activeGiftIndex]?.materials.length || 0} materiāli
                </strong>{" "}
                (Kopā: €{" "}
                {(gifts[activeGiftIndex]?.materials || [])
                  .reduce((sum, m) => sum + m.quantity * m.unitPrice, 0)
                  .toFixed(2)}
                )
              </div>

              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-5 py-2 bg-[#B85D3E] hover:bg-[#9E4D32] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Gatavs, saglabāt izvēli
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
