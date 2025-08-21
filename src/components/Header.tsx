import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RefreshCw, Plus, List, Settings, TrendingUp } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, loading }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: TrendingUp },
    { path: '/items', label: 'Items', icon: List },
    { path: '/add', label: 'Add Item', icon: Plus },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-background-secondary border-b border-border-primary">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/icon.png" alt="CS2 Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold text-text-primary">SkinVault</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                loading
                  ? 'bg-background-tertiary text-text-muted cursor-not-allowed'
                  : 'bg-background-tertiary text-text-secondary hover:text-text-primary hover:bg-border-primary'
              }`}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4 border-t border-border-primary">
          <nav className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'text-accent-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
