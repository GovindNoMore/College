import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { College } from '../types';
import { aiService } from '../services/aiService';

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (college: Omit<College, 'id'>) => void;
}

interface UserProfile {
  grade: string;
  country: string;
  gpa: string;
  extracurriculars: string;
  name?: string;
  email?: string;
}

export default function AddCollegeModal({ isOpen, onClose, onAdd }: AddCollegeModalProps) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : {
        grade: '',
        country: '',
        gpa: '',
        extracurriculars: '',
        name: '',
        email: ''
      };
    } catch {
      return {
        grade: '',
        country: '',
        gpa: '',
        extracurriculars: '',
        name: '',
        email: ''
      };
    }
  });

  const [profileStep, setProfileStep] = useState(!profile.grade || !profile.country || !profile.gpa);
  const [collegeName, setCollegeName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    applicationDeadline: '',
    earlyDeadline: '',
    applicationFee: 0,
    portalLink: '',
    notes: '',
    requirements: {
      essays: [] as string[],
      testScores: [] as string[],
      documents: [] as string[]
    },
    scholarships: [] as string[]
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Save profile to localStorage when changed
  useEffect(() => {
    if (!profileStep && profile.grade && profile.country && profile.gpa) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  }, [profile, profileStep]);

  // Load search history
  useEffect(() => {
    try {
      const history = localStorage.getItem('collegeSearchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history).slice(0, 5)); // Keep last 5 searches
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  const saveSearchHistory = (searchTerm: string) => {
    try {
      const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('collegeSearchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!profile.grade.trim()) errors.grade = 'Grade is required';
    if (!profile.country.trim()) errors.country = 'Country is required';
    if (!profile.gpa.trim()) errors.gpa = 'GPA/Grades is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateManualForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = 'College name is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.applicationDeadline) errors.applicationDeadline = 'Application deadline is required';
    if (formData.applicationFee < 0) errors.applicationFee = 'Application fee cannot be negative';
    if (formData.portalLink && !isValidUrl(formData.portalLink)) {
      errors.portalLink = 'Please enter a valid URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSearch = async () => {
    if (!collegeName.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setSearchError(null);
    
    try {
      const userProfile = `User profile:\n- Grade: ${profile.grade}\n- Country: ${profile.country}\n- GPA: ${profile.gpa}\n- Extracurriculars: ${profile.extracurriculars}`;
      
      const aiPrompt = `${userProfile}\n\nProvide detailed information for: ${collegeName}. 
      Focus on information relevant to a ${profile.grade} student from ${profile.country} with GPA ${profile.gpa}.
      
      Respond with JSON containing:
      {
        "name": "Official college name",
        "location": "City, State/Country",
        "applicationDeadline": "YYYY-MM-DD format for regular deadline",
        "earlyDeadline": "YYYY-MM-DD format for early deadline (if applicable)",
        "applicationFee": number,
        "portalLink": "Official application portal URL",
        "requirements": {
          "essays": ["List of essay requirements"],
          "testScores": ["Required test scores like SAT, ACT, etc."],
          "documents": ["Transcripts, recommendations, etc."]
        },
        "scholarships": ["Available scholarship names"],
        "notes": "Any additional relevant information"
      }
      
      Only include deadlines and requirements relevant for this student's profile.`;

      const aiResponse = await Promise.race([
        aiService.processQuery(aiPrompt, [], true),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000))
      ]);

      let result = null;
      const response = aiResponse as { content: string };
      let rawContent = response.content;

      // Try to parse JSON from response
      try {
        result = JSON.parse(rawContent);
      } catch (e) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[1]);
          } catch (parseError) {
            console.error('Failed to parse extracted JSON:', parseError);
          }
        } else {
          // Try to find any JSON object in the response
          const match = rawContent.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              result = JSON.parse(match[0]);
            } catch (parseError) {
              console.error('Failed to parse found JSON:', parseError);
            }
          }
        }
      }

      if (result && result.name) {
        setSearchResults([result]);
        saveSearchHistory(collegeName);
      } else {
        setSearchError('Could not find structured college information. Please try a different search term or add the college manually.');
        console.warn('Raw AI response:', rawContent);
      }
    } catch (error) {
      console.error('Search failed:', error);
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          setSearchError('Search timed out. Please try again with a more specific college name.');
        } else if (error.message.includes('API key')) {
          setSearchError('AI service configuration issue. Please check your API keys or add the college manually.');
        } else {
          setSearchError('Search failed. Please check your internet connection and try again, or add the college manually.');
        }
      } else {
        setSearchError('An unexpected error occurred. Please try again or add the college manually.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: any) => {
    const newCollege: Omit<College, 'id'> = {
      name: result.name || '',
      location: result.location || '',
      applicationDeadline: result.applicationDeadline || '',
      earlyDeadline: result.earlyDeadline || undefined,
      applicationFee: typeof result.applicationFee === 'number' ? result.applicationFee : 
                     (typeof result.applicationFee === 'string' ? parseInt(result.applicationFee) || 0 : 0),
      portalLink: result.portalLink || '',
      scholarships: Array.isArray(result.scholarships) ? result.scholarships : 
                   (typeof result.scholarships === 'string' ? result.scholarships.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      requirements: {
        essays: Array.isArray(result.requirements?.essays) ? result.requirements.essays : 
               (typeof result.requirements?.essays === 'string' ? result.requirements.essays.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        testScores: Array.isArray(result.requirements?.testScores) ? result.requirements.testScores : 
                   (typeof result.requirements?.testScores === 'string' ? result.requirements.testScores.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        documents: Array.isArray(result.requirements?.documents) ? result.requirements.documents : 
                  (typeof result.requirements?.documents === 'string' ? result.requirements.documents.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      },
      status: 'not-started',
      notes: result.notes || '',
      addedDate: new Date().toISOString()
    };

    onAdd(newCollege);
    handleClose();
  };

  const handleManualAdd = () => {
    if (!validateManualForm()) return;

    const newCollege: Omit<College, 'id'> = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      applicationDeadline: formData.applicationDeadline,
      earlyDeadline: formData.earlyDeadline || undefined,
      applicationFee: formData.applicationFee,
      portalLink: formData.portalLink.trim(),
      scholarships: formData.scholarships,
      requirements: formData.requirements,
      status: 'not-started',
      notes: formData.notes.trim(),
      addedDate: new Date().toISOString()
    };
    
    onAdd(newCollege);
    handleClose();
  };

  const handleClose = () => {
    setCollegeName('');
    setSearchResults([]);
    setSearchError(null);
    setManualEntry(false);
    setShowAdvancedSearch(false);
    setValidationErrors({});
    setFormData({
      name: '',
      location: '',
      applicationDeadline: '',
      earlyDeadline: '',
      applicationFee: 0,
      portalLink: '',
      notes: '',
      requirements: {
        essays: [],
        testScores: [],
        documents: []
      },
      scholarships: []
    });
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching && collegeName.trim()) {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800/90 backdrop-blur-sm sticky top-0">
          <h2 className="text-xl font-semibold text-white">Add College</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {profileStep ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Tell us about yourself</h3>
                <p className="text-sm text-gray-400">This helps us find relevant deadlines and requirements</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Grade <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.grade}
                    onChange={e => setProfile({ ...profile, grade: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent ${
                      validationErrors.grade ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="e.g., 11, 12, College Freshman"
                  />
                  {validationErrors.grade && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.grade}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={e => setProfile({ ...profile, country: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent ${
                      validationErrors.country ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Your country"
                  />
                  {validationErrors.country && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.country}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GPA / Grades <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.gpa}
                  onChange={e => setProfile({ ...profile, gpa: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent ${
                    validationErrors.gpa ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g., 3.8/4.0, 90%, A-"
                />
                {validationErrors.gpa && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.gpa}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Extracurriculars (optional)
                </label>
                <textarea
                  value={profile.extracurriculars}
                  onChange={e => setProfile({ ...profile, extracurriculars: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  placeholder="Clubs, sports, leadership, volunteer work, etc."
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    if (validateProfile()) {
                      setProfileStep(false);
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue
                </button>
              </div>
            </div>

          ) : !manualEntry ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Search for a college</h3>
                  <p className="text-sm text-gray-400">AI will find relevant information based on your profile</p>
                </div>
                <button
                  onClick={() => setProfileStep(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  Update Profile
                </button>
              </div>

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Recent searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => setCollegeName(term)}
                        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Harvard University, MIT, Stanford"
                  className="flex-1 px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent placeholder-gray-400"
                  disabled={isSearching}
                />
                <button
                  onClick={handleSearch}
                  disabled={!collegeName.trim() || isSearching}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
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

              {searchError && (
                <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-300">
                    {searchError}
                  </div>
                </div>
              )}

              {searchResults.length > 0 && !searchError && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h4 className="font-medium text-white">College Found</h4>
                  </div>
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectResult(result)}
                      className="p-4 border border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-900/10 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                          {result.name}
                        </h5>
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                          Click to add
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{result.location}</p>
                      
                      {result.applicationDeadline && (
                        <div className="text-xs text-gray-400 mb-1">
                          Deadline: {new Date(result.applicationDeadline).toLocaleDateString()}
                        </div>
                      )}
                      
                      {result.applicationFee && (
                        <div className="text-xs text-gray-400">
                          Application Fee: ${result.applicationFee}
                        </div>
                      )}
                      
                      {result.scholarships && result.scholarships.length > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          {result.scholarships.length} scholarship{result.scholarships.length > 1 ? 's' : ''} available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => setManualEntry(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Can't find your college? Add manually →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Add College Manually</h3>
                <button
                  onClick={() => setManualEntry(false)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ← Back to search
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    College Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="University name"
                  />
                  {validationErrors.name && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent ${
                      validationErrors.location ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="City, State/Country"
                  />
                  {validationErrors.location && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.location}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Application Deadline <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent ${
                      validationErrors.applicationDeadline ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {validationErrors.applicationDeadline && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.applicationDeadline}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Early Deadline</label>
                  <input
                    type="date"
                    value={formData.earlyDeadline}
                    onChange={(e) => setFormData({...formData, earlyDeadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Application Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.applicationFee}
                    onChange={(e) => setFormData({...formData, applicationFee: parseInt(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent ${
                      validationErrors.applicationFee ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="0"
                  />
                  {validationErrors.applicationFee && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.applicationFee}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Portal Link</label>
                  <input
                    type="url"
                    value={formData.portalLink}
                    onChange={(e) => setFormData({...formData, portalLink: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent ${
                      validationErrors.portalLink ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="https://..."
                  />
                  {validationErrors.portalLink && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.portalLink}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                  placeholder="Any additional notes about this college..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualAdd}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add College
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
