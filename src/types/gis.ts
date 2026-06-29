import { LatLngExpression } from "leaflet";

/* ============================
   Coordinate
============================ */

export interface Coordinate {
  lat: number;
  lng: number;
}

/* ============================
   Statistics
============================ */

export interface GisStatistics {
  totalPenduduk: number;
  totalKeluarga: number;
  totalUmkm: number;
  totalFasilitas: number;
  totalPengaduan: number;
}

/* ============================
   Marker Category
============================ */

export type MarkerCategory =
  | "resident"
  | "office"
  | "school"
  | "mosque"
  | "hospital"
  | "posyandu"
  | "umkm"
  | "tourism"
  | "complaint"
  | "other";

/* ============================
   Marker
============================ */

export interface MapMarker {
  id: string;

  name: string;

  description?: string;

  category: MarkerCategory;

  coordinate: Coordinate;

  address?: string;

  image?: string;

  phone?: string;

  active?: boolean;

  properties?: Record<string, unknown>;
}

/* ============================
   Polygon
============================ */

export interface MapPolygon {
  id: string;

  name: string;

  coordinates: LatLngExpression[];

  color: string;

  fillColor: string;

  fillOpacity?: number;

  properties?: Record<string, unknown>;
}

/* ============================
   GeoJSON Layer
============================ */

export interface GeoJsonLayer {
  id: string;

  name: string;

  url: string;

  visible: boolean;

  color?: string;
}

/* ============================
   Sidebar Filter
============================ */

export interface MapFilter {
  keyword: string;

  dusun: string;

  rw: string;

  rt: string;

  category: MarkerCategory | "all";
}

/* ============================
   Layer Visibility
============================ */

export  type LayerVisibility = Record<MarkerCategory, boolean> & {
  resident: boolean;
  office: boolean;
  school: boolean;
  mosque: boolean;
  hospital: boolean;
  posyandu: boolean;
  umkm: boolean;
  tourism: boolean;
  complaint: boolean;
  other: boolean;
  polygon: boolean;
}

/* ============================
   Popup
============================ */

export interface PopupInformation {
  title: string;

  subtitle?: string;

  description?: string;

  image?: string;

  fields?: {
    label: string;
    value: string | number;
  }[];
}

/* ============================
   Search Result
============================ */

export interface SearchLocation {
  id: string;

  label: string;

  coordinate: Coordinate;
}

/* ============================
   Map State
============================ */

export interface MapState {
  center: Coordinate;

  zoom: number;

  selectedMarker?: MapMarker;

  selectedPolygon?: MapPolygon;
}