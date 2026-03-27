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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl"
        >
          <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-zinc-100 truncate">{stat.value}</p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
