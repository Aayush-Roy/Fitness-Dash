import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  children?: ReactNode;
}

const StatCard = ({ title, value, icon: Icon, trend, description, children }: StatCardProps) => {
  return (
    <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <div className="flex items-end space-x-2">
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            {trend && (
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className="p-3 bg-primary-900/20 rounded-xl">
          {Icon && <Icon size={24} className="text-primary-400" />}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default StatCard;