import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function UsageChart({ data, type = 'storage' }) {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatLabel = (value) => {
    if (type === 'apiCalls') return formatNumber(value);
    return formatBytes(value);
  };

  const getColor = () => {
    switch (type) {
      case 'storage':
        return '#0ea5e9';
      case 'bandwidth':
        return '#8b5cf6';
      case 'apiCalls':
        return '#10b981';
      default:
        return '#0ea5e9';
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={getColor()} stopOpacity={0.3} />
            <stop offset="95%" stopColor={getColor()} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        <YAxis
          tickFormatter={formatLabel}
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        <Tooltip
          formatter={formatLabel}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#374151' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={getColor()}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#color${type})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
