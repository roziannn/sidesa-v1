// app/(dashboard)/retribusi/laporan/components/TopCitizensTable.tsx
import React from 'react';

async function getTopCitizens() {
  // Query: SELECT profiles.nama, rt, rw, count(*) as total_bayar
  // FROM retribusi JOIN profiles ON warga_id
  // WHERE retribusi.status = 'lunas' AND jatuh_tempo > bayar_at
  // GROUP BY profile.id ORDER BY total_bayar DESC LIMIT 10
  
  // Dummy data untuk visualisasi
  return [
    { nama: "Agus Supriyadi", rt: "01", rw: "05", skor: "100%", status: "Sangat Patuh" },
    { nama: "Siti Aminah", rt: "02", rw: "05", skor: "100%", status: "Sangat Patuh" },
    // ...
  ];
}

export default async function TopCitizensTable() {
  const data = await getTopCitizens();

  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50 border-b text-gray-600 font-medium">
        <tr>
          <th className="p-4">Nama Warga</th>
          <th className="p-4">RT/RW</th>
          <th className="p-4 text-center">Skor Ketepatan</th>
          <th className="p-4">Predikat</th>
        </tr>
      </thead>
      <tbody>
        {data.map((warga, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium">{warga.nama}</td>
            <td className="p-4">{warga.rt} / {warga.rw}</td>
            <td className="p-4 text-center text-emerald-600 font-bold">{warga.skor}</td>
            <td className="p-4">
               <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                 {warga.status}
               </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}