/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";

interface NotificationItem {
  id: number;
  judul: string;
  pesan: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const { data } = await supabaseClient.from("notifications").select("*").order("created_at", { ascending: false }).limit(10);

    if (data) setNotifs(data);
  };

  useEffect(() => {
    fetchNotifications();
    const channel = supabaseClient
      .channel("notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchNotifications())
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  const markAsRead = async () => {
    await supabaseClient.from("notifications").update({ is_read: true }).eq("is_read", false);
    // Update local state agar count langsung hilang
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BUTTON */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAsRead();
        }}
        className="relative p-2 rounded-md hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full border border-white" />}
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-md shadow-xl z-50 overflow-hidden">
          {/* HEADER */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Notifikasi</p>
            {unreadCount > 0 && <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 rounded-sm font-semibold">{unreadCount} Baru</span>}
          </div>

          {/* LIST */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length > 0 ? (
              notifs.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-slate-100 transition-colors ${!n.is_read ? "bg-slate-50/50" : "bg-white hover:bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-[13px] font-bold ${!n.is_read ? "text-slate-800" : "text-slate-600"}`}>{n.judul}</p>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{n.pesan}</p>
                  <p className="text-[9px] text-slate-400 mt-2 uppercase">{formatDate(n.created_at)}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-xs text-slate-400">Tidak ada notifikasi baru</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
