"use client";

import {
  Building2,
  House,
  Megaphone,
  Store,
  Users,
} from "lucide-react";

import { GisStatistics } from "@/types/gis";

interface StatisticsCardsProps {
  statistics: GisStatistics;
}

export default function StatisticsCards({
  statistics,
}: StatisticsCardsProps) {
  const cards = [
    {
      title: "Total Penduduk",
      value: statistics.totalPenduduk,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Keluarga",
      value: statistics.totalKeluarga,
      icon: House,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "UMKM",
      value: statistics.totalUmkm,
      icon: Store,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Fasilitas",
      value: statistics.totalFasilitas,
      icon: Building2,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Pengaduan",
      value: statistics.totalPengaduan,
      icon: Megaphone,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {card.value.toLocaleString("id-ID")}
                </h2>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">
                Data GIS SIDESA
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}