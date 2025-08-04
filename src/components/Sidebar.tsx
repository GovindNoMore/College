import React from 'react';
import { GraduationCap, Table, BarChart3, Settings, Plus, User } from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onAddCollege: () => void;
  userProfile: UserProfile | null;
  onEditProfile: () => void;
}

export default function Sidebar({ activeView, onViewChange, onAddCollege, userProfile, onEditProfile }: SidebarProps) {
  const menuItems = [
    { id: 'colleges', label: 'Colleges', icon: GraduationCap },
    { id: 'tracker', label: 'Progress Tracker', icon: Table },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      {/* Profile Section */}
      <div className="p-6 border-b border-gray-700">
        {userProfile ? (
          <div className="flex flex-col items-start space-y-2">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-medium truncate">{userProfile.name}</h2>
                <p className="text-sm text-gray-400 truncate">Grade {userProfile.grade}</p>
              </div>
              <button
                onClick={onEditProfile}
                className="text-gray-400 hover:text-white transition-colors"
                title="Edit Profile"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onEditProfile}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <User className="w-5 h-5" />
            Set Up Profile
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onAddCollege}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add College
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          Track your college journey
        </div>
      </div>
    </div>
  );
}