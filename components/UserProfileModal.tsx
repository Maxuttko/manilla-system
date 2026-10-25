"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Lock,
  Key,
  LogOut,
  Check,
  AlertCircle,
  RefreshCw,
  Store,
  Eye,
  EyeOff,
  Smartphone,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { currentUser, logoutUser, updateCurrentUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Paroles maiņas stāvokļi
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // PIN koda maiņas stāvokļi
  const [quickPin, setQuickPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinStatus, setPinStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPasswordStatus({ type: null, message: "" });
      setPinStatus({ type: null, message: "" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setQuickPin("");
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser || !mounted) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Administrators",
          desc: "Vadītājs & finanšu piekļuve",
          color: "bg-[#F7EBE7] text-[#B85D3E] border-[#B85D3E]/30",
        };
      case "MEISTARS":
        return {
          label: "Iesaiņošanas Meistars",
          desc: "Pasūtījumu izpilde & darbnīca",
          color: "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/30",
        };
      case "KASIERIS":
        return {
          label: "Kases Operators",
          desc: "Pieņemšana, izsniegšana & čeki",
          color: "bg-[#FDF6E8] text-[#D99B26] border-[#D99B26]/30",
        };
      default:
        return {
          label: role,
          desc: "Darbinieks",
          color: "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
  };

  const currentRoleInfo = getRoleBadge(currentUser.role);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Paroles maiņas apstrāde
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    if (!currentPassword) {
      setPasswordStatus({
        type: "error",
        message: "Lūdzu, ievadiet pašreizējo paroli",
      });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordStatus({
        type: "error",
        message: "Jaunajai parolei jābūt vismaz 4 simbolus garai",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "Jaunās paroles nesakrīt",
      });
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kļūda mainot paroli");
      }

      setPasswordStatus({
        type: "success",
        message: "Parole veiksmīgi nomainīta!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordStatus({
        type: "error",
        message: err.message || "Neizdevās nomainīt paroli",
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Ātrā PIN koda maiņas apstrāde
  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatus({ type: null, message: "" });

    const pinClean = quickPin.trim();
    if (pinClean && (pinClean.length < 4 || pinClean.length > 8)) {
      setPinStatus({
        type: "error",
        message: "PIN kodam jābūt no 4 līdz 8 cipariem",
      });
      return;
    }

    try {
      setIsSubmittingPin(true);
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          newQuickPin: pinClean,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kļūda saglabājot PIN kodu");
      }

      setPinStatus({
        type: "success",
        message: pinClean
          ? "Ātrais PIN kods veiksmīgi saglabāts!"
          : "PIN kods veiksmīgi noņemts",
      });
      updateCurrentUser({
        ...currentUser,
        hasQuickPin: !!pinClean,
      });
      setQuickPin("");
    } catch (err: any) {
      setPinStatus({
        type: "error",
        message: err.message || "Neizdevās saglabāt PIN kodu",
      });
    } finally {
      setIsSubmittingPin(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E5DFD5] max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Galvene ar lietotāja kopsavilkumu */}
        <div className="px-6 py-4 bg-white border-b border-[#E5DFD5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#EEF2EC] text-[#606C5A] flex items-center justify-center font-bold text-sm border border-[#606C5A]/30 shadow-2xs">
              {getInitials(currentUser.fullName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base text-[#2A2624]">
                  {currentUser.fullName}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${currentRoleInfo.color}`}
                >
                  {currentRoleInfo.label}
                </span>
              </div>
              <p className="text-xs text-[#7A736E] flex items-center gap-2 mt-0.5">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Store className="w-3.5 h-3.5 text-[#B85D3E]" />
                  {currentUser.storeBranch}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF8F5] hover:bg-[#E5DFD5] text-[#7A736E] hover:text-[#2A2624] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ritinošais saturs */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-5">
          
          {/* Darba filiāle (Tikai lasāma parastam lietotājam, maināma tikai adminam) */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2A2624]">
                <Store className="w-4 h-4 text-[#B85D3E]" />
                <span>Piesaistītā filiāle (Darba vieta)</span>
              </div>
              <span className="text-[10.5px] px-2 py-0.5 rounded-full font-medium bg-[#FAF8F5] text-[#7A736E] border border-[#E5DFD5] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#A39D98]" />
                <span>Tikai administrators</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#2A2624]">
                  {currentUser.storeBranch}
                </div>
                <div className="text-[11px] text-[#7A736E]">
                  Veikala filiāli var mainīt tikai vadītājs (Linda Lukstiņa) administratīvajā panelī.
                </div>
              </div>
              <div className="w-6 h-6 rounded-lg bg-[#EEF2EC] text-[#606C5A] flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Ātrās pārslēgšanas PIN kods planšetei */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-2xs space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2A2624]">
                  <Smartphone className="w-4 h-4 text-[#606C5A]" />
                  <span>Planšetes PIN kods (Ātrai operatora maiņai)</span>
                </div>
                <p className="text-xs text-[#7A736E] leading-relaxed">
                  Uzstādiet 4 ciparu kodu, lai veiktu ātru pārslēgšanos no kolēģa uz kases planšetes bez pilnās paroles ievades klientu klātbūtnē.
                </p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                  currentUser.hasQuickPin
                    ? "bg-[#EEF2EC] text-[#606C5A] border border-[#606C5A]/30"
                    : "bg-[#FAF8F5] text-[#A39D98] border border-[#E5DFD5]"
                }`}
              >
                {currentUser.hasQuickPin ? "PIN Aktīvs" : "Nav uzstādīts"}
              </span>
            </div>

            <form onSubmit={handlePinChange} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={8}
                    value={quickPin}
                    onChange={(e) => setQuickPin(e.target.value.replace(/\D/g, ""))}
                    placeholder={
                      currentUser.hasQuickPin
                        ? "Ievadiet jaunu PIN kodu (piem. 2222)"
                        : "Uzstādiet 4 ciparu PIN kodu"
                    }
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] focus:border-[#606C5A] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#2A2624] font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A736E] hover:text-[#2A2624] cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPin}
                  className="px-4 py-2.5 bg-[#606C5A] hover:bg-[#4E5849] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5"
                >
                  {isSubmittingPin && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Saglabāt PIN</span>
                </button>
              </div>

              {pinStatus.type && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    pinStatus.type === "success"
                      ? "bg-[#EEF2EC] text-[#606C5A] border border-[#606C5A]/30"
                      : "bg-[#F7EBE7] text-[#B85D3E] border border-[#B85D3E]/30"
                  }`}
                >
                  {pinStatus.type === "success" ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{pinStatus.message}</span>
                </div>
              )}
            </form>
          </div>

          {/* Pilnās autorizācijas paroles maiņa */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2A2624]">
                <Lock className="w-4 h-4 text-[#B85D3E]" />
                <span>Mainīt personīgo paroli</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-xs text-[#7A736E] hover:text-[#2A2624] flex items-center gap-1 cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#B85D3E]" />}
                <span>{showPasswords ? "Slēpt" : "Rādīt paroles"}</span>
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#7A736E] mb-1">
                  Pašreizējā parole:
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ievadiet esošo paroli"
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] focus:border-[#B85D3E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#2A2624] outline-hidden transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A736E] mb-1">
                    Jaunā parole:
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Vismaz 4 simboli"
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] focus:border-[#B85D3E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#2A2624] outline-hidden transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A736E] mb-1">
                    Atkārtojiet jauno paroli:
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Vēlreiz jaunā parole"
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] focus:border-[#B85D3E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#2A2624] outline-hidden transition-all"
                  />
                </div>
              </div>

              {passwordStatus.type && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    passwordStatus.type === "success"
                      ? "bg-[#EEF2EC] text-[#606C5A] border border-[#606C5A]/30"
                      : "bg-[#F7EBE7] text-[#B85D3E] border border-[#B85D3E]/30"
                  }`}
                >
                  {passwordStatus.type === "success" ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingPassword || !currentPassword || !newPassword}
                  className="px-5 py-2.5 bg-[#B85D3E] hover:bg-[#A24E32] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingPassword && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Saglabāt jauno paroli</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Kājene ar Izrakstīšanās darbību */}
        <div className="px-6 py-4 bg-white border-t border-[#E5DFD5] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              logoutUser(currentUser.id);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#F7EBE7] hover:bg-[#B85D3E] text-[#B85D3E] hover:text-white border border-[#B85D3E]/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Izrakstīties no šīs ierīces</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#FAF8F5] hover:bg-[#E5DFD5] text-[#2A2624] border border-[#E5DFD5] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Aizvērt
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
