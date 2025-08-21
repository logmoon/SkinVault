import React, { useState, useEffect } from 'react';
import { Download, Upload, Trash2, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { storageService, AppSettings } from '../services/storage';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    onSettingsChange({ [key]: value });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = storageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skinVault-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const success = storageService.importData(text);
      
      if (success) {
        toast.success('Data imported successfully!');
        // Reload the page to reflect imported data
        window.location.reload();
      } else {
        toast.error('Invalid data format');
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      storageService.clearAll();
      toast.success('All data cleared');
      window.location.reload();
    }
  };

  const formatInterval = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">
          Configure your preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="space-y-6">
          <div className="card">
            <div>
            <h2 className="text-xl font-semibold text-text-primary">General Settings</h2>
            <p className="text-sm text-text-secondary mb-6">
              Configure auto-refresh and notification settings
            </p>
            </div>
            
            <div className="space-y-6">
              {/* Auto Refresh */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-text-primary">Auto Refresh Prices</h3>
                  <p className="text-sm text-text-secondary">
                    Automatically update item prices in the background
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-background-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                </label>
              </div>

              {/* Refresh Interval */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Refresh Interval
                </label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                  className="input-field w-full"
                  disabled={!settings.autoRefresh}
                >
                  <option value={60000}>1 minute</option>
                  <option value={300000}>5 minutes</option>
                  <option value={600000}>10 minutes</option>
                  <option value={1800000}>30 minutes</option>
                  <option value={3600000}>1 hour</option>
                </select>
                <p className="text-xs text-text-muted mt-1">
                  Current: {formatInterval(settings.refreshInterval)}
                </p>
              </div>

              {/* Price Alert Threshold */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Price Alert Threshold (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.priceAlertThreshold}
                  onChange={(e) => handleSettingChange('priceAlertThreshold', parseInt(e.target.value))}
                  className="input-field w-full"
                />
                <p className="text-xs text-text-muted mt-1">
                  Get notified when items reach this profit percentage
                </p>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              {/* Auto Refresh Status */}
              <div className="bg-background-primary rounded-lg p-4 border border-border-primary">
                <h4 className="font-medium text-text-primary mb-2">Auto Refresh Status</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-text-secondary">
                    Status: <span className={settings.autoRefresh ? 'text-green-400' : 'text-gray-400'}>
                      {settings.autoRefresh ? 'Active' : 'Disabled'}
                    </span>
                  </p>
                  {settings.autoRefresh && (
                    <p className="text-text-secondary">
                      Refresh interval: {formatInterval(settings.refreshInterval)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Data Management</h2>
            
            <div className="space-y-4">
              {/* Export Data */}
              <div>
                <h3 className="font-medium text-text-primary mb-2">Export Data</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Download all your items and settings as a JSON file
                </p>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Export Data</span>
                    </>
                  )}
                </button>
              </div>

              {/* Import Data */}
              <div>
                <h3 className="font-medium text-text-primary mb-2">Import Data</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Import items and settings from a previously exported file
                </p>
                <label className="btn-secondary w-full flex items-center justify-center space-x-2 cursor-pointer">
                  {isImporting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Import Data</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
              </div>

              {/* Clear Data */}
              <div>
                <h3 className="font-medium text-text-primary mb-2">Clear All Data</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Permanently delete all items and settings
                </p>
                <button
                  onClick={handleClearData}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-4">About</h2>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                <strong className="text-text-primary">SkinVault</strong> helps you track your CS2 item investments and monitor their performance over time.
              </p>
              <p>
                Price data is sourced from the Steam Market, we also account for the Steam tax.
              </p>
              <p>
                All data is stored locally in the browser.
              </p>
              <p>
                Made by log.moon and a few clankers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;