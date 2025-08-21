import { PurchasedItem, InvestmentStats } from '../types';

export const calculateProfit = (currentPrice: number, buyPrice: number): number => {
  return currentPrice - buyPrice;
};

export const calculateProfitPercentage = (currentPrice: number, buyPrice: number): number => {
  if (buyPrice === 0) return 0;
  return ((currentPrice - buyPrice) / buyPrice) * 100;
};

export const calculateTotalInvested = (items: PurchasedItem[]): number => {
  return items.reduce((total, item) => total + item.buyPrice, 0);
};

export const calculateCurrentValue = (items: PurchasedItem[]): number => {
  return items.reduce((total, item) => {
    const currentPrice = item.currentPrice || item.buyPrice;
    return total + currentPrice;
  }, 0);
};

export const calculateTotalProfit = (items: PurchasedItem[]): number => {
  return items.reduce((total, item) => {
    const currentPrice = item.currentPrice || item.buyPrice;
    return total + calculateProfit(currentPrice, item.buyPrice);
  }, 0);
};

export const calculateInvestmentStats = (items: PurchasedItem[]): InvestmentStats => {
  const totalInvested = calculateTotalInvested(items);
  const currentValue = calculateCurrentValue(items);
  const totalProfit = calculateTotalProfit(items);
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  let bestPerformer: PurchasedItem | undefined;
  let worstPerformer: PurchasedItem | undefined;
  let bestProfitPercentage = -Infinity;
  let worstProfitPercentage = Infinity;

  items.forEach(item => {
    const currentPrice = item.currentPrice || item.buyPrice;
    const profitPercentage = calculateProfitPercentage(currentPrice, item.buyPrice);
    
    if (profitPercentage > bestProfitPercentage) {
      bestProfitPercentage = profitPercentage;
      bestPerformer = item;
    }
    
    if (profitPercentage < worstProfitPercentage) {
      worstProfitPercentage = profitPercentage;
      worstPerformer = item;
    }
  });

  return {
    totalInvested,
    currentValue,
    totalProfit,
    profitPercentage,
    itemCount: items.length,
    bestPerformer,
    worstPerformer,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};

export const getProfitColor = (profit: number): string => {
  if (profit > 0) return 'text-green-400';
  if (profit < 0) return 'text-red-400';
  return 'text-text-secondary';
};

export const getRarityColor = (rarity: string): string => {
  const rarityColors: Record<string, string> = {
    'Consumer Grade': 'text-gray-400',
    'Industrial Grade': 'text-blue-400',
    'Mil-Spec Grade': 'text-blue-500',
    'Restricted': 'text-purple-400',
    'Classified': 'text-pink-400',
    'Covert': 'text-red-400',
    'Contraband': 'text-yellow-400',
    'Extraordinary': 'text-orange-400',
  };
  
  return rarityColors[rarity] || 'text-text-secondary';
};

export const shouldSell = (item: PurchasedItem, threshold: number = 10): boolean => {
  if (!item.currentPrice) return false;
  const profitPercentage = calculateProfitPercentage(item.currentPrice, item.buyPrice);
  return profitPercentage >= threshold;
};

export const shouldHold = (item: PurchasedItem, threshold: number = -5): boolean => {
  if (!item.currentPrice) return true;
  const profitPercentage = calculateProfitPercentage(item.currentPrice, item.buyPrice);
  return profitPercentage > threshold;
};
