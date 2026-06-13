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

export const formatDate = (
  date: string | Date
) =>
  new Date(date).toLocaleDateString(
    'id-ID',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

export const formatShortDate = (
  date: string | Date
) =>
  new Date(date).toLocaleDateString(
    'id-ID',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

export const formatDateTime = (
  date: string | Date
) =>
  new Date(date).toLocaleString(
    'id-ID',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

export const formatTime = (
  time: string
) => time.slice(0, 5);

export const formatMonthYear = (
  date: string | Date
) =>
  new Date(date).toLocaleDateString(
    'id-ID',
    {
      month: 'long',
      year: 'numeric',
    }
  );

export const formatDayDate = (
  date: string | Date
) =>
  new Date(date).toLocaleDateString(
    'id-ID',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );