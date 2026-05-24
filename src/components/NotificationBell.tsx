"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BUTTON */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAsRead();
        }}
        className="relative p-2 rounded-lg hover:bg-emerald-50 transition"
      >
        <Bell className="w-5 h-5 text-emerald-800" />

        {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-emerald-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* HEADER */}
          <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
            <p className="text-xs font-bold tracking-wide text-emerald-900 uppercase">Notifikasi</p>
          </div>

          {/* LIST */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length > 0 ? (
              notifs.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-slate-100 hover:bg-emerald-50/50 cursor-pointer transition ${!n.is_read ? "bg-emerald-50/30" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{n.judul}</p>

                    {!n.is_read && <span className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />}
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.pesan}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-400">Tidak ada notifikasi</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
