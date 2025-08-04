import React from 'react';
import { MapPin, Calendar, DollarSign, ExternalLink, Clock, CheckCircle, XCircle, Pause } from 'lucide-react';
import { College } from '../types';

interface CollegeCardProps {
  college: College;
  onClick: () => void;
  onRemove?: () => void;
}

export default function CollegeCard({ college, onClick, onRemove }: CollegeCardProps) {
  const getStatusIcon = (status: College['status']) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'waitlisted':
        return <Pause className="w-4 h-4 text-yellow-400" />;
      case 'admitted':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: College['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-900/30 text-green-400';
      case 'rejected':
        return 'bg-red-900/30 text-red-400';
      case 'waitlisted':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'admitted':
        return 'bg-green-900/30 text-green-400';
      case 'in-progress':
        return 'bg-blue-900/30 text-blue-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Passed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      onClick={onClick}
      className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 hover:bg-gray-750 transition-all duration-200 cursor-pointer group relative backdrop-blur-sm bg-opacity-80"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
            {college.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
            <MapPin className="w-4 h-4" />
            {college.location}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(college.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(college.status)}`}>
            {college.status.charAt(0).toUpperCase() + college.status.slice(1).replace('-', ' ')}
          </span>
          {onRemove && (
            <button
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className="ml-2 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors border border-red-500/30 bg-red-900/20"
              title="Remove college"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>Deadline: {formatDeadline(college.applicationDeadline)}</span>
          </div>
          {college.earlyDeadline && (
            <div className="text-xs text-blue-400 font-medium">
              Early: {formatDeadline(college.earlyDeadline)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-300">
          <DollarSign className="w-4 h-4" />
          <span>Fee: ${college.applicationFee}</span>
        </div>

        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-gray-400" />
          <a 
            href={college.portalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Application Portal
          </a>
        </div>

        {college.scholarships.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-400">Scholarships: </span>
            <span className="text-green-400 font-medium">
              {college.scholarships.length} available
            </span>
          </div>
        )}

        {college.notes && (
          <div className="text-sm text-gray-300 bg-gray-700/50 p-2 rounded border-l-2 border-gray-600">
            {college.notes}
          </div>
        )}
      </div>
    </div>
  );
}