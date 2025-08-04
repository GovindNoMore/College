import React, { useState } from 'react';
import { X, Calendar, DollarSign, ExternalLink, FileText, Award, CheckCircle } from 'lucide-react';
import { College } from '../types';

interface CollegeModalProps {
  college: College;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<College>) => void;
  onRemove?: () => void;
}

export default function CollegeModal({ college, isOpen, onClose, onUpdate, onRemove }: CollegeModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(college);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData(college);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{college.name}</h2>
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Edit
                </button>
                {onRemove && (
                  <button
                    onClick={() => { if(window.confirm('Are you sure you want to remove this college?')) onRemove(); }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ml-2"
                  >
                    Remove
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{college.location}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              {editMode ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as College['status']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="admitted">Admitted</option>
                  <option value="rejected">Rejected</option>
                  <option value="waitlisted">Waitlisted</option>
                </select>
              ) : (
                <p className="text-gray-900 capitalize">{college.status.replace('-', ' ')}</p>
              )}
            </div>
          </div>

          {/* Deadlines */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Important Dates
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                {editMode ? (
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{new Date(college.applicationDeadline).toLocaleDateString()}</p>
                )}
              </div>
              {(college.earlyDeadline || editMode) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Early Deadline</label>
                  {editMode ? (
                    <input
                      type="date"
                      value={formData.earlyDeadline || ''}
                      onChange={(e) => setFormData({...formData, earlyDeadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{college.earlyDeadline ? new Date(college.earlyDeadline).toLocaleDateString() : 'N/A'}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Application Fee
              </h3>
              {editMode ? (
                <input
                  type="number"
                  value={formData.applicationFee}
                  onChange={(e) => setFormData({...formData, applicationFee: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-2xl font-bold text-gray-900">${college.applicationFee}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                Portal
              </h3>
              {editMode ? (
                <input
                  type="url"
                  value={formData.portalLink}
                  onChange={(e) => setFormData({...formData, portalLink: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <a
                  href={college.portalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                >
                  Visit Portal <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Essays</h4>
                <ul className="space-y-1">
                  {college.requirements.essays.map((essay, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {essay}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Test Scores</h4>
                <ul className="space-y-1">
                  {college.requirements.testScores.map((test, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {test}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Documents</h4>
                <ul className="space-y-1">
                  {college.requirements.documents.map((doc, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Scholarships */}
          {college.scholarships.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Available Scholarships
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {college.scholarships.map((scholarship, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                    <p className="font-medium text-yellow-800">{scholarship}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
            {editMode ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add your notes about this college..."
              />
            ) : (
              <p className="text-gray-600">{college.notes || 'No notes yet.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}