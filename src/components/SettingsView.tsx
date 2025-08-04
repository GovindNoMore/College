import React, { useState } from 'react';
import { Bell, FolderSync as Sync, Download, Upload, Trash2, Save } from 'lucide-react';

export default function SettingsView() {
  const [notifications, setNotifications] = useState({
    deadlineReminders: true,
    weeklyDigest: true,
    statusUpdates: false
  });
  
  const [autoSync, setAutoSync] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);

  const handleExportData = () => {
    // Simulate data export
    const data = {
      colleges: 'College data...',
      tasks: 'Task data...',
      settings: 'Settings data...'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'college-tracker-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
        
        <div className="space-y-8">
          {/* Notifications */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notifications
            </h3>
            <div className="space-y-3 ml-7">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Deadline reminders</span>
                <input
                  type="checkbox"
                  checked={notifications.deadlineReminders}
                  onChange={(e) => setNotifications({...notifications, deadlineReminders: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Weekly progress digest</span>
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={(e) => setNotifications({...notifications, weeklyDigest: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Application status updates</span>
                <input
                  type="checkbox"
                  checked={notifications.statusUpdates}
                  onChange={(e) => setNotifications({...notifications, statusUpdates: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                />
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Remind me</span>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 day before</option>
                  <option value={3}>3 days before</option>
                  <option value={7}>1 week before</option>
                  <option value={14}>2 weeks before</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auto-sync */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sync className="w-5 h-5 text-green-600" />
              Automatic Updates
            </h3>
            <div className="space-y-3 ml-7">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-700">Auto-sync college information</span>
                  <p className="text-xs text-gray-500">Automatically update deadlines and requirements</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                />
              </label>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-600" />
              Data Management
            </h3>
            <div className="space-y-3 ml-7">
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export All Data
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                <Upload className="w-4 h-4" />
                Import Data
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}