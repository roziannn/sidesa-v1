'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Calendar, ChevronLeft, ChevronRight, Eye, Plus, } from 'lucide-react';

import DataTable, {
  Column,
} from '@/components/DataTable';

type Kegiatan = {
  id: string;
  judul: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  kuota: number;
  status:
    | 'aktif'
    | 'selesai'
    | 'Dibatalkan';

  peserta_kegiatan?: {
    count: number;
  }[];
};

interface Props {
  initialData: Kegiatan[];
}

export default function KegiatanClient({
  initialData,
}: Props) {
  const router = useRouter();



  const now = new Date();

  const [bulan, setBulan] =
    useState(
      now.getMonth() + 1
    );

  const [tahun, setTahun] =
    useState(
      now.getFullYear()
    );

  const filteredData =
    useMemo(() => {
      return initialData.filter(
        (item) => {
          const date =
            new Date(
              item.tanggal
            );

          return (
            date.getMonth() +
              1 ===
              bulan &&
            date.getFullYear() ===
              tahun
          );
        }
      );
    }, [
      initialData,
      bulan,
      tahun,
    ]);

  const eventsByDay =
    useMemo(() => {
      const map: Record<
        number,
        Kegiatan[]
      > = {};

      filteredData.forEach(
        (item) => {
          const day =
            new Date(
              item.tanggal
            ).getDate();

          if (!map[day]) {
            map[day] = [];
          }

          map[day].push(item);
        }
      );

      return map;
    }, [filteredData]);
    

  const columns: Column<Kegiatan>[] =
    [
      {
        label:
          'Judul Kegiatan',
        key: 'judul',
        render: (val) => (
            <div className="max-w-[220px] whitespace-normal break-words">
            {String(val)}
            </div>
        ),
      },
      {
        label: 'Tanggal',
        key: 'tanggal',

        render: (val) => (
          <span>
            {new Date(
              String(val)
            ).toLocaleDateString(
              'id-ID',
              {
                day: '2-digit',
                month:
                  'long',
                year:
                  'numeric',
              }
            )}
          </span>
        ),
      },
{
  label: 'Waktu',
  key: 'waktu',

  render: (_, row) => (
    <span>
      {row.waktu_mulai.slice(0, 5)} -{' '}
      {row.waktu_selesai.slice(0, 5)}
    </span>
  ),
},
      {
        label: 'Peserta',
        key: 'peserta',

        render: (
          _,
          row
        ) => {
          const total =
            row
              .peserta_kegiatan?.[0]
              ?.count ??
            0;

          return (
            <span
              className={
                total >=
                row.kuota
                  ? 'font-semibold text-red-600'
                  : 'font-semibold text-emerald-600'
              }
            >
              {total}/
              {row.kuota}
            </span>
          );
        },
      },
      {
  label: 'Aksi',
  key: 'id',

  render: (_, row) => (
    <button
      onClick={() =>
        router.push(
          `/dashboard/kegiatan/${row.id}`
        )
      }
    >
      <Eye className="h-4 w-4" />
    </button>
  ),
}
    ];

  const daysInMonth =
    new Date(
      tahun,
      bulan,
      0
    ).getDate();

  const firstDay =
    new Date(
      tahun,
      bulan - 1,
      1
    ).getDay();

    const changeMonth = (
    direction: 'prev' | 'next'
    ) => {
    if (direction === 'prev') {
        if (bulan === 1) {
        setBulan(12);
        setTahun((t) => t - 1);
        return;
        }

        setBulan((b) => b - 1);
        return;
    }

    if (bulan === 12) {
        setBulan(1);
        setTahun((t) => t + 1);
        return;
    }

    setBulan((b) => b + 1);
    };

  const calendarDays =
    useMemo(() => {
      const days = [];

      for (
        let i = 0;
        i < firstDay;
        i++
      ) {
        days.push(null);
      }

      for (
        let i = 1;
        i <= daysInMonth;
        i++
      ) {
        days.push(i);
      }

      return days;
    }, [
      firstDay,
      daysInMonth,
    ]);

  const totalWeeks =
    Math.ceil(
      calendarDays.length /
        7
    );

  const namaBulan =
    new Date(
      tahun,
      bulan - 1
    ).toLocaleString(
      'id-ID',
      {
        month: 'long',
      }
    );
    

  return (
    <div
      className={`space-y-6 `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm">
            <Calendar className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Manajemen Kegiatan
            </h1>

            <p className="text-sm text-slate-500">
              Kelola agenda
              kegiatan dan
              aktivitas desa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              router.push(
                '/dashboard/kegiatan/tambah'
              )
            }
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Buat Kegiatan
          </button>
        </div>
      </div>

        <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
            <div className="rounded-xl bg-white shadow-sm">
            <div className="p-4">
                <h2 className="font-semibold text-slate-900">
                Kegiatan Bulan {namaBulan}
                </h2>
                <p className="text-sm text-slate-500">
                {filteredData.length} kegiatan
                </p>
            </div>

            {filteredData.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                Belum ada kegiatan pada bulan ini.
                </div>
            ) : (
                <DataTable
                columns={columns}
                data={filteredData}
                />
            )}
            </div>
        </div>

  {/* KALENDER */}
    <div className="xl:col-span-3">
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-4 min-h-0 overflow-hidden">
    {/* NAVIGASI BULAN */}
    <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-shrink-0">
      <button
        onClick={() => changeMonth('prev')}
        className="
  flex h-10 w-10 items-center justify-center
  rounded-xl border border-slate-200
  bg-white shadow-sm
  transition-all

  hover:border-emerald-300
  hover:bg-emerald-50
  hover:text-emerald-600
"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

     <h2 className="text-xl font-bold text-slate-900 capitalize">
         {namaBulan} {tahun}
     </h2>

      <button
        onClick={() => changeMonth('next')}
       className="
  flex h-10 w-10 items-center justify-center
  rounded-xl border border-slate-200
  bg-white shadow-sm
  transition-all

  hover:border-emerald-300
  hover:bg-emerald-50
  hover:text-emerald-600
"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>

    {/* NAMA HARI */}
    <div className="grid grid-cols-7 gap-2 mt-4 mb-2 flex-shrink-0">
      {[
        'Min',
        'Sen',
        'Sel',
        'Rab',
        'Kam',
        'Jum',
        'Sab',
      ].map((day, index) => (
        <div
          key={day}
          className={`text-center text-xs font-bold uppercase tracking-wider ${
            index === 0
              ? 'text-red-500'
              : 'text-slate-500'
          }`}
        >
          {day}
        </div>
      ))}
    </div>

    {/* GRID TANGGAL */}
    <div
      className="grid grid-cols-7 gap-2 flex-1 min-h-0"
      style={{
        gridTemplateRows: `repeat(${totalWeeks}, minmax(0,1fr))`,
      }}
    >
      {calendarDays.map((day, index) => {
        const today = new Date();

        const isToday =
          day === today.getDate() &&
          bulan ===
            today.getMonth() + 1 &&
          tahun ===
            today.getFullYear();

        const dayEvents = day
          ? eventsByDay[day] || []
          : [];

        return (
          <div
            key={index}
           className={`
            rounded-2xl border p-2.5
            transition-all duration-200

            ${
                !day
                ? 'border-dashed border-slate-200 bg-slate-50/50'
                : 'border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-300'
            }
            `}
          >
            {day && (
              <>
                <div className="flex items-center justify-between flex-shrink-0">
                  <div
                    className={`
                      flex h-6 w-6 items-center justify-center
                      rounded-full text-xs font-bold

                      ${
                        isToday
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-700'
                      }
                    `}
                  >
                    {day}
                  </div>

                  {dayEvents.length > 0 && (
                    <span className="rounded-full border bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* EVENT */}
                <div className="mt-2 flex-1 space-y-1 overflow-y-auto min-h-0">
                  {dayEvents.map(
                    (event) => (
                      <button
                        key={event.id}
                        onClick={() =>
                          router.push(
                            `/dashboard/kegiatan/${event.id}`
                          )
                        }
                        title={`${event.judul} (${event.waktu_mulai.slice(
                          0,
                          5
                        )})`}
                        className={`
                          block w-full truncate rounded-md border px-1.5 py-1 text-left text-[10px] font-semibold transition

                          ${
                            event.status ===
                            'aktif'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-slate-200 bg-slate-50 text-slate-500 line-through'
                          }
                        `}
                      >
                        {event.waktu_mulai.slice(
                          0,
                          5
                        )}{' '}
                        {event.judul}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  </div>
    </div>
  </div>
</div>
     
  );
}