import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MiniChartPlaceholder } from './MiniChartPlaceholder';

interface AnimatedKpiCardProps {
  title: string;
  value: number;
  trend?: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  chartColor?: string;
  suffix?: string;
  index?: number;
}

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix ?? ''}`);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function AnimatedKpiCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor,
  iconBg,
  chartColor,
  suffix,
  index = 0,
}: AnimatedKpiCardProps) {
  const trendUp = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
    >
      <Card className="p-4 hover:shadow-elevated transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2 rounded-lg', iconBg)}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
          <MiniChartPlaceholder color={chartColor} />
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">
          <AnimatedNumber value={value} suffix={suffix} />
        </p>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', trendUp ? 'text-emerald-600' : 'text-rose-600')}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}% vs hier</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
