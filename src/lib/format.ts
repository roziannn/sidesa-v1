export const formatRupiah = (value: string | number): string => {
  const number = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value;
  if (!number) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(number));
};

// digunakan utk mengubah format "Rp 10.000" kembali ke angka 10000 untuk database
export const parseRupiah = (value: string): number => {
  return Number(value.replace(/[^0-9]/g, ''));
};

export const formatDate = (date: string) => 
  new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });