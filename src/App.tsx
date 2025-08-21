import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ItemList from './components/ItemList';
import AddItem from './components/AddItem';
import Settings from './components/Settings';
import { PurchasedItem } from './types';
import { storageService, AppSettings } from './services/storage';
import { cs2API } from './services/api';

function App() {
  const [items, setItems] = useState<PurchasedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  
  // Use refs to track interval and prevent stale closures
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsRef = useRef(settings);
  const itemsRef = useRef(items);

  // Update refs when state changes
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Load initial data
  useEffect(() => {
    const savedItems = storageService.getItems();
    const savedSettings = storageService.getSettings();
    setItems(savedItems);
    setSettings(savedSettings);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    const startAutoRefresh = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (settingsRef.current.autoRefresh && itemsRef.current.length > 0) {
        intervalRef.current = setInterval(() => {
          refreshPrices();
        }, settingsRef.current.refreshInterval);
      }
    };

    const stopAutoRefresh = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (settings.autoRefresh && items.length > 0) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    // Cleanup on unmount
    return () => stopAutoRefresh();
  }, [settings.autoRefresh, settings.refreshInterval, items.length]);

  const addItem = async (itemData: Omit<PurchasedItem, 'id' | 'priceHistory'>) => {
    setLoading(true);
    try {
      // Get current price from CS2 API
      const currentPrice = await cs2API.getItemPrice(itemData.hashName);
      
      const newItem: PurchasedItem = {
        ...itemData,
        id: crypto.randomUUID(),
        buyDate: itemData.buyDate,
        currentPrice: currentPrice || itemData.buyPrice,
        priceHistory: [{
          price: currentPrice || 0.0,
          date: new Date().toISOString(),
          timestamp: Date.now(),
        }],
      };

      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      storageService.saveItems(updatedItems);
      
      return true;
    } catch (error) {
      console.error('Failed to add item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    storageService.saveItems(updatedItems);
  };

  const updateItem = (updatedItem: PurchasedItem) => {
    const updatedItems = items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(updatedItems);
    storageService.saveItems(updatedItems);
  };

  const refreshPrices = async () => {
    setLoading(true);
    let updatedCount = 0;
    let profitableItems: string[] = [];
    
    try {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          const currentPrice = await cs2API.getItemPrice(item.hashName);
          if (currentPrice && currentPrice !== item.currentPrice) {
            updatedCount++;
            
            // Check for profit alerts
            const profitPercentage = ((currentPrice - item.buyPrice) / item.buyPrice) * 100;
            if (profitPercentage >= settings.priceAlertThreshold) {
              profitableItems.push(`${item.name} (+${profitPercentage.toFixed(1)}%)`);
            }
            
            return {
              ...item,
              currentPrice,
              priceHistory: [
                ...item.priceHistory,
                {
                  price: currentPrice,
                  date: new Date().toISOString(),
                  timestamp: Date.now(),
                },
              ],
            };
          }
          return item;
        })
      );
      
      setItems(updatedItems);
      storageService.saveItems(updatedItems);

      // Show notifications
      if (updatedCount > 0) {
        toast.success(`Refreshed ${updatedCount} price${updatedCount === 1 ? '' : 's'}`, {
          icon: '✅',
        });
      } else {
        toast('All prices are up to date', {
          icon: '📊',
        });
      }

      // Show profit alerts
      if (profitableItems.length > 0) {
        profitableItems.forEach(item => {
          toast.success(`🚀 Profit Alert: ${item}`, {
            duration: 6000,
          });
        });
      }
      
    } catch (error) {
      console.error('Failed to refresh prices:', error);
      toast.error('Failed to refresh prices', {
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    storageService.saveSettings(updatedSettings);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background-primary">
        <Header onRefresh={() => refreshPrices()} loading={loading} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard items={items} />} />
            <Route 
              path="/items" 
              element={
                <ItemList 
                  items={items} 
                  onRemove={removeItem} 
                  onUpdate={updateItem}
                />
              } 
            />
            <Route 
              path="/add" 
              element={<AddItem onAdd={addItem} loading={loading} />} 
            />
            <Route 
              path="/settings" 
              element={
                <Settings 
                  settings={settings}
                  onSettingsChange={updateSettings}
                />
              } 
            />
          </Routes>
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2a2a2a',
              color: '#ffffff',
              border: '1px solid #404040',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;