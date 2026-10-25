"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, UserCheck, Plus, Clock, ChevronDown, Check, MapPin, User as UserIcon, Key, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserProfileModal } from "./UserProfileModal";
import { QuickSwitchModal, TargetStaffUser } from "./QuickSwitchModal";

interface NavbarProps {
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  onNewOrder: () => void;
}

export function Navbar({ selectedBranch, onBranchChange, onNewOrder }: NavbarProps) {
  const { currentUser, authorizedUsers, switchUser } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSwitchDropdownOpen, setIsSwitchDropdownOpen] = useState(false);
  const [targetUserForSwitch, setTargetUserForSwitch] = useState<TargetStaffUser | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("lv-LV", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lokālie operatori, kas saglabāti ŠAJĀ konkrētajā planšetē/ierīcē
  const otherLocalStaff = (authorizedUsers || []).filter(
    (s) => s.id !== currentUser?.id
  );

  // Aizvērt izkrītošās izvēlnes, noklikšķinot ārpus tām
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsSwitchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const branches = [
    {
      id: "all",
      name: "Visas filiāles",
      desc: "Visi 3 veikali Rīgā",
      badge: "3 veikali",
    },
    {
      id: "Tērbatas iela 55",
      name: "Tērbatas iela 55",
      desc: "Flagship ateljē & darbnīca",
      badge: "Flagship",
    },
    {
      id: "T/C Galerija Centrs",
      name: "T/C Galerija Centrs",
      desc: "Audēju iela 16, 2. stāvs",
      badge: "10:00–21:00",
    },
    {
      id: "Tērbatas iela 54",
      name: "Manilla Kids",
      desc: "Tērbatas iela 54",
      badge: "Kids",
    },
  ];

  const currentBranchObj = branches.find((b) => b.id === selectedBranch) || branches[0];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E5DFD5] px-4 lg:px-8 py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        
        {/* Zīmols un Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-36 h-10 flex items-center">
              <Image
                src="/manilla-logo.png"
                alt="MANILLA"
                width={140}
                height={40}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </div>
            <div className="hidden sm:block border-l border-[#E5DFD5] pl-3 py-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#7A736E] block font-heading">
                Dāvanu Iesaiņošana
              </span>
              <span className="text-[11px] text-[#A39D98] block">
                Meistara & Kases POS
              </span>
            </div>
          </div>

          {/* Glīts pasūtījumu veikala filiāles izvēlnes poga (Custom Dropdown) */}
          <div ref={dropdownRef} className="relative hidden md:block">
            <button
              type="button"
              data-testid="branch-selector-button"
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-2.5 bg-white hover:bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#B85D3E]/50 rounded-xl px-3.5 py-1.5 text-xs text-[#2A2624] shadow-2xs transition-all cursor-pointer"
            >
              <div className="w-5 h-5 rounded-lg bg-[#F7EBE7] text-[#B85D3E] flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider text-[#7A736E] font-semibold block leading-none">
                  Filiāle
                </span>
                <span className="font-semibold text-xs text-[#2A2624] block mt-0.5">
                  {currentBranchObj.name}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7A736E] ml-1 transition-transform duration-200 ${
                  isBranchDropdownOpen ? "rotate-180 text-[#B85D3E]" : ""
                }`}
              />
            </button>

            {/* Izkrītošais estētiskais logs */}
            {isBranchDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl border border-[#E5DFD5] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 font-sans">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#7A736E] border-b border-[#ECE6DC]">
                  Izvēlieties veikala filiāli
                </div>

                {branches.map((b) => {
                  const isSelected = selectedBranch === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        onBranchChange(b.id);
                        setIsBranchDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#F7EBE7]/70 text-[#B85D3E] font-semibold"
                          : "hover:bg-[#FAF8F5] text-[#2A2624]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <MapPin
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isSelected ? "text-[#B85D3E]" : "text-[#7A736E]"
                          }`}
                        />
                        <div>
                          <div className="text-xs font-semibold">{b.name}</div>
                          <div className="text-[10px] text-[#7A736E]">{b.desc}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] bg-white border border-[#E5DFD5] text-[#7A736E] px-1.5 py-0.5 rounded font-mono">
                          {b.badge}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#B85D3E]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Labā puse: Pulkstenis, Meistars un Poga */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Reālais laiks */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#7A736E] bg-white border border-[#E5DFD5] px-3 py-1.5 rounded-xl font-mono tabular-nums shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#606C5A]" />
            <span>{currentTime || "12:00:00"}</span>
          </div>

          {/* Aktīvā darbinieka split-poga: Zona 1 = Profils, Zona 2 = Bultiņa pārslēgšanai */}
          {currentUser ? (
            <div ref={userMenuRef} className="relative">
              <div className="flex items-center bg-white border border-[#E5DFD5] hover:border-[#B85D3E]/40 rounded-xl shadow-2xs transition-all">
                {/* 1. Zona: Noklikšķināt uz sevis, lai atvērtu personīgo profilu */}
                <button
                  type="button"
                  data-testid="user-profile-button"
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#FAF8F5] rounded-l-xl transition-colors cursor-pointer text-left group"
                  title="Mans profils & drošības iestatījumi"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EEF2EC] text-[#606C5A] group-hover:bg-[#F7EBE7] group-hover:text-[#B85D3E] flex items-center justify-center font-bold text-xs border border-[#606C5A]/20 transition-colors">
                    {(currentUser.fullName || "Meistars")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-[#2A2624] flex items-center gap-1.5">
                      <span className="truncate max-w-[120px]">{currentUser.fullName || "Lietotājs"}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#606C5A] shrink-0" title="Tiešsaistē" />
                    </div>
                    <div className="text-[10px] text-[#7A736E]">
                      {currentUser.role === "ADMIN"
                        ? "Administrators"
                        : currentUser.role === "MEISTARS"
                        ? "Meistars"
                        : "Kasieris"}{" "}
                      • {(currentUser.storeBranch || "Tērbatas").replace("T/C ", "").replace(" iela", "")}
                    </div>
                  </div>
                </button>

                {/* Vertikālā atdalītājlīnija */}
                <div className="w-[1px] h-6 bg-[#E5DFD5]" />

                {/* 2. Zona: Noklikšķināt uz bultiņas, lai atvērtu mazo pārslēgšanas sarakstu */}
                <button
                  type="button"
                  data-testid="switch-dropdown-button"
                  onClick={() => setIsSwitchDropdownOpen(!isSwitchDropdownOpen)}
                  className={`px-2 py-2 hover:bg-[#FAF8F5] text-[#7A736E] hover:text-[#B85D3E] rounded-r-xl transition-all cursor-pointer ${
                    isSwitchDropdownOpen ? "bg-[#FAF8F5] text-[#B85D3E]" : ""
                  }`}
                  title="Pārslēgt operatoru / meistaru"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isSwitchDropdownOpen ? "rotate-180 text-[#B85D3E]" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Mazais izkrītošais saraksts ar citiem kolēģiem (SAGLABĀTI TIKAI LOKĀLI ŠAJĀ IERĪCĒ) */}
              {isSwitchDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#E5DFD5] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                  <div className="px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-[#7A736E] border-b border-[#ECE6DC] flex items-center justify-between">
                    <span>Pārslēgt operatoru</span>
                    <span className="text-[9.5px] font-normal lowercase bg-[#FAF8F5] text-[#7A736E] px-1.5 py-0.5 rounded border border-[#E5DFD5]">
                      šī planšete
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
                    {otherLocalStaff.map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        data-testid={`switch-to-${(staff.fullName || "user").split(" ")[0].toLowerCase()}`}
                        onClick={() => {
                          setIsSwitchDropdownOpen(false);
                          setTargetUserForSwitch(staff);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF8F5] text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] group-hover:bg-[#F7EBE7] text-[#2A2624] group-hover:text-[#B85D3E] flex items-center justify-center font-bold text-xs border border-[#E5DFD5] transition-colors">
                            {(staff.fullName || "M")
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#2A2624] group-hover:text-[#B85D3E] transition-colors">
                              {staff.fullName}
                            </div>
                            <div className="text-[10px] text-[#7A736E]">
                              {staff.role === "ADMIN"
                                ? "Administrators"
                                : staff.role === "MEISTARS"
                                ? "Meistars"
                                : "Kasieris"}{" "}
                              • {(staff.storeBranch || "Tērbatas").replace("T/C ", "").replace(" iela", "")}
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-[#7A736E] bg-[#FAF8F5] group-hover:bg-white px-2 py-0.5 rounded border border-[#E5DFD5] group-hover:border-[#B85D3E]/40 transition-colors">
                          {staff.hasQuickPin ? "PIN" : "Parole"}
                        </div>
                      </button>
                    ))}

                    {otherLocalStaff.length === 0 && (
                      <div className="py-3 px-2 text-center text-xs text-[#7A736E]">
                        <p className="font-medium text-[#2A2624]">Nav citu saglabātu profilu</p>
                        <p className="text-[10px] text-[#A39D98] mt-0.5">
                          Šajā ierīcē vēl nav pievienoti citi šī veikala operatori.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Poga: Pievienot profilu šai ierīcei */}
                  <div className="pt-1 mt-1 border-t border-[#ECE6DC]">
                    <button
                      type="button"
                      data-testid="add-profile-to-device-btn"
                      onClick={() => {
                        setIsSwitchDropdownOpen(false);
                        router.push("/login");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#FDF2EE] text-[#7A736E] hover:text-[#B85D3E] text-xs font-semibold border border-[#E5DFD5] hover:border-[#B85D3E]/30 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Pievienot profilu šai ierīcei</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E5DFD5] text-[#2A2624] rounded-xl text-xs font-semibold shadow-2xs transition-all"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#B85D3E]" />
              <span>Ienākt</span>
            </Link>
          )}

          {/* Galvenā poga: Jauns pasūtījums */}
          <button
            onClick={onNewOrder}
            className="flex items-center gap-2 bg-[#B85D3E] hover:bg-[#A24E32] active:scale-[0.98] text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Jauns pasūtījums</span>
            <span className="sm:hidden">Jauns</span>
          </button>
        </div>

      </div>

      {/* Lietotāja personīgais profils */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Ātrā pārslēgšanās modālis ar paroli/PIN */}
      <QuickSwitchModal
        isOpen={!!targetUserForSwitch}
        onClose={() => setTargetUserForSwitch(null)}
        targetUser={targetUserForSwitch}
        onSuccess={(switchedUser) => {
          switchUser(switchedUser);
          setTargetUserForSwitch(null);
        }}
      />
    </header>
  );
}
