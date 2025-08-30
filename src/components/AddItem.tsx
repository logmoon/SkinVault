import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { AddItemFormData, DatabaseItem } from '../types';
import { cs2API } from '../services/api';

interface AddItemProps {
  onAdd: (itemData: any) => Promise<boolean>;
  loading: boolean;
}

const AddItem: React.FC<AddItemProps> = ({ onAdd, loading }) => {
  const navigate = useNavigate();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [formData, setFormData] = useState<AddItemFormData>({
    hashName: '',
    buyPrice: 0,
    buyDate: '',
    float: undefined,
    notes: '',
  });
  
  const [searchResults, setSearchResults] = useState<DatabaseItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DatabaseItem | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  // Debounced search function
  const handleSearch = useCallback(async (query: string, force: boolean = false) => {
    if (!force && query.length < 3) {
      setSearchResults([]);
      return;
    }

    // Cancel previous search if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this search
    abortControllerRef.current = new AbortController();
    
    setIsSearching(true);
    setLastSearchQuery(query);
    
    try {
      const results = await cs2API.searchItems(query);
      
      // Only update results if this is still the latest search
      if (query === lastSearchQuery || force) {
        setSearchResults(results);
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      toast.error('Failed to search items');
    } finally {
      setIsSearching(false);
    }
  }, [lastSearchQuery]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (formData.hashName && formData.hashName.length >= 3) {
        handleSearch(formData.hashName);
      }
    }, 300); // 300ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [formData.hashName, handleSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleHashNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, hashName: value }));
    setSelectedItem(null);
    setIsValid(null);
    
    if (value.length < 3) {
      setSearchResults([]);
    }
  };

  const handleForceSearch = () => {
    if (formData.hashName.trim()) {
      handleSearch(formData.hashName.trim(), true);
    } else {
      toast.error('Please enter a search term');
    }
  };

  const handleSelectItem = (item: DatabaseItem) => {
    setSelectedItem(item);
    setFormData(prev => ({
      ...prev,
      hashName: item.hashName,
      buyPrice: item.salePrice,
    }));
    setSearchResults([]);
    setIsValid(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hashName || formData.buyPrice <= 0 || !formData.buyDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const valid = await cs2API.validateHashName(formData.hashName);
      if (valid === false) {
        toast.error('Please enter a valid hash name');
        setIsValid(false);
        return;
      }

      const itemData = {
        hashName: formData.hashName,
        name: selectedItem?.marketName || formData.hashName,
        type: selectedItem?.type || 'Unknown',
        rarity: selectedItem?.rarity || 'Unknown',
        float: formData.float,
        buyPrice: formData.buyPrice,
        buyDate: formData.buyDate,
        imageUrl: selectedItem?.image,
      };

      const success = await onAdd(itemData);
      if (success) {
        toast.success('Item added successfully!');
        navigate('/items');
      } else {
        toast.error('Failed to add item');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred while adding the item');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors duration-200"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Add New Item</h1>
          <p className="text-text-secondary mt-1">
            Add a new CS2 skin to your investment portfolio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hash Name Search */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Item Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Hash Name *
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={formData.hashName}
                    onChange={(e) => handleHashNameChange(e.target.value)}
                    placeholder="Enter item hash name (e.g., AK-47 | Redline)"
                    className="input-field w-full pr-10"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isSearching ? (
                      <Loader2 size={18} className="animate-spin text-text-muted" />
                    ) : isValid === true ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : isValid === false ? (
                      <XCircle size={18} className="text-red-400" />
                    ) : (
                      <Search size={18} className="text-text-muted" />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleForceSearch}
                  disabled={isSearching || !formData.hashName.trim()}
                  className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 disabled:bg-accent-primary/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  title="Force search"
                >
                  <RefreshCw size={16} className={isSearching ? 'animate-spin' : ''} />
                  <span>Search</span>
                </button>
              </div>
              {formData.hashName.length > 0 && formData.hashName.length < 3 && !isSearching && (
                <p className="text-xs text-text-muted mt-1">
                  Type at least 3 characters to search automatically
                </p>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border border-border-primary rounded-lg bg-background-tertiary">
                <div className="p-3 border-b border-border-primary">
                  <h3 className="text-sm font-medium text-text-primary">
                    Search Results ({searchResults.length})
                  </h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className="w-full p-3 text-left hover:bg-background-secondary transition-colors duration-200 border-b border-border-primary last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.marketName}
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{item.marketName}</p>
                          <p className="text-xs text-text-secondary">{item.type} • {item.rarity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-text-primary">{item.salePriceText}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {!isSearching && formData.hashName.length >= 3 && searchResults.length === 0 && lastSearchQuery === formData.hashName && (
              <div className="p-4 text-center text-text-secondary bg-background-tertiary rounded-lg">
                <p>No items found for "{formData.hashName}"</p>
                <p className="text-xs mt-1">Try the force search button or check your spelling</p>
              </div>
            )}

            {/* Selected Item Preview */}
            {selectedItem && (
              <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  {selectedItem.image && (
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.marketName}
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{selectedItem.marketName}</h3>
                    <p className="text-sm text-text-secondary">
                      {selectedItem.type} • {selectedItem.rarity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-text-primary">{selectedItem.salePriceText}</p>
                    <p className="text-sm text-text-secondary">Current Price</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Purchase Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Purchase Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Buy Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.buyPrice}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  buyPrice: parseFloat(e.target.value) || 0
                }))}
                className="input-field w-full"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Buy Date *
              </label>
              <input
                type="date"
                value={formData.buyDate || ''}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  buyDate: e.target.value,
                }))}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Float (Optional)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={formData.float || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  float: parseFloat(e.target.value) || undefined
                }))}
                className="input-field w-full"
                placeholder="0.000"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input-field w-full h-20 resize-none"
              placeholder="Add any additional notes about this item..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.hashName || formData.buyPrice <= 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              'Add Item'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;