'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Loader2,
  Upload,
  Send,
} from 'lucide-react';
import { SettingsSection } from '@/components/settings/settings-section';
import { BrandPreviewCard } from '@/components/settings/brand-preview-card';
import { ThemeSelector } from '@/components/settings/theme-selector';
import { ColorPicker } from '@/components/ui/color-picker';

interface UserSettings {
  // Email Preferences
  emailNotifications?: boolean;
  digestFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE';
  notifyOnComplete?: boolean;
  notifyOnStatusChange?: boolean;

  // Report Branding
  companyName?: string | null;
  companyLogo?: string | null;
  brandPrimaryColor?: string | null;
  brandSecondaryColor?: string | null;
  reportFooterText?: string | null;

  // Export Preferences
  defaultExportFormat?: 'PDF' | 'EXCEL' | 'JSON';
  includeScreenshots?: boolean;
  includeClaudeAnalysis?: boolean;

  // UI Preferences
  theme?: 'LIGHT' | 'DARK' | 'AUTO';
  defaultView?: 'GRID' | 'TABLE';
  itemsPerPage?: number;
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        toast.success('Settings saved successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const testApiConnection = async (service: 'semrush' | 'claude' | 'sendgrid' | 'slack') => {
    const response = await fetch('/api/settings/test-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Connection test failed');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/settings/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await updateSettings({ companyLogo: data.logoUrl });
        toast.success('Logo uploaded successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
      toast.error(errorMessage);
    } finally {
      setUploadingLogo(false);
    }
  };

  const sendTestEmail = async () => {
    setSendingTestEmail(true);
    try {
      const response = await fetch('/api/settings/send-test-email', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Test email sent! Check your inbox.');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send test email';
      toast.error(errorMessage);
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[oklch(0.24_0.13_265)] to-[oklch(0.20_0.11_265)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <SettingsIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Settings</h1>
                <p className="text-white/80">Manage your account and preferences</p>
              </div>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Account Section */}
          <SettingsSection
            title="Account"
            description="Your account information and profile"
          >
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <UserButton />
              <div>
                <div className="font-medium text-gray-900">{user?.fullName || 'User'}</div>
                <div className="text-sm text-gray-600">{user?.primaryEmailAddress?.emailAddress}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Manage your account settings, password, and two-factor authentication through your Clerk profile.
            </p>
          </SettingsSection>

          {/* Email Notifications */}
          <SettingsSection
            title="Email Notifications"
            description="Control what emails you receive"
          >
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-600">Receive email updates</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications !== false}
                  onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digest Frequency
                </label>
                <select
                  value={settings.digestFrequency || 'WEEKLY'}
                  onChange={(e) => updateSettings({ digestFrequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="NONE">None</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Audit Completions</div>
                  <div className="text-sm text-gray-600">Notify when audits complete</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnComplete !== false}
                  onChange={(e) => updateSettings({ notifyOnComplete: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Status Changes</div>
                  <div className="text-sm text-gray-600">Notify on status updates</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnStatusChange !== false}
                  onChange={(e) => updateSettings({ notifyOnStatusChange: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <button
                onClick={sendTestEmail}
                disabled={sendingTestEmail}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
              >
                {sendingTestEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Test Email
                  </>
                )}
              </button>
            </div>
          </SettingsSection>

          {/* Report Branding */}
          <SettingsSection
            title="Report Branding"
            description="Customize how reports look"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName || ''}
                    onChange={(e) => updateSettings({ companyName: e.target.value })}
                    placeholder="Your Company Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-all font-medium flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, or SVG. Max 2MB.</p>
                </div>

                <ColorPicker
                  label="Primary Brand Color"
                  value={settings.brandPrimaryColor || null}
                  onChange={(value) => updateSettings({ brandPrimaryColor: value })}
                  helpText="Main color for headers and accents"
                />

                <ColorPicker
                  label="Secondary Brand Color"
                  value={settings.brandSecondaryColor || null}
                  onChange={(value) => updateSettings({ brandSecondaryColor: value })}
                  helpText="Secondary color for highlights"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Footer Text
                  </label>
                  <textarea
                    value={settings.reportFooterText || ''}
                    onChange={(e) => updateSettings({ reportFooterText: e.target.value })}
                    placeholder="Powered by Your Company"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <BrandPreviewCard
                  companyName={settings.companyName}
                  logoUrl={settings.companyLogo}
                  primaryColor={settings.brandPrimaryColor}
                  secondaryColor={settings.brandSecondaryColor}
                />
              </div>
            </div>
          </SettingsSection>

          {/* Export Preferences */}
          <SettingsSection
            title="Export Preferences"
            description="Set default export options"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['PDF', 'EXCEL', 'JSON'].map((format) => (
                    <button
                      key={format}
                      onClick={() => updateSettings({ defaultExportFormat: format as 'PDF' | 'EXCEL' | 'JSON' })}
                      className={`
                        px-4 py-3 rounded-lg border-2 transition-all font-medium
                        ${
                          settings.defaultExportFormat === format
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Include Screenshots</div>
                  <div className="text-sm text-gray-600">Add screenshots to exports</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.includeScreenshots !== false}
                  onChange={(e) => updateSettings({ includeScreenshots: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Include Claude Analysis</div>
                  <div className="text-sm text-gray-600">Add AI insights to exports</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.includeClaudeAnalysis !== false}
                  onChange={(e) => updateSettings({ includeClaudeAnalysis: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </SettingsSection>

          {/* UI Preferences */}
          <SettingsSection
            title="UI Preferences"
            description="Customize your interface"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <ThemeSelector
                  value={settings.theme || 'LIGHT'}
                  onChange={(value) => updateSettings({ theme: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default View Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'GRID', label: 'Grid View' },
                    { value: 'TABLE', label: 'Table View' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSettings({ defaultView: option.value as 'GRID' | 'TABLE' })}
                      className={`
                        px-4 py-3 rounded-lg border-2 transition-all font-medium
                        ${
                          settings.defaultView === option.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items Per Page: {settings.itemsPerPage || 12}
                </label>
                <input
                  type="range"
                  min="6"
                  max="48"
                  step="6"
                  value={settings.itemsPerPage || 12}
                  onChange={(e) => updateSettings({ itemsPerPage: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>6</span>
                  <span>12</span>
                  <span>24</span>
                  <span>48</span>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Save Indicator */}
        {saving && (
          <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideUp">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}
