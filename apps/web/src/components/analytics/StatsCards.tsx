import { Eye, TrendingUp, Globe } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  last30Days: number;
  topReferrer: string;
}

export default function StatsCards({ total, last30Days, topReferrer }: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Views',
      value: total.toLocaleString(),
      icon: Eye,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
    },
    {
      label: 'Last 30 Days',
      value: last30Days.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Top Referrer',
      value: topReferrer || 'Direct',
      icon: Globe,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl"
        >
          <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <p className="text-lg font-bold text-zinc-100">{stat.value}</p>
          <p className="text-xs text-zinc-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
