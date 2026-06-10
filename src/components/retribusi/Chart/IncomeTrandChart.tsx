// src/components/retribusi/Chart/IncomeTrendSection.tsx
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IncomeTrendSection() {
  const data = [{ name: 'Jan', total: 4000 }, { name: 'Feb', total: 3000 }]; // Ganti dengan data props
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(val) => `Rp ${val/1000}k`} />
        <Line type="monotone" dataKey="total" stroke="#2563eb" />
      </LineChart>
    </ResponsiveContainer>
  );
}