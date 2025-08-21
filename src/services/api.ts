import axios from "axios";
import { DatabaseItem } from "../types";

// CS2 API base URL for item data
const CS2_API_BASE =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en";

// Steam marketplace base URL (proxied through your dev server)
const API_BASE = "/steam-api";

// Mapping of hash_name → nameid
const NAME_ID_JSON_URL =
  "https://raw.githubusercontent.com/somespecialone/steam-item-name-ids/refs/heads/master/data/cs2.json";

/**
 * Estimate seller's cut on a Steam sale.
 * Steam's cut scales roughly from 10% to 13.05% depending on item price.
 * @param buyerPrice - price in dollars
 * @returns estimated seller price after Steam fee
 */
function applySteamFee(buyerPrice: number): number {
  if (buyerPrice <= 0) return 0;

  const minPrice = 0.2;
  const maxPrice = 1800;
  const minFee = 0.10;
  const maxFee = 0.1305;

  const clampedPrice = Math.min(Math.max(buyerPrice, minPrice), maxPrice);

  const feePercent =
    minFee + ((clampedPrice - minPrice) / (maxPrice - minPrice)) * (maxFee - minFee);

  return +(buyerPrice * (1 - feePercent)).toFixed(2);
}

class CS2APIService {
  private itemsCache: any = null;
  private lastCacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private nameIdCache: Record<string, number> | null = null;
  private lastNameIdCacheTime: number = 0;
  private readonly NAMEID_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Get all items from CS2 API with caching
  private async getAllItems(): Promise<any[]> {
    const now = Date.now();
    if (this.itemsCache && now - this.lastCacheTime < this.CACHE_DURATION) {
      return this.itemsCache;
    }

    try {
      const response = await axios.get(`${CS2_API_BASE}/all.json`);
      this.itemsCache = response.data;
      this.lastCacheTime = now;
      return this.itemsCache;
    } catch (error) {
      console.error("Failed to fetch CS2 items:", error);
      return [];
    }
  }

  // Load the hashName → nameId mapping JSON
  private async loadNameIdMapping(): Promise<Record<string, number>> {
    const now = Date.now();
    if (
      this.nameIdCache &&
      now - this.lastNameIdCacheTime < this.NAMEID_CACHE_DURATION
    ) {
      return this.nameIdCache;
    }

    try {
      const response = await axios.get(NAME_ID_JSON_URL);
      this.nameIdCache = response.data;
      this.lastNameIdCacheTime = now;
      return this.nameIdCache || {};
    } catch (error) {
      console.error("Failed to fetch nameid mapping:", error);
      return {};
    }
  }

  // Get nameId directly from mapping
  private async getItemNameId(hashName: string): Promise<number | null> {
    try {
      const mapping = await this.loadNameIdMapping();
      return mapping[hashName] || null;
    } catch (error) {
      console.error("Failed to resolve nameid:", error);
      return null;
    }
  }

  // Get Steam marketplace price data
  private async getSteamItemPriceData(itemNameId: string) {
    try {
      const response = await axios.get(`${API_BASE}/market/itemordershistogram`, {
        params: {
          country: "US",
          language: "english",
          currency: 1,
          item_nameid: itemNameId,
          norender: 1,
        },
      });

      const data = response.data;

      const lowestSell =
        data?.lowest_sell_order ? applySteamFee(parseInt(data.lowest_sell_order, 10) / 100) : 0;
      const highestBuy =
        data?.highest_buy_order ? parseInt(data.highest_buy_order, 10) / 100 : 0;

      return {
        raw: data,
        lowestSell,
        highestBuy,
        sellOrderPriceText: `$${lowestSell.toFixed(2)}`,
        buyOrderPriceText: `$${highestBuy.toFixed(2)}`,
      };
    } catch (error: any) {
      console.error("Failed to get Steam price data:", error);
      throw error;
    }
  }

  // Search items by query
  async searchItems(query: string): Promise<DatabaseItem[]> {
    try {
      const allItems = await this.getAllItems();
      const items = Object.values(allItems);

      const filteredItems = items.filter(
        (item: any) =>
          item.market_hash_name &&
          item.market_hash_name.toLowerCase().includes(query.toLowerCase())
      );

      const results: DatabaseItem[] = [];

      for (let i = 0; i < Math.min(filteredItems.length, 10); i++) {
        const item = filteredItems[i];
        const nameId = await this.getItemNameId(item.market_hash_name);
        if (!nameId) continue;

        const priceData = await this.getSteamItemPriceData(String(nameId));

        results.push({
          id: item.id || item.market_hash_name,
          nameId: String(nameId),
          marketName: item.market_hash_name,
          hashName: item.market_hash_name,
          salePrice: priceData.lowestSell,
          salePriceText: priceData.sellOrderPriceText,
          suggestedPrice: priceData.lowestSell,
          suggestedPriceText: priceData.sellOrderPriceText,
          image: item.image || "",
          rarity: item.rarity?.name || "Unknown",
          rarityColor: item.rarity?.color || "#666666",
          type: item.weapon?.name || item.category?.name || "Unknown",
        });
      }

      return results;
    } catch (error: any) {
      console.error("Failed to search items:", error);
      return [];
    }
  }

  // Get item by hash name
  async getItemByHashName(hashName: string): Promise<DatabaseItem | null> {
    try {
      const allItems = await this.getAllItems();
      const items = Object.values(allItems);

      const item = items.find((i: any) => i.market_hash_name === hashName);
      if (!item) return null;

      const nameId = await this.getItemNameId(item.market_hash_name);
      if (!nameId) return null;

      const priceData = await this.getSteamItemPriceData(String(nameId));

      return {
        id: item.id || item.market_hash_name,
        nameId: String(nameId),
        marketName: item.market_hash_name,
        hashName: item.market_hash_name,
        salePrice: priceData.lowestSell,
        salePriceText: priceData.sellOrderPriceText,
        suggestedPrice: priceData.lowestSell,
        suggestedPriceText: priceData.sellOrderPriceText,
        image: item.image || "",
        rarity: item.rarity?.name || "Unknown",
        rarityColor: item.rarity?.color || "#666666",
        type: item.weapon?.name || item.category?.name || "Unknown",
      };
    } catch (error: any) {
      console.error("Failed to get item by hash name:", error);
      return null;
    }
  }

  // Validate hash name
  async validateHashName(hashName: string): Promise<boolean> {
    try {
      const item = await this.getItemByHashName(hashName);
      return item !== null;
    } catch (error) {
      console.error("Validation failed:", error);
      return false;
    }
  }

  // Get item price only
  async getItemPrice(hashName: string): Promise<number | null> {
    try {
      const nameId = await this.getItemNameId(hashName);
      if (!nameId) return null;

      const priceData = await this.getSteamItemPriceData(String(nameId));
      return priceData.lowestSell || null;
    } catch (error) {
      console.error("Failed to get item price:", error);
      return null;
    }
  }
}

export const cs2API = new CS2APIService();