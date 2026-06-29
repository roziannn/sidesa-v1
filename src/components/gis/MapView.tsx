"use client";

import { memo, useEffect, useState } from "react";
import { CircleDashed, Layers3, List, Pin } from "lucide-react";
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  ScaleControl,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  getCategoryColor,
} from "@/lib/gis/gis";
import {
  calculateBounds,
  createMarkerIcon,
} from "@/lib/gis/gis-client";

import {
  LayerVisibility,
  MapMarker,
  MapPolygon,
} from "@/types/gis";
import MarkerPopup from "@/components/gis/MarkerPopup";
import SelectedDetailCard from "@/components/gis/SelectedDetailCard";
import LayerControl from "@/components/gis/LayerControl";
import Legend from "@/components/gis/Legend";

interface MapViewProps {
  markers: MapMarker[];
  polygons?: MapPolygon[];

  layers: LayerVisibility;
  onLayersChange: (layers: LayerVisibility) => void;
  categoryCounts?: Record<string, number>;

  loading?: boolean;

  selectedMarker?: string;
  selectedMarkerData?: MapMarker;
  selectedPolygonData?: MapPolygon;

  onMarkerClick?: (marker: MapMarker) => void;
  onMarkerHover?: (marker?: MapMarker) => void;

  onPolygonClick?: (polygon: MapPolygon) => void;
  onPolygonHover?: (polygon?: MapPolygon) => void;

  className?: string;
}

/* ==========================================
   Fit Bounds
========================================== */

function FitBounds({
  markers,
}: {
  markers: MapMarker[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) return;

    const bounds = calculateBounds(markers);

    if (bounds) {
      map.fitBounds(bounds, {
        padding: [60, 60],
      });
    }
  }, [markers, map]);

  return null;
}

/* ==========================================
   Marker Icon
========================================== */

function getMarkerIcon(category: string) {
  return createMarkerIcon(
    getCategoryColor(category),
    category.slice(0, 2)
  );
}

/* ==========================================
   Component
========================================== */

function MapView({
  markers,
  polygons = [],
  layers,
  onLayersChange,
  categoryCounts = {},
  loading = false,
  selectedMarker,
  selectedMarkerData,
  selectedPolygonData,
  onMarkerClick,
  onMarkerHover,
  onPolygonClick,
  onPolygonHover,
  className,
}: MapViewProps) {
  const [showSelectedDetail, setShowSelectedDetail] =
    useState(false);
  const [showLayerControl, setShowLayerControl] =
    useState(false);
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div
      className={[
        "relative h-[700px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MapContainer
        center={[
          DEFAULT_CENTER.lat,
          DEFAULT_CENTER.lng,
        ]}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="h-full w-full z-0"
      >
        <ZoomControl position="bottomright" />

        <ScaleControl position="bottomleft" />

        <TileLayer
          attribution="&copy; OpenStreetMap Contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds markers={markers} />

        {/* ===========================
            Marker
        ============================ */}

        {markers
          .filter((marker) => layers[marker.category])
          .map((marker) => (
            <Marker
              key={marker.id}
              position={[
                marker.coordinate.lat,
                marker.coordinate.lng,
              ]}
              icon={getMarkerIcon(marker.category)}
              eventHandlers={{
                click() {
                  onMarkerClick?.(marker);
                },
                mouseover() {
                  onMarkerHover?.(marker);
                },
                mouseout() {
                  onMarkerHover?.(undefined);
                },
              }}
            >
              <Tooltip direction="top">
                {marker.name}
              </Tooltip>

              <Popup maxWidth={340}>
                <MarkerPopup marker={marker} />
              </Popup>
            </Marker>
          ))}

        {/* ===========================
            Polygon Layer
        ============================ */}

        {layers.polygon &&
          polygons.map((polygon) => (
            <Polygon
              key={polygon.id}
              positions={polygon.coordinates}
              pathOptions={{
                color: polygon.color,
                fillColor: polygon.fillColor,
                fillOpacity: polygon.fillOpacity ?? 0.35,
                weight: 2,
              }}
              eventHandlers={{
                click() {
                  onPolygonClick?.(polygon);
                },
                mouseover() {
                  onPolygonHover?.(polygon);
                },
                mouseout() {
                  onPolygonHover?.(undefined);
                },
              }}
            >
              <Popup>
                <div className="space-y-2 min-w-[220px]">
                  <h3 className="font-semibold">
                    {polygon.name}
                  </h3>

                  {polygon.properties &&
                    Object.entries(polygon.properties).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="capitalize text-slate-500">
                            {key}
                          </span>

                          <span>{String(value)}</span>
                        </div>
                      )
                    )}
                </div>
              </Popup>
            </Polygon>
          ))}
      </MapContainer>

      {/* ===========================
          Loading Overlay
      ============================ */}

      {loading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />

            <p className="text-sm font-medium text-slate-600">
              Memuat peta...
            </p>
          </div>
        </div>
      )}

      {/* ===========================
          Empty State
      ============================ */}

      {!loading && markers.length === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-6 z-[999] -translate-x-1/2 rounded-xl bg-white/95 px-5 py-3 shadow-lg">
          <p className="text-sm text-slate-500">
            Belum ada data lokasi.
          </p>
        </div>
      )}

      <div className="absolute left-4 top-4 z-[999]">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() =>
              setShowLayerControl((previous) => !previous)
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur hover:bg-white"
          >
            <Layers3 className="h-4 w-4 text-emerald-600" />
            Layer
          </button>
        </div>

        {showLayerControl && (
          <div className="mt-3 w-64 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Kontrol Layer
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Pilih kategori yang ingin tampil di peta.
              </p>
            </div>

            <LayerControl
              layers={layers}
              onChange={onLayersChange}
              compact
            />
          </div>
        )}
      </div>

      {/* ===========================
          Selected Marker Badge
      ============================ */}

      {selectedMarker && (
        <div
          className="absolute right-4 top-4 z-[999]"
          onMouseEnter={() => setShowSelectedDetail(true)}
          onMouseLeave={() => setShowSelectedDetail(false)}
        >
          <div className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
            Marker dipilih : {selectedMarker}
          </div>

          {showSelectedDetail &&
            (selectedMarkerData || selectedPolygonData) && (
              <div className="mt-3 w-[360px] max-w-[calc(100vw-3rem)]">
                <SelectedDetailCard
                  marker={selectedMarkerData}
                  polygon={selectedPolygonData}
                />
              </div>
            )}
        </div>
      )}

      <div className="absolute bottom-14 left-4 z-[999] max-w-[calc(100%-2rem)]">
        <button
          type="button"
          onClick={() =>
            setShowLegend((previous) => !previous)
          }
          className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur hover:bg-white"
        >
          <CircleDashed className="h-4 w-4 text-emerald-600" />
          Legenda
        </button>

        {showLegend && (
          <div className="mt-3 w-56">
            <Legend compact categoryCounts={categoryCounts} />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MapView);
