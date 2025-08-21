import { PurchasedItem } from '../types';

const STORAGE_KEYS = {
  ITEMS: 'skinVault_tracker_items',
  SETTINGS: 'skinVault_prices_tracker_settings',
} as const;

export interface AppSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  priceAlertThreshold: number;
  theme: 'dark' | 'light';
}

const defaultSettings: AppSettings = {
  autoRefresh: true,
  refreshInterval: 60000, // A minute
  priceAlertThreshold: 50,
  theme: 'dark',
};

class StorageService {
  private getStorage() {
    return typeof window !== 'undefined' ? localStorage : null;
  }

  // Items management
  getItems(): PurchasedItem[] {
    try {
      const storage = this.getStorage();
      if (!storage) return [];
      
      const items = storage.getItem(STORAGE_KEYS.ITEMS);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Failed to get items from storage:', error);
      return [];
    }
  }

  saveItems(items: PurchasedItem[]): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      
      storage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save items to storage:', error);
    }
  }

  addItem(item: PurchasedItem): void {
    const items = this.getItems();
    items.push(item);
    this.saveItems(items);
  }

  updateItem(updatedItem: PurchasedItem): void {
    const items = this.getItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      items[index] = updatedItem;
      this.saveItems(items);
    }
  }

  removeItem(itemId: string): void {
    const items = this.getItems();
    const filteredItems = items.filter(item => item.id !== itemId);
    this.saveItems(filteredItems);
  }

  // Settings management
  getSettings(): AppSettings {
    try {
      const storage = this.getStorage();
      if (!storage) return defaultSettings;
      
      const settings = storage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    } catch (error) {
      console.error('Failed to get settings from storage:', error);
      return defaultSettings;
    }
  }

  saveSettings(settings: Partial<AppSettings>): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings to storage:', error);
    }
  }

  // Utility methods
  clearAll(): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      
      storage.removeItem(STORAGE_KEYS.ITEMS);
      storage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  exportData(): string {
    try {
      const data = {
        items: this.getItems(),
        settings: this.getSettings(),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '';
    }
  }

  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.items) {
        this.saveItems(parsed.items);
      }
      if (parsed.settings) {
        this.saveSettings(parsed.settings);
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
