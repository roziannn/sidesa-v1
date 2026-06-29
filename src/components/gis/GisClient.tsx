"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import {
  Building2,
  Layers3,
  MapPinned,
  Sparkles,
} from "lucide-react";

import LoadingMap from "@/components/gis/LoadingMap";
import LayerControl from "@/components/gis/LayerControl";
import Legend from "@/components/gis/Legend";
import MapSidebar from "@/components/gis/MapSidebar";
import MapToolbar from "@/components/gis/MapToolbar";
import StatisticCards from "@/components/gis/StatisticCards";
import { filterMarkers } from "@/lib/gis/gis";
import {
  GisStatistics,
  LayerVisibility,
  MapFilter,
  MapMarker,
  MapPolygon,
} from "@/types/gis";

const MapView = dynamic(
  () => import("@/components/gis/MapView"),
  {
    ssr: false,
    loading: () => <LoadingMap />,
  }
);

const DEFAULT_FILTER: MapFilter = {
  keyword: "",
  dusun: "all",
  rw: "all",
  rt: "all",
  category: "all",
};

const DEFAULT_LAYERS: LayerVisibility = {
  resident: true,
  office: true,
  school: true,
  mosque: true,
  hospital: true,
  posyandu: true,
  umkm: true,
  tourism: true,
  complaint: true,
  other: true,
  polygon: true,
};

const kuninganStatistics: GisStatistics = {
  totalPenduduk: 387420,
  totalKeluarga: 120845,
  totalUmkm: 2816,
  totalFasilitas: 146,
  totalPengaduan: 23,
};

const kuninganMarkers: MapMarker[] = [
  {
    id: "office-1",
    name: "Pendopo Kabupaten Kuningan",
    category: "office",
    coordinate: { lat: -6.9826, lng: 108.4856 },
    address: "Jl. Siliwangi, Kuningan",
    description: "Pusat layanan pemerintahan dan koordinasi wilayah.",
    properties: {
      status: "Aktif",
      layanan: "Administrasi kabupaten",
      wilayah: "Kuningan",
      rw: "01",
      rt: "01",
    },
  },
  {
    id: "hospital-1",
    name: "RSUD 45 Kuningan",
    category: "hospital",
    coordinate: { lat: -6.9804, lng: 108.4898 },
    address: "Jl. RE. Martadinata, Kuningan",
    description: "Rumah sakit rujukan utama untuk layanan kesehatan umum.",
    properties: {
      layanan: "IGD 24 jam",
      tipe: "RSUD",
      wilayah: "Kuningan",
      rw: "02",
      rt: "04",
    },
  },
  {
    id: "school-1",
    name: "SMAN 2 Kuningan",
    category: "school",
    coordinate: { lat: -6.9778, lng: 108.4759 },
    address: "Kec. Kuningan, Jawa Barat",
    description: "Salah satu sekolah menengah atas favorit di pusat kota.",
    properties: {
      jenjang: "SMA",
      siswa: 1120,
      wilayah: "Kuningan",
      rw: "03",
      rt: "02",
    },
  },
  {
    id: "mosque-1",
    name: "Masjid Syiarul Islam",
    category: "mosque",
    coordinate: { lat: -6.9817, lng: 108.4834 },
    address: "Jl. Siliwangi, Kuningan",
    description: "Masjid besar yang menjadi pusat kegiatan keagamaan kota.",
    properties: {
      kapasitas: "2500 jamaah",
      kegiatan: "Kajian rutin",
      wilayah: "Kuningan",
      rw: "01",
      rt: "03",
    },
  },
  {
    id: "tourism-1",
    name: "Taman Nasional Gunung Ciremai",
    category: "tourism",
    coordinate: { lat: -6.8888, lng: 108.4098 },
    address: "Kawasan Palutungan, Kuningan",
    description: "Destinasi wisata alam dan jalur pendakian utama.",
    properties: {
      jenis: "Wisata alam",
      status: "Buka",
      wilayah: "Cilimus",
      rw: "05",
      rt: "01",
    },
  },
  {
    id: "tourism-2",
    name: "Telaga Biru Cicerem",
    category: "tourism",
    coordinate: { lat: -6.9506, lng: 108.4145 },
    address: "Desa Kaduela, Kuningan",
    description: "Objek wisata air jernih dengan aktivitas swafoto dan keluarga.",
    properties: {
      jenis: "Wisata air",
      status: "Ramai akhir pekan",
      wilayah: "Cigugur",
      rw: "02",
      rt: "05",
    },
  },
  {
    id: "umkm-1",
    name: "Sentra Tape Ketan Kuningan",
    category: "umkm",
    coordinate: { lat: -6.9859, lng: 108.4778 },
    address: "Koridor pusat oleh-oleh Kuningan",
    description: "Klaster UMKM olahan tape ketan dan produk khas daerah.",
    properties: {
      pelaku: 48,
      unggulan: "Tape ketan",
      wilayah: "Kuningan",
      rw: "04",
      rt: "02",
    },
  },
  {
    id: "umkm-2",
    name: "Pasar Kreatif Cigugur",
    category: "umkm",
    coordinate: { lat: -6.9968, lng: 108.4702 },
    address: "Kec. Cigugur, Kuningan",
    description: "Ruang promosi produk lokal, kriya, dan kuliner.",
    properties: {
      tenant: 32,
      jadwal: "Sabtu-Minggu",
      wilayah: "Cigugur",
      rw: "03",
      rt: "04",
    },
  },
  {
    id: "posyandu-1",
    name: "Posyandu Melati",
    category: "posyandu",
    coordinate: { lat: -6.9893, lng: 108.4922 },
    address: "Kel. Cigugur, Kuningan",
    description: "Posyandu aktif untuk balita dan ibu hamil.",
    properties: {
      kader: 12,
      cakupan: "Balita dan ibu hamil",
      wilayah: "Kuningan",
      rw: "05",
      rt: "06",
    },
  },
  {
    id: "resident-1",
    name: "Permukiman Padat Winduherang",
    category: "resident",
    coordinate: { lat: -6.9742, lng: 108.5004 },
    address: "Winduherang, Kuningan",
    description: "Kawasan permukiman dengan kebutuhan infrastruktur lingkungan.",
    properties: {
      kk: 384,
      prioritas: "Drainase",
      wilayah: "Kuningan",
      rw: "06",
      rt: "03",
    },
  },
  {
    id: "complaint-1",
    name: "Titik Aduan Jalan Lingkar Timur",
    category: "complaint",
    coordinate: { lat: -6.9917, lng: 108.5015 },
    address: "Koridor Lingkar Timur Kuningan",
    description: "Aduan warga terkait lampu jalan dan permukaan jalan rusak.",
    properties: {
      status: "Diproses",
      laporan: 7,
      wilayah: "Kuningan",
      rw: "07",
      rt: "01",
    },
  },
  {
    id: "other-1",
    name: "Terminal Tipe C Kertawangunan",
    category: "other",
    coordinate: { lat: -6.9684, lng: 108.4832 },
    address: "Kertawangunan, Kuningan",
    description: "Node transportasi lokal untuk pergerakan warga dan distribusi.",
    properties: {
      fungsi: "Transportasi",
      aktivitas: "Sedang",
      wilayah: "Kuningan",
      rw: "04",
      rt: "01",
    },
  },
];

const kuninganPolygons: MapPolygon[] = [
  {
    id: "kec-kuningan",
    name: "Zona Pusat Kabupaten",
    coordinates: [
      [-6.968, 108.462],
      [-6.964, 108.492],
      [-6.981, 108.508],
      [-7.004, 108.503],
      [-7.011, 108.472],
      [-6.99, 108.455],
    ],
    color: "#0f766e",
    fillColor: "#5eead4",
    properties: {
      kecamatan: "Kuningan",
      fokus: "Pemerintahan dan layanan",
    },
  },
  {
    id: "kec-cigugur",
    name: "Zona Wisata Cigugur",
    coordinates: [
      [-6.941, 108.397],
      [-6.927, 108.43],
      [-6.95, 108.457],
      [-6.98, 108.445],
      [-6.979, 108.404],
      [-6.959, 108.387],
    ],
    color: "#b45309",
    fillColor: "#fdba74",
    properties: {
      kecamatan: "Cigugur",
      fokus: "Wisata dan UMKM",
    },
  },
  {
    id: "kec-cilimus",
    name: "Zona Penyangga Ciremai",
    coordinates: [
      [-6.915, 108.384],
      [-6.898, 108.424],
      [-6.922, 108.451],
      [-6.948, 108.434],
      [-6.951, 108.393],
      [-6.931, 108.374],
    ],
    color: "#2563eb",
    fillColor: "#93c5fd",
    properties: {
      kecamatan: "Cilimus",
      fokus: "Ekowisata dan konservasi",
    },
  },
];

export default function GisClient() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<MapFilter>(DEFAULT_FILTER);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const [selectedPolygonId, setSelectedPolygonId] = useState<string>();
  const [userLocationMarker, setUserLocationMarker] = useState<MapMarker>();

  const mapMarkers = useMemo(() => {
    return userLocationMarker
      ? [userLocationMarker, ...kuninganMarkers]
      : kuninganMarkers;
  }, [userLocationMarker]);

  const filteredMarkers = useMemo(
    () => filterMarkers(mapMarkers, filter, layers),
    [filter, layers, mapMarkers]
  );

  const selectedMarker = useMemo(
    () => mapMarkers.find((marker) => marker.id === selectedMarkerId),
    [mapMarkers, selectedMarkerId]
  );

  const selectedPolygon = useMemo(
    () =>
      kuninganPolygons.find((polygon) => polygon.id === selectedPolygonId),
    [selectedPolygonId]
  );

  const categoryCounts = useMemo(() => {
    return mapMarkers.reduce<Record<string, number>>(
      (accumulator, marker) => {
        accumulator[marker.category] =
          (accumulator[marker.category] ?? 0) + 1;

        return accumulator;
      },
      {}
    );
  }, [mapMarkers]);

  const handleReset = () => {
    setFilter(DEFAULT_FILTER);
    setLayers(DEFAULT_LAYERS);
    setSelectedMarkerId(undefined);
    setSelectedPolygonId(undefined);
    setUserLocationMarker(undefined);
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextMarker: MapMarker = {
          id: "my-location",
          name: "Lokasi Saya",
          category: "other",
          coordinate: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          description: "Posisi perangkat yang dibaca dari browser.",
          properties: {
            wilayah: "Kuningan",
            rw: "00",
            rt: "00",
            akurasi: `${Math.round(position.coords.accuracy)} m`,
          },
        };

        setUserLocationMarker(nextMarker);
        setSelectedMarkerId(nextMarker.id);
      },
      () => undefined
    );
  };

  const handleFullscreen = async () => {
    const element = wrapperRef.current;

    if (!element) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await element.requestFullscreen();
  };

  return (
    <div className="space-y-6" ref={wrapperRef}>
      <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#f0f9ff_55%,#ffffff_100%)] shadow-sm">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Demo GIS Kabupaten Kuningan
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                Peta potensi wilayah, layanan publik, dan titik pengaduan dalam
                satu dashboard GIS.
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-slate-600 lg:text-base">
                Saya pakai contoh data Kabupaten Kuningan supaya page GIS kamu
                langsung terasa hidup dan bisa jadi acuan untuk sambung ke data
                Supabase berikutnya.
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[24px] border border-white/80 bg-white/80 p-4 backdrop-blur">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <MapPinned className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {filteredMarkers.length} titik aktif di peta
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Termasuk fasilitas, UMKM, wisata, dan pengaduan warga.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Layers3 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {Object.values(layers).filter(Boolean).length} layer aktif
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Layer bisa dinyalakan atau dimatikan dari panel kontrol.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  3 zona wilayah contoh
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Dipakai untuk menampilkan batas area prioritas dan tematik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StatisticCards statistics={kuninganStatistics} />

      <MapToolbar
        keyword={filter.keyword}
        onKeywordChange={(keyword) =>
          setFilter((previous) => ({ ...previous, keyword }))
        }
        onReset={handleReset}
        onMyLocation={handleMyLocation}
        onFullscreen={handleFullscreen}
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <MapSidebar
            filter={filter}
            markers={filteredMarkers}
            selectedMarkerId={selectedMarkerId}
            selectedMarker={selectedMarker}
            selectedPolygon={selectedPolygon}
            onFilterChange={setFilter}
            onMarkerSelect={(marker) => {
              setSelectedPolygonId(undefined);
              setSelectedMarkerId(marker.id);
            }}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Kontrol Layer
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tampilkan hanya kategori yang sedang dibutuhkan.
              </p>
            </div>

            <LayerControl layers={layers} onChange={setLayers} />
          </section>

          <Legend categoryCounts={categoryCounts} />
        </div>

        <MapView
          markers={filteredMarkers}
          polygons={kuninganPolygons}
          layers={layers}
          selectedMarker={selectedMarker?.name}
          onMarkerClick={(marker) => {
            setSelectedPolygonId(undefined);
            setSelectedMarkerId(marker.id);
          }}
          onPolygonClick={(polygon) => {
            setSelectedMarkerId(undefined);
            setSelectedPolygonId(polygon.id);
          }}
        />
      </div>
    </div>
  );
}
