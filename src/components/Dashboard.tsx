import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Package, Plus, ArrowRight } from 'lucide-react';
import { PurchasedItem } from '../types';
import { calculateInvestmentStats, formatCurrency, formatPercentage, getProfitColor } from '../utils/calculations';

interface DashboardProps {
  items: PurchasedItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const stats = calculateInvestmentStats(items);

  const StatCard: React.FC<{
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, subtitle, icon, color }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-text-muted text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-400', '-400/10')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
  }> = ({ title, description, icon, href }) => (
    <Link
      to={href}
      className="card hover:bg-background-tertiary transition-colors duration-200 group"
    >
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors duration-200">
            {title}
          </h3>
          <p className="text-text-secondary text-sm mt-1">{description}</p>
        </div>
        <ArrowRight size={20} className="text-text-muted group-hover:text-accent-primary transition-colors duration-200" />
      </div>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-2">
            Track your CS2 item investments and monitor your portfolio performance
          </p>
        </div>
        <Link
          to="/add"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Item</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Invested"
          value={formatCurrency(stats.totalInvested)}
          icon={<DollarSign size={24} />}
          color="text-text-primary"
        />
        <StatCard
          title="Current Value"
          value={formatCurrency(stats.currentValue)}
          icon={<Package size={24} />}
          color="text-text-primary"
        />
        <StatCard
          title="Total Profit"
          value={formatCurrency(stats.totalProfit)}
          subtitle={formatPercentage(stats.profitPercentage)}
          icon={<TrendingUp size={24} />}
          color={getProfitColor(stats.totalProfit)}
        />
        <StatCard
          title="Items Owned"
          value={stats.itemCount.toString()}
          icon={<Package size={24} />}
          color="text-text-primary"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Add New Item"
          description="Add a new CS2 skin to your investment portfolio"
          icon={<Plus size={20} />}
          href="/add"
        />
        <QuickActionCard
          title="View All Items"
          description="See detailed information about all your investments"
          icon={<Package size={20} />}
          href="/items"
        />
      </div>

      {/* Performance Highlights */}
      {items.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Performance Highlights</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Performer */}
            {stats.bestPerformer && (
              <div className="card">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <TrendingUp size={20} className="text-green-400 mr-2" />
                  Best Performer
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Item</span>
                    <span className="text-text-primary font-medium">{stats.bestPerformer.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Buy Price</span>
                    <span className="text-text-primary">{formatCurrency(stats.bestPerformer.buyPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Current Price</span>
                    <span className="text-text-primary">{formatCurrency(stats.bestPerformer.currentPrice || stats.bestPerformer.buyPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Profit</span>
                    <span className="text-green-400 font-semibold">
                      {formatCurrency((stats.bestPerformer.currentPrice || stats.bestPerformer.buyPrice) - stats.bestPerformer.buyPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Worst Performer */}
            {stats.worstPerformer && (
              <div className="card">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <TrendingDown size={20} className="text-red-400 mr-2" />
                  Worst Performer
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Item</span>
                    <span className="text-text-primary font-medium">{stats.worstPerformer.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Buy Price</span>
                    <span className="text-text-primary">{formatCurrency(stats.worstPerformer.buyPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Current Price</span>
                    <span className="text-text-primary">{formatCurrency(stats.worstPerformer.currentPrice || stats.worstPerformer.buyPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Loss</span>
                    <span className="text-red-400 font-semibold">
                      {formatCurrency((stats.worstPerformer.currentPrice || stats.worstPerformer.buyPrice) - stats.worstPerformer.buyPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-background-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No items yet</h3>
          <p className="text-text-secondary mb-6">
            Start tracking your CS2 skin investments by adding your first item
          </p>
          <Link to="/add" className="btn-primary">
            Add Your First Item
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
