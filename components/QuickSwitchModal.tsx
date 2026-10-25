"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Lock,
  Key,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
} from "lucide-react";
import { AuthUser } from "@/context/AuthContext";

export interface TargetStaffUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  storeBranch: string;
  hasQuickPin?: boolean;
}

interface QuickSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: TargetStaffUser | null;
  onSuccess: (switchedUser: AuthUser) => void;
}

export function QuickSwitchModal({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}: QuickSwitchModalProps) {
  const [mounted, setMounted] = useState(false);
  const [credential, setCredential] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      setCredential("");
      setError(null);
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser || !mounted) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Administrators",
          color: "bg-[#F7EBE7] text-[#B85D3E] border-[#B85D3E]/30",
        };
      case "MEISTARS":
        return {
          label: "Meistars",
          color: "bg-[#EEF2EC] text-[#606C5A] border-[#606C5A]/30",
        };
      case "KASIERIS":
        return {
          label: "Kasieris",
          color: "bg-[#FDF6E8] text-[#D99B26] border-[#D99B26]/30",
        };
      default:
        return {
          label: role,
          color: "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
  };

  const roleInfo = getRoleBadge(targetUser.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) {
      setError("Lūdzu, ievadiet PIN kodu vai paroli");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/verify-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: targetUser.id,
          targetEmail: targetUser.email,
          targetName: targetUser.fullName,
          credential: credential.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Nepareizs PIN kods vai parole");
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Pārslēgšanās neizdevās");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E5DFD5] max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Galvene */}
        <div className="px-6 py-4 bg-white border-b border-[#E5DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F7EBE7] text-[#B85D3E] flex items-center justify-center font-bold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#2A2624]">
                Pārslēgt Operatoru
              </h3>
              <p className="text-[11px] text-[#7A736E]">
                Planšetes ātrā autorizācija
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF8F5] hover:bg-[#E5DFD5] text-[#7A736E] hover:text-[#2A2624] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mērķa lietotāja kartīte */}
        <div className="p-6 space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5DFD5] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2EC] text-[#606C5A] flex items-center justify-center font-bold text-xs border border-[#606C5A]/30">
                {getInitials(targetUser.fullName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#2A2624]">
                    {targetUser.fullName}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${roleInfo.color}`}
                  >
                    {roleInfo.label}
                  </span>
                </div>
                <div className="text-[11px] text-[#7A736E] flex items-center gap-1 mt-0.5">
                  <Store className="w-3 h-3 text-[#B85D3E]" />
                  <span>{targetUser.storeBranch}</span>
                </div>
              </div>
            </div>

            <span className="text-[10px] text-[#7A736E] font-mono bg-[#FAF8F5] px-2 py-1 rounded-lg border border-[#E5DFD5]">
              {targetUser.hasQuickPin ? "4-ciparu PIN" : "Parole"}
            </span>
          </div>

          {/* Forma */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2A2624]">
                Ievadiet {targetUser.fullName.split(" ")[0]} PIN kodu vai paroli:
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  data-testid="switch-credential-input"
                  type={showPassword ? "text" : "password"}
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder={
                    targetUser.hasQuickPin
                      ? "Ievadiet 4-ciparu PIN"
                      : "Ievadiet pilno paroli"
                  }
                  className="w-full bg-white border border-[#E5DFD5] focus:border-[#B85D3E] focus:ring-2 focus:ring-[#B85D3E]/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono text-[#2A2624] outline-hidden shadow-2xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A736E] hover:text-[#2A2624] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-[#FDF2EE] border border-[#B85D3E]/30 rounded-xl text-xs text-[#B85D3E] flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#2A2624] border border-[#E5DFD5] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Atcelt
              </button>

              <button
                data-testid="switch-submit-btn"
                type="submit"
                disabled={loading || !credential.trim()}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#B85D3E] hover:bg-[#A24E32] active:scale-[0.98] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Apstiprināt & Pārslēgt</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>,
    document.body
  );
}
