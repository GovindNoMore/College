import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import AIAssistant from './components/AIAssistant';
import CollegeCard from './components/CollegeCard';
import CollegeModal from './components/CollegeModal';
import AddCollegeModal from './components/AddCollegeModal';
import TaskTracker from './components/TaskTracker';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import Onboarding from './components/Onboarding';
import ProfileModal from './components/ProfileModal';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { defaultTaskColumns, mockColleges, mockApplicationTasks } from './data/mockData';
import { College, TaskColumn, ApplicationTask, UserProfile } from './types';

// Custom hooks for better state management
const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, value]);

  return [value, setStoredValue] as const;
};

function App() {
  // Enhanced state management with proper error handling
  const [activeView, setActiveView] = useState<string>('colleges');
  const [colleges, setColleges] = useLocalStorage<College[]>('colleges', mockColleges);
  const [taskColumns, setTaskColumns] = useLocalStorage<TaskColumn[]>('taskColumns', defaultTaskColumns);
  const [applicationTasks, setApplicationTasks] = useLocalStorage<ApplicationTask[]>('applicationTasks', mockApplicationTasks);
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  
  // Modal states
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!profile);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized values for better performance
  const collegeStats = useMemo(() => ({
    total: colleges.length,
    submitted: colleges.filter(c => c.status === 'submitted').length,
    admitted: colleges.filter(c => c.status === 'admitted').length,
    inProgress: colleges.filter(c => c.status === 'in-progress').length,
  }), [colleges]);

  // Enhanced college modal event handler
  useEffect(() => {
    const handleOpenCollegeModal = (event: CustomEvent) => {
      const collegeName = event.detail?.name;
      if (collegeName) {
        const college = colleges.find(c => 
          c.name.toLowerCase().includes(collegeName.toLowerCase())
        );
        if (college) {
          setSelectedCollege(college);
        } else {
          setError(`College "${collegeName}" not found`);
        }
      }
    };

    window.addEventListener('openCollegeModal', handleOpenCollegeModal as EventListener);
    return () => {
      window.removeEventListener('openCollegeModal', handleOpenCollegeModal as EventListener);
    };
  }, [colleges]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Enhanced onboarding completion
  const handleOnboardingComplete = useCallback(async (profileData: any) => {
    try {
      setIsLoading(true);
      const userProfile: UserProfile = {
        name: profileData.name?.trim() || 'User',
        email: profileData.email?.trim() || '',
        grade: parseInt(profileData.grade) || 12,
        subjects: profileData.subjects || [],
        resume: profileData.resume || {},
        preferences: {
          notifications: true,
          autoSync: true,
          theme: 'dark'
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      setProfile(userProfile);
      setShowOnboarding(false);
      
      // Initialize with sample colleges if none exist
      if (colleges.length === 0) {
        setColleges(mockColleges);
        setApplicationTasks(mockApplicationTasks);
      }
    } catch (error) {
      setError('Failed to complete onboarding. Please try again.');
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [colleges.length, setColleges, setApplicationTasks, setProfile]);

  // Enhanced profile save
  const handleSaveProfile = useCallback(async (profileData: UserProfile) => {
    try {
      setIsLoading(true);
      const updatedProfile = {
        ...profileData,
        lastUpdated: new Date().toISOString()
      };
      setProfile(updatedProfile);
      setShowProfileModal(false);
    } catch (error) {
      setError('Failed to save profile. Please try again.');
      console.error('Profile save error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setProfile]);

  // Enhanced college addition with validation
  const handleAddCollege = useCallback(async (collegeData: Omit<College, 'id'>) => {
    try {
      setIsLoading(true);
      
      // Validate college data
      if (!collegeData.name?.trim()) {
        throw new Error('College name is required');
      }
      
      if (!collegeData.applicationDeadline) {
        throw new Error('Application deadline is required');
      }

      // Check for duplicates
      const existingCollege = colleges.find(c => 
        c.name.toLowerCase() === collegeData.name.toLowerCase()
      );
      
      if (existingCollege) {
        throw new Error('This college is already in your list');
      }

      const newCollege: College = {
        ...collegeData,
        id: `college_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        addedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      setColleges(prev => [...prev, newCollege]);
      
      // Add corresponding task row with all required fields
      const newTask: ApplicationTask = {
        collegeId: newCollege.id,
        college: newCollege.name,
        essays: false,
        recommendations: '0/3',
        transcripts: false,
        testScores: false,
        applicationFee: false,
        submitted: false,
        interviewScheduled: false,
        admissionResult: 'Pending',
        createdAt: new Date().toISOString()
      };
      
      setApplicationTasks(prev => [...prev, newTask]);
      setShowAddModal(false);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add college';
      setError(message);
      console.error('Add college error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [colleges, setColleges, setApplicationTasks]);

  // Enhanced college update with sync
  const handleUpdateCollege = useCallback(async (updates: Partial<College> & { id: string }) => {
    try {
      setIsLoading(true);
      
      const updatedColleges = colleges.map(college => 
        college.id === updates.id 
          ? { ...college, ...updates, lastUpdated: new Date().toISOString() }
          : college
      );
      
      setColleges(updatedColleges);
      
      // Update corresponding task if college name changed
      if (updates.name) {
        const updatedTasks = applicationTasks.map(task =>
          task.collegeId === updates.id 
            ? { ...task, college: updates.name }
            : task
        );
        setApplicationTasks(updatedTasks);
      }
      
      setSelectedCollege(null);
      
    } catch (error) {
      setError('Failed to update college. Please try again.');
      console.error('Update college error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [colleges, applicationTasks, setColleges, setApplicationTasks]);

  // Enhanced college removal with confirmation
  const handleRemoveCollege = useCallback(async (collegeId: string) => {
    try {
      const college = colleges.find(c => c.id === collegeId);
      if (!college) {
        throw new Error('College not found');
      }

      const confirmed = window.confirm(
        `Are you sure you want to remove ${college.name}? This will also remove all associated tasks and cannot be undone.`
      );
      
      if (!confirmed) return;

      setIsLoading(true);
      setColleges(prev => prev.filter(c => c.id !== collegeId));
      setApplicationTasks(prev => prev.filter(task => task.collegeId !== collegeId));
      setSelectedCollege(null);
      
    } catch (error) {
      setError('Failed to remove college. Please try again.');
      console.error('Remove college error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [colleges, setColleges, setApplicationTasks]);

  // Enhanced main content renderer with error boundaries
  const renderMainContent = () => {
    const commonProps = {
      colleges,
      tasks: applicationTasks,
      onUpdateCollege: handleUpdateCollege,
      onRemoveCollege: handleRemoveCollege,
      isLoading
    };

    switch (activeView) {
      case 'colleges':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">My Colleges</h1>
                <p className="text-gray-300 mt-2">
                  Track your college applications and requirements
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span>{collegeStats.total} total</span>
                  <span>{collegeStats.inProgress} in progress</span>
                  <span>{collegeStats.submitted} submitted</span>
                  {collegeStats.admitted > 0 && (
                    <span className="text-green-400">{collegeStats.admitted} admitted</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add College
              </button>
            </div>
            
            {colleges.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-800/50 rounded-2xl p-12 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-white mb-4">No colleges added yet</h3>
                  <p className="text-gray-400 mb-6">Start by adding your first college to track your applications</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    Add Your First College
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {colleges.map(college => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    onClick={() => setSelectedCollege(college)}
                    onRemove={() => handleRemoveCollege(college.id)}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </div>
        );
        
      case 'tracker':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Progress Tracker</h1>
              <p className="text-gray-300 mt-2">Monitor your application progress across all colleges</p>
            </div>
            <TaskTracker
              columns={taskColumns}
              tasks={applicationTasks}
              colleges={colleges}
              onUpdateColumns={setTaskColumns}
              onUpdateTasks={setApplicationTasks}
              isLoading={isLoading}
            />
          </div>
        );
        
      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
              <p className="text-gray-300 mt-2">Insights into your application journey</p>
            </div>
            <AnalyticsView {...commonProps} />
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-300 mt-2">Customize your application tracking experience</p>
            </div>
            <SettingsView 
              profile={profile}
              onUpdateProfile={setProfile}
              colleges={colleges}
              tasks={applicationTasks}
              onExportData={() => {/* Export logic */}}
              onImportData={() => {/* Import logic */}}
            />
          </div>
        );
        
      default:
        return (
          <div className="text-center py-16">
            <div className="bg-gray-800/50 rounded-2xl p-12 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4">View not found</h3>
              <p className="text-gray-400">Please select a valid view from the sidebar</p>
            </div>
          </div>
        );
    }
  };

  // Show loading spinner during onboarding completion
  if (isLoading && showOnboarding) {
    return <LoadingSpinner message="Setting up your profile..." />;
  }

  // Show onboarding if no profile exists
  if (showOnboarding) {
    return (
      <ErrorBoundary>
        <Onboarding onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-900 relative">
        {/* Error notification */}
        {error && (
          <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-white hover:text-red-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onAddCollege={() => setShowAddModal(true)}
          userProfile={profile}
          onEditProfile={() => setShowProfileModal(true)}
          collegeStats={collegeStats}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderMainContent()}
          </div>
        </main>
        
        <AIAssistant
          colleges={colleges}
          profile={profile}
          onCollegeUpdate={handleUpdateCollege}
          onAddCollege={(data) => setShowAddModal(true)}
        />
        
        {/* Modals */}
        {selectedCollege && (
          <CollegeModal
            college={selectedCollege}
            isOpen={!!selectedCollege}
            onClose={() => setSelectedCollege(null)}
            onUpdate={(updates) => handleUpdateCollege({ ...updates, id: selectedCollege.id })}
            onRemove={() => handleRemoveCollege(selectedCollege.id)}
            isLoading={isLoading}
          />
        )}
        
        <AddCollegeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCollege}
          existingColleges={colleges}
          isLoading={isLoading}
        />
        
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
          initialProfile={profile || undefined}
          isLoading={isLoading}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
