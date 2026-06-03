export interface SuratEmailData {
  namaPemohon: string;
  jenisSurat: string;
  status: 'diproses' | 'selesai' | 'ditolak';
  catatanPetugas?: string;
  downloadUrl?: string;
  namaDesaInfo: string;
}

export function createSuratStatusEmail(data: SuratEmailData) {
  const isSelesai = data.status === 'selesai';
  const isDitolak = data.status === 'ditolak';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #334155;">
      <!-- Header -->
      <div style="background-color: #14532d; color: white; padding: 25px; text-align: center;">
        <h2 style="margin: 0;">${data.namaDesaInfo}</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Sistem Pelayanan Administrasi Digital</p>
      </div>

      <!-- Content -->
      <div style="padding: 30px;">
        <p>Yth. Bapak/Ibu <strong>${data.namaPemohon}</strong>,</p>
        
        <p>Terima kasih telah menggunakan layanan administrasi ${data.namaDesaInfo}. Kami informasikan bahwa status permohonan <strong>${data.jenisSurat}</strong> Anda saat ini adalah: <strong>${data.status.toUpperCase()}</strong>.</p>
        
        ${isSelesai ? `
          <div style="margin: 25px 0;">
            <p>Surat Anda telah selesai dibuat dan siap digunakan.</p>
            <a href="${data.downloadUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Download Surat</a>
          </div>` : ''}
        
        ${isDitolak ? `
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626;"><strong>Catatan Petugas:</strong> ${data.catatanPetugas || 'Mohon maaf, permohonan tidak dapat diproses.'}</p>
          </div>` : ''}
        
        ${data.status === 'diproses' ? `<p>Permohonan Anda sedang dalam proses verifikasi oleh perangkat desa. Mohon menunggu pemberitahuan selanjutnya.</p>` : ''}
        
        <p style="margin-top: 30px;">Hormat kami,<br><strong>Perangkat ${data.namaDesaInfo}</strong></p>
      </div>

      <!-- Formal Footer -->
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 5px 0;"><strong>Kantor Kepala Desa</strong></p>
        <p style="margin: 0 0 5px 0;">Jl. Raya Utama No. 10, Kecamatan Digital, Kabupaten Bekasi</p>
        <p style="margin: 0;">Telepon: (021) 8991234 | Email: pelayanan@desadigital.id</p>
        <p style="margin: 15px 0 0 0; border-top: 1px solid #cbd5e1; pt: 10px;">&copy; ${new Date().getFullYear()} ${data.namaDesaInfo}. Seluruh hak cipta dilindungi.</p>
      </div>
    </div>
  `;
}