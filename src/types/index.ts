export interface PurchasedItem {
  id: string;
  hashName: string;
  name: string;
  type: string;
  rarity: string;
  condition?: string;
  float?: number;
  buyPrice: number;
  buyDate: string;
  currentPrice?: number;
  priceHistory: PricePoint[];
  imageUrl?: string;
}

export interface PricePoint {
  price: number;
  date: string;
  timestamp: number;
}

export interface DatabaseItem {
  id: string;
  nameId: string;
  marketName: string;
  hashName: string;
  salePrice: number;
  salePriceText: string;
  suggestedPrice: number;
  suggestedPriceText: string;
  image: string;
  rarity: string;
  rarityColor: string;
  type: string;
  exterior?: string;
  float?: number;
  pattern?: number;
  stattrak?: boolean;
  souvenir?: boolean;
}

export interface InvestmentStats {
  totalInvested: number;
  currentValue: number;
  totalProfit: number;
  profitPercentage: number;
  itemCount: number;
  bestPerformer?: PurchasedItem;
  worstPerformer?: PurchasedItem;
}

export interface AddItemFormData {
  hashName: string;
  buyPrice: number;
  buyDate: string;
  float?: number;
  notes?: string;
}
