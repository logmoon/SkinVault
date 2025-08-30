import React, { useState } from 'react';
import { Trash2, ExternalLink, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { PurchasedItem } from '../types';
import { formatCurrency, formatPercentage, getProfitColor, getRarityColor, shouldSell, shouldHold } from '../utils/calculations';
import { format } from 'date-fns';

interface ItemListProps {
  items: PurchasedItem[];
  onRemove: (itemId: string) => void;
  onUpdate: (item: PurchasedItem) => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, onRemove, onUpdate }) => {
  const [itemToDelete, setItemToDelete] = useState<PurchasedItem | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'profit' | 'date' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'profit':
        aValue = (a.currentPrice || a.buyPrice) - a.buyPrice;
        bValue = (b.currentPrice || b.buyPrice) - b.buyPrice;
        break;
      case 'date':
        aValue = new Date(a.buyDate).getTime();
        bValue = new Date(b.buyDate).getTime();
        break;
      case 'value':
        aValue = a.currentPrice || a.buyPrice;
        bValue = b.currentPrice || b.buyPrice;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const confirmDelete = (item: PurchasedItem) => {
    setItemToDelete(item);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      onRemove(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const getPricempireUrl = (hashName: string) => {
    if (!hashName) return '#';
    
    const exteriorMatch = hashName.match(/\(([^)]+)\)$/);
    const exterior = exteriorMatch ? exteriorMatch[1] : 'Factory New';
    
    const nameWithoutExterior = hashName.replace(/\s*\([^)]+\)$/, '');
    const parts = nameWithoutExterior.split(' | ');
    const weapon = parts[0] || '';
    const skin = parts[1] || '';
    
    const formatForUrl = (str: string) => str.toLowerCase().replace(/\s+/g, '-');
    
    return `https://app.pricempire.com/item/cs2/skin/${formatForUrl(weapon)}/${formatForUrl(skin)}/${formatForUrl(exterior)}`;
  };

  const getRecommendation = (item: PurchasedItem) => {
    if (shouldSell(item)) {
      return { text: 'Consider Selling', color: 'text-green-400', icon: TrendingUp };
    } else if (shouldHold(item)) {
      return { text: 'Hold', color: 'text-yellow-400', icon: TrendingDown };
    } else {
      return { text: 'Monitor Closely', color: 'text-red-400', icon: TrendingDown };
    }
  };

  const SortButton: React.FC<{
    field: typeof sortBy;
    children: React.ReactNode;
  }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
        sortBy === field
          ? 'bg-accent-primary text-white'
          : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
      }`}
    >
      <span>{children}</span>
      {sortBy === field && (
        <span className="text-xs">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Your Items</h1>
          <p className="text-text-secondary mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''} in your portfolio
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Sort by:</span>
          <SortButton field="date">Date</SortButton>
          <SortButton field="name">Name</SortButton>
          <SortButton field="profit">Profit</SortButton>
          <SortButton field="value">Value</SortButton>
        </div>
      </div>

      {/* Items Grid */}
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedItems.map((item) => {
            const currentPrice = item.currentPrice || item.buyPrice;
            const profit = currentPrice - item.buyPrice;
            const profitPercentage = (profit / item.buyPrice) * 100;
            const recommendation = getRecommendation(item);
            const RecommendationIcon = recommendation.icon;

            return (
              <div key={item.id} className="card hover:bg-background-tertiary transition-colors duration-200">
                {/* Item Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded-lg bg-background-tertiary"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary truncate">{item.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(item.rarity)} bg-background-tertiary`}>
                          {item.rarity}
                        </span>
                        <span className="text-xs text-text-secondary">{item.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => confirmDelete(item)}
                    className="p-2 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Price Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Buy Price</p>
                    <p className="font-medium text-text-primary">{formatCurrency(item.buyPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Current Price</p>
                    <p className="font-medium text-text-primary">{formatCurrency(currentPrice)}</p>
                  </div>
                </div>

                {/* Profit/Loss */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Profit/Loss</p>
                    <p className={`font-semibold ${getProfitColor(profit)}`}>
                      {formatCurrency(profit)} ({formatPercentage(profitPercentage)})
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 text-xs ${recommendation.color}`}>
                    <RecommendationIcon size={14} />
                    <span>{recommendation.text}</span>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Purchase Date</span>
                    <span className="text-text-primary">
                      {format(new Date(item.buyDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Float</span>
                    <span className="text-text-primary">{item.float === undefined ? '-' : item.float?.toFixed(3)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                    <a
                      href={`https://steamcommunity.com/market/listings/730/${encodeURIComponent(item.hashName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-accent-primary hover:text-accent-secondary transition-colors duration-200"
                    >
                      <ExternalLink size={14} />
                      <span>View on Steam Marketplace</span>
                    </a>
                    <a
                      href={getPricempireUrl(item.hashName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-accent-primary hover:text-accent-secondary transition-colors duration-200"
                    >
                      <ExternalLink size={14} />
                      <span>View on Pricempire</span>
                    </a>
                  <div className="flex items-center space-x-1 text-xs text-text-secondary">
                    <Calendar size={12} />
                    <span>{format(new Date(item.buyDate), 'MMM dd')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-background-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign size={32} className="text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No items yet</h3>
          <p className="text-text-secondary">
            Start building your portfolio by adding your first CS2 skin
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-secondary border border-border-primary rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Item</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete "{itemToDelete.name}"? This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemList;
