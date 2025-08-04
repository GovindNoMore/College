import React, { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { College } from '../types';
import { aiService } from '../services/aiService';

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (college: Omit<College, 'id'>) => void;
}

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (college: Omit<College, 'id'>) => void;
}

export default function AddCollegeModal({ isOpen, onClose, onAdd }: AddCollegeModalProps) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : {
        grade: '',
        country: '',
        gpa: '',
        extracurriculars: '',
      };
    } catch {
      return {
        grade: '',
        country: '',
        gpa: '',
        extracurriculars: '',
      };
    }
  });
  const [profileStep, setProfileStep] = useState(!profile.grade || !profile.country || !profile.gpa);
  const [collegeName, setCollegeName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    applicationDeadline: '',
    earlyDeadline: '',
    applicationFee: 0,
    portalLink: '',
    notes: ''
  });

  if (!isOpen) return null;

  // Save profile to localStorage when changed
  React.useEffect(() => {
    if (!profileStep) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  }, [profile, profileStep]);

  const handleSearch = async () => {
    if (!collegeName.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    setSearchError(null);
    try {
      const userProfile = `User profile:\n- Grade: ${profile.grade}\n- Country: ${profile.country}\n- GPA: ${profile.gpa}\n- Extracurriculars: ${profile.extracurriculars}`;
      const aiPrompt = `${userProfile}\n\nNow, provide detailed and structured information for the college: ${collegeName}. Only show deadlines and requirements that are relevant for a student in this grade, country, and academic background. Include location, deadlines, application fee, portal link, requirements (essays, test scores, documents), and scholarships. Respond in JSON format only. Always include a 'name' field. If a deadline is not relevant for this user, do not include it.`;
      const aiResponse = await Promise.race([
        aiService.processQuery(
          aiPrompt,
          [],
          true
        ),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 15000))
      ]);
      let result = null;
      const response = aiResponse as { content: string };
      let rawContent = response.content;
      try {
        result = JSON.parse(rawContent);
      } catch (e) {
        const match = rawContent.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            result = JSON.parse(match[0]);
          } catch {
            // ignore
          }
        }
      }
      if (result && result.name) {
        setSearchResults([result]);
        // Auto-add if valid result
        handleSelectResult(result);
      } else {
        setSearchError('No structured data found.\nRaw AI response: ' + rawContent + '\nPlease try a different college or add manually.');
      }
    } catch (e) {
      setSearchError('Could not fetch college info. Please check your internet/API key or try again.');
    }
    setIsSearching(false);
  };

  const handleSelectResult = (result: any) => {
    // Sanitize and fill missing fields for College type
    const newCollege: Omit<College, 'id'> = {
      name: result.name || '',
      location: result.location || '',
      applicationDeadline: result.applicationDeadline || '',
      earlyDeadline: result.earlyDeadline || '',
      applicationFee: typeof result.applicationFee === 'number' ? result.applicationFee : parseInt(result.applicationFee) || 0,
      portalLink: result.portalLink || '',
      scholarships: Array.isArray(result.scholarships) ? result.scholarships : (typeof result.scholarships === 'string' ? result.scholarships.split(',').map((s: string) => s.trim()) : []),
      requirements: {
        essays: Array.isArray(result.requirements?.essays) ? result.requirements.essays : (typeof result.requirements?.essays === 'string' ? result.requirements.essays.split(',').map((s: string) => s.trim()) : []),
        testScores: Array.isArray(result.requirements?.testScores) ? result.requirements.testScores : (typeof result.requirements?.testScores === 'string' ? result.requirements?.testScores.split(',').map((s: string) => s.trim()) : []),
        documents: Array.isArray(result.requirements?.documents) ? result.requirements.documents : (typeof result.requirements?.documents === 'string' ? result.requirements?.documents.split(',').map((s: string) => s.trim()) : []),
      },
      status: 'not-started',
      notes: '',
      addedDate: new Date().toISOString()
    };

    onAdd(newCollege);
    // Optionally, open the CollegeModal after adding (requires parent support)
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('openCollegeModal', { detail: { name: newCollege.name } }));
    }
    handleClose();
  };

  const handleManualAdd = () => {
    const newCollege: Omit<College, 'id'> = {
      name: formData.name,
      location: formData.location,
      applicationDeadline: formData.applicationDeadline,
      earlyDeadline: formData.earlyDeadline || undefined,
      applicationFee: formData.applicationFee,
      portalLink: formData.portalLink,
      scholarships: [],
      requirements: {
        essays: [],
        testScores: [],
        documents: []
      },
      status: 'not-started',
      notes: formData.notes,
      addedDate: new Date().toISOString()
    };
    onAdd(newCollege);
    handleClose();
  };

  const handleClose = () => {
    setCollegeName('');
    setSearchResults([]);
    setManualEntry(false);
    setFormData({
      name: '',
      location: '',
      applicationDeadline: '',
      earlyDeadline: '',
      applicationFee: 0,
      portalLink: '',
      notes: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add College</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {profileStep ? (
            <div className="space-y-4">
              <h3 className="font-medium text-white">Tell us about yourself</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Grade (e.g., 11, 12, College Freshman)</label>
                <input
                  type="text"
                  value={profile.grade}
                  onChange={e => setProfile({ ...profile, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  placeholder="Your current grade"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={e => setProfile({ ...profile, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  placeholder="Your country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">GPA / Grades</label>
                <input
                  type="text"
                  value={profile.gpa}
                  onChange={e => setProfile({ ...profile, gpa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  placeholder="e.g., 3.8/4.0, 90%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Extracurriculars (optional)</label>
                <textarea
                  value={profile.extracurriculars}
                  onChange={e => setProfile({ ...profile, extracurriculars: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  placeholder="Clubs, sports, leadership, etc."
                  rows={2}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setProfileStep(false)}
                  disabled={!profile.grade.trim() || !profile.country.trim() || !profile.gpa.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>

          ) : !manualEntry ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search for a college
                </label>
                <button
                  onClick={() => setProfileStep(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Change Profile
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., Harvard University"
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={!collegeName.trim() || isSearching}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                AI will automatically find deadlines and requirements based on your profile
              </p>

              {searchError && (
                <div className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded p-2 mt-2">{searchError}</div>
              )}
              {searchResults.length > 0 && !searchError && (
                <div className="space-y-2">
                  <h3 className="font-medium text-white">Search Results</h3>
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectResult(result)}
                      className="p-3 border border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-900/20 cursor-pointer transition-colors"
                    >
                      <h4 className="font-medium text-white">{result.name}</h4>
                      <p className="text-sm text-gray-300">{result.location}</p>
                      <p className="text-xs text-blue-400 mt-1">Click to add with auto-filled data</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => setManualEntry(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Can't find your college? Add manually
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">Manual Entry</h3>
                <button
                  onClick={() => setManualEntry(false)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Back to search
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">College Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Early Deadline</label>
                    <input
                      type="date"
                      value={formData.earlyDeadline}
                      onChange={(e) => setFormData({...formData, earlyDeadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Application Fee ($)</label>
                    <input
                      type="number"
                      value={formData.applicationFee}
                      onChange={(e) => setFormData({...formData, applicationFee: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Portal Link</label>
                    <input
                      type="url"
                      value={formData.portalLink}
                      onChange={(e) => setFormData({...formData, portalLink: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                    placeholder="Any notes about this college..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualAdd}
                    disabled={!formData.name.trim() || !formData.applicationDeadline}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Add College
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}