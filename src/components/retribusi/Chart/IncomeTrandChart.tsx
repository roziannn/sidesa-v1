'use client';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area,
  AreaChart,
} from 'recharts';

export default function IncomeTrendSection() {
  const data = [
    { name: 'Jan', total: 4000 },
    { name: 'Feb', total: 3000 },
    { name: 'Mar', total: 5000 },
    { name: 'Apr', total: 2780 },
    { name: 'Mei', total: 6890 },
    { name: 'Jun', total: 4390 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{fontSize: 12, fill: '#64748b'}} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{fontSize: 12, fill: '#64748b'}} 
          tickFormatter={(val) => `Rp ${val/1000}k`}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          // formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Total']}
        />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="#2563eb" 
          strokeWidth={3}
          dot={{ fill: '#2563eb', strokeWidth: 2, r: 4, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}