"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Pieslēgšanās neizdevās");
        return;
      }

      login(data.user);
    } catch (err) {
      console.error(err);
      setError("Neizdevās sazināties ar serveri");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = async (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: presetEmail, password: presetPass }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Pieslēgšanās neizdevās");
        return;
      }

      login(data.user);
    } catch (err) {
      console.error(err);
      setError("Neizdevās sazināties ar serveri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col justify-between p-4 sm:p-6 font-sans text-[#2A2624]">
      
      {/* Augšējais dekors */}
      <div className="max-w-md w-full mx-auto pt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E5DFD5] text-xs text-[#7A736E] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#606C5A]" />
          <span>SIA &ldquo;MANILLA&rdquo; Iekšējā Darba Vide</span>
        </div>
      </div>

      {/* Galvenā pieteikšanās kartīte */}
      <div className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl border border-[#E5DFD5] shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Zīmols */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src="/manilla-logo.png"
              alt="MANILLA"
              className="h-12 w-auto object-contain"
            />
          </div>
          <h1 className="font-heading font-bold text-xl text-[#2A2624] tracking-tight">
            Darbinieku Autorizācija
          </h1>
          <p className="text-xs text-[#7A736E]">
            Dāvanu iesaiņošanas ateljē & kases pārvaldības POS sistēma
          </p>
        </div>

        {/* Kļūdas paziņojums */}
        {error && (
          <div className="p-3 bg-[#FDF2EE] border border-[#B85D3E]/30 rounded-xl text-xs text-[#B85D3E] flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pieteikšanās forma */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#2A2624] block">
              E-pasta adrese
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A39D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vards@manilla.lv"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E5DFD5] focus:border-[#B85D3E] focus:bg-white rounded-xl text-sm text-[#2A2624] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#2A2624] block">
                Parole
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A39D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E5DFD5] focus:border-[#B85D3E] focus:bg-white rounded-xl text-sm text-[#2A2624] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A39D98] hover:text-[#2A2624]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#B85D3E] hover:bg-[#A24E32] active:scale-[0.99] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Pārbaudām datus..." : "Pieslēgties terminālim"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Ātrā demo piekļuve */}
        <div className="pt-4 border-t border-[#ECE6DC] space-y-2">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#7A736E] block text-center">
            Ātrā piekļuve demonstrācijai (1 klikšķis):
          </span>
          
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPreset("ieva@manilla.lv", "ieva2026")}
              className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EEF2EC] border border-[#E5DFD5] hover:border-[#606C5A]/40 transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EEF2EC] text-[#606C5A] font-bold flex items-center justify-center text-[10px]">
                  IK
                </span>
                <div>
                  <div className="font-semibold text-[#2A2624] text-[11px]">Ieva Kalniņa</div>
                  <div className="text-[9.5px] text-[#7A736E]">Galvenais Meistars • Tērbatas 55</div>
                </div>
              </div>
              <span className="text-[10px] text-[#606C5A] font-medium group-hover:underline">Izvēlēties →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset("linda@manilla.lv", "manilla2026")}
              className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#FDF2EE] border border-[#E5DFD5] hover:border-[#B85D3E]/40 transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#FDF2EE] text-[#B85D3E] font-bold flex items-center justify-center text-[10px]">
                  LL
                </span>
                <div>
                  <div className="font-semibold text-[#2A2624] text-[11px]">Linda Lukstiņa</div>
                  <div className="text-[9.5px] text-[#7A736E]">Vadītāja / Admin • Visas filiāles</div>
                </div>
              </div>
              <span className="text-[10px] text-[#B85D3E] font-medium group-hover:underline">Izvēlēties →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset("marta@manilla.lv", "marta2026")}
              className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#2A2624]/30 transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-stone-100 text-[#2A2624] font-bold flex items-center justify-center text-[10px]">
                  ML
                </span>
                <div>
                  <div className="font-semibold text-[#2A2624] text-[11px]">Marta Liepiņa</div>
                  <div className="text-[9.5px] text-[#7A736E]">Kasieris / Personāls • Galerija Centrs</div>
                </div>
              </div>
              <span className="text-[10px] text-[#2A2624] font-medium group-hover:underline">Izvēlēties →</span>
            </button>
          </div>
        </div>

      </div>

      {/* Kājene */}
      <div className="text-center text-[11px] text-[#A39D98] pt-4 pb-2">
        SIA &ldquo;MANILLA&rdquo; • Tērbatas iela 55, Rīga • Šifrēta datu aizsardzība un audita protokols
      </div>

    </div>
  );
}
