// 1. Profil Pengguna / Warga (Tabel tertaut dengan Supabase Auth)
export interface Profile {
  id: string; // ID dari auth.users Supabase
  nik: string;
  nama_lengkap: string;
  role: "admin" | "warga" | "staf_desa";
  telepon?: string;
  created_at: string;
}

// 2. Data Kartu Keluarga (KK)
export interface Keluarga {
  id: string;
  nomor_kk: string;
  kepala_keluarga_id: string; // Relasi ke Profile id kepala keluarga
  alamat: string;
  rt: string;
  rw: string;
  created_at: string;
}

// 3. Anggota Keluarga di dalam KK
export interface AnggotaKeluarga {
  id: string;
  keluarga_id: string; // Relasi ke tabel Keluarga
  profile_id: string;  // Relasi ke tabel Profile warga tersebut
  hubungan: "Kepala Keluarga" | "Istri" | "Anak" | "Orang Tua" | "Famili Lain";
  jenis_kelamin: "Laki-laki" | "Perempuan";
  tanggal_lahir: string;
}

// 4. Modul Bantuan Sosial (Bansos)
export interface Bansos {
  id: string;
  nama_bantuan: string; // Contoh: PKH, BLT, Bansos Sembako
  deskripsi: string;
  kuota: number;
  status: "Aktif" | "Selesai";
  tanggal_penyaluran: string;
}

// 5. Informasi Kegiatan Desa
export interface Kegiatan {
  id: string;
  judul: string; // Contoh: Kerja Bakti RW 03, Imunisasi Posyandu
  deskripsi: string;
  tanggal_pelaksanaan: string;
  lokasi: string;
  dibuat_oleh: string; // Relasi ke Profile id admin/staf
}

// 6. Pengajuan Surat Digital / Administrasi
export interface Surat {
  id: string;
  warga_id: string; // Relasi ke Profile pemohon
  jenis_surat: "Surat Domisili" | "Surat Kematian" | "Surat Tidak Mampu" | "Surat Pengantar";
  keperluan: string;
  status: "Diproses" | "Disetujui" | "Ditolak";
  file_url?: string; // URL file PDF surat jika sudah disetujui dan diunggah ke Supabase Storage
  catatan_admin?: string;
  created_at: string;
}

// 7. Retribusi / Pembayaran Iuran (Terintegrasi Midtrans)
export interface Retribusi {
  id: string; // Digunakan sebagai order_id di Midtrans
  warga_id: string; // Relasi ke Profile pembayar
  nama_iuran: string; // Contoh: Iuran Kebersihan Bulan Mei, Dana Sosial
  jumlah_bayar: number;
  status_pembayaran: "Belum Dibayar" | "Lunas" | "Kedaluwarsa" | "Gagal";
  token_midtrans?: string; // Menyimpan token Snap dari Midtrans backend untuk memunculkan popup pembayaran
  tanggal_bayar?: string;
  created_at: string;
}