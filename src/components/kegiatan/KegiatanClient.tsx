'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Calendar, ChevronLeft, ChevronRight, Eye, Plus, } from 'lucide-react';

import DataTable, {
  Column,
} from '@/components/DataTable';
import { formatDate } from '@/lib/format';
import Button from '@components/ui/Button';
import Link from 'next/link';
import Card from '@components/ui/Card';
import Select from '@components/ui/Select';

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
        render: (val) =>
        formatDate(String(val)),
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
   <div className="space-y-6">
  {/* HEADER */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm">
        <Calendar className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Kegiatan</h1>
        <p className="text-sm text-slate-500">Kelola agenda kegiatan dan aktivitas desa.</p>
      </div>
    </div>
    <Link href="/dashboard/kegiatan/tambah">
      <Button leftIcon={<Plus className="h-4 w-4" />}>Buat Kegiatan</Button>
    </Link>
  </div>

  {/* GRID UTAMA */}
  <div className="grid gap-6 xl:grid-cols-5">
    
    {/* TABEL KEGIATAN */}
    <Card 
      title={`Kegiatan Bulan ${namaBulan}`}
      description={`Terdapat ${filteredData.length} kegiatan pada bulan ${namaBulan} ${tahun}`}
      padding="sm"
      className="xl:col-span-2"
    >
      {filteredData.length === 0 ? (
        <div className="py-16 text-center text-slate-500">Belum ada kegiatan pada bulan ini.</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          onView={(row) => router.push(`/dashboard/kegiatan/${row.id}`)}
        />
      )}
    </Card>

    {/* KALENDER */}
    <Card 
      className="xl:col-span-3"
      padding="sm"
    >
      {/* NAVIGASI KALENDER */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeMonth('prev')} className="h-9 w-9">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => changeMonth('next')} className="h-9 w-9">
            <ChevronRight className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold text-slate-800 capitalize min-w-[140px]">
            {namaBulan} {tahun}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Bulan */}
          <Select 
            value={bulan.toString()} 
            onChange={(e) => setBulan(parseInt(e.target.value))}
            className="w-32 py-1.5 text-xs"
          >
            {[
              "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
              "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ].map((nama, idx) => (
              <option key={idx + 1} value={idx + 1}>{nama}</option>
            ))}
          </Select>

          {/* Filter Tahun */}
          <Select 
            value={tahun.toString()} 
            onChange={(e) => setTahun(parseInt(e.target.value))}
            className="w-24 py-1.5 text-xs"
          >
            {[tahun - 1, tahun, tahun + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* GRID KALENDER */}
      <div className="grid grid-cols-7 gap-2">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, index) => (
          <div key={day} className={`text-center text-xs font-bold uppercase ${index === 0 ? 'text-red-500' : 'text-slate-500'}`}>
            {day}
          </div>
        ))}
      </div>

      <div 
        className="grid grid-cols-7 gap-2 mt-2"
        style={{ gridTemplateRows: `repeat(${totalWeeks}, minmax(100px, 1fr))` }}
      >
        {calendarDays.map((day, index) => {
          const isToday = day === new Date().getDate() && bulan === new Date().getMonth() + 1 && tahun === new Date().getFullYear();
          const dayEvents = day ? eventsByDay[day] || [] : [];
          
          return (
            <div key={index} className={`rounded-lg border p-2 ${!day ? 'bg-slate-50 border-dashed' : 'bg-white border-slate-200'}`}>
              {day && (
                <>
                  <div className={`text-xs font-bold mb-2 ${isToday ? 'text-emerald-600' : 'text-slate-700'}`}>{day}</div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <button 
                        key={event.id}
                        onClick={() => router.push(`/dashboard/kegiatan/${event.id}`)}
                        className={`block w-full truncate rounded px-1.5 py-0.5 text-[10px] font-semibold border ${event.status === 'aktif' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 line-through'}`}
                      >
                        {event.waktu_mulai.slice(0, 5)} {event.judul}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  </div>
</div>
     
  );
}