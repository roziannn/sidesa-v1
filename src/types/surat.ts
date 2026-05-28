export interface DataWarga {
  nama: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "laki-laki" | "perempuan";
  agama: string;
  pekerjaan: string;
  alamat: string;
  rt: string;
  rw: string;
}

export interface DataDesa {
  nama_desa: string;
  nama_kecamatan: string;
  nama_kabupaten: string;
  alamat_kantor: string;
  no_telp: string;
  kode_pos: string;
  kode_desa: string;
  nama_kepala_desa: string;
  nip_kepala_desa?: string;
}

export interface SuratDomisiliPayload {
  nomor_urut: string; // Contoh: "025"
  keperluan: string;
  tanggal_generate: string; // Contoh: "28 Mei 2026"
  warga: DataWarga;
  desa: DataDesa;
}
