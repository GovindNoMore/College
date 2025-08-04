import React, { useState, useEffect } from 'react';
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
import { defaultTaskColumns, mockColleges, mockApplicationTasks } from './data/mockData';
import { College, TaskColumn, ApplicationTask, UserProfile } from './types';

function App() {
  const [activeView, setActiveView] = useState('colleges');
  // Load from localStorage or use mock data for first-time users
  const [colleges, setColleges] = useState<College[]>(() => {
    try {
      const saved = localStorage.getItem('colleges');
      if (saved) return JSON.parse(saved);
      return mockColleges;
    } catch {
      return mockColleges;
    }
  });
  const [taskColumns, setTaskColumns] = useState<TaskColumn[]>(defaultTaskColumns);
  const [applicationTasks, setApplicationTasks] = useState<ApplicationTask[]>(() => {
    try {
      const saved = localStorage.getItem('applicationTasks');
      if (saved) return JSON.parse(saved);
      return mockApplicationTasks;
    } catch {
      return mockApplicationTasks;
    }
  });
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  // Persist colleges and tasks to localStorage on change
  useEffect(() => {
    localStorage.setItem('colleges', JSON.stringify(colleges));
  }, [colleges]);
  useEffect(() => {
    localStorage.setItem('applicationTasks', JSON.stringify(applicationTasks));
  }, [applicationTasks]);
  const [showOnboarding, setShowOnboarding] = useState(!profile);

  // Listen for college modal events from AddCollegeModal
  useEffect(() => {
    const handleOpenCollegeModal = (event: CustomEvent) => {
      const collegeName = event.detail?.name;
      if (collegeName) {
        const college = colleges.find(c => c.name === collegeName);
        if (college) {
          setSelectedCollege(college);
        }
      }
    };

    window.addEventListener('openCollegeModal', handleOpenCollegeModal as EventListener);
    return () => {
      window.removeEventListener('openCollegeModal', handleOpenCollegeModal as EventListener);
    };
  }, [colleges]);

  const handleOnboardingComplete = (profileData: any) => {
    const userProfile: UserProfile = {
      name: profileData.name || 'User',
      email: profileData.email || '',
      grade: parseInt(profileData.grade) || 12,
      subjects: [],
      resume: {}
    };
    setProfile(userProfile);
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    setShowOnboarding(false);
  };

  const handleSaveProfile = (profileData: UserProfile) => {
    setProfile(profileData);
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setShowProfileModal(false);
  };

  const handleAddCollege = (collegeData: Omit<College, 'id'>) => {
    const newCollege: College = {
      ...collegeData,
      id: Date.now().toString()
    };
    setColleges(prev => [...prev, newCollege]);
    
    // Add corresponding task row
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
      admissionResult: 'Pending'
    };
    setApplicationTasks(prev => [...prev, newTask]);
  };

  const handleUpdateCollege = (updates: Partial<College> & { id: string }) => {
    setColleges(prev => prev.map(college => 
      college.id === updates.id ? { ...college, ...updates } : college
    ));
    
    // Update corresponding task if college name changed
    if (updates.name) {
      setApplicationTasks(prev => prev.map(task =>
        task.collegeId === updates.id ? { ...task, college: updates.name } : task
      ));
    }
    setSelectedCollege(null);
  };

  const handleRemoveCollege = (collegeId: string) => {
    setColleges(prev => prev.filter(college => college.id !== collegeId));
    setApplicationTasks(prev => prev.filter(task => task.collegeId !== collegeId));
    setSelectedCollege(null);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'colleges':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">My Colleges</h1>
                <p className="text-gray-300 mt-2">Track your college applications and requirements</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
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
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
            <AnalyticsView colleges={colleges} tasks={applicationTasks} />
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-300 mt-2">Customize your application tracking experience</p>
            </div>
            <SettingsView />
          </div>
        );
        
      default:
        return <div>View not found</div>;
    }
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onAddCollege={() => setShowAddModal(true)}
        userProfile={profile}
        onEditProfile={() => setShowProfileModal(true)}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderMainContent()}
        </div>
      </main>
      <AIAssistant
        colleges={colleges}
        onCollegeUpdate={handleUpdateCollege}
      />
      
      {selectedCollege && (
        <CollegeModal
          college={selectedCollege}
          isOpen={!!selectedCollege}
          onClose={() => setSelectedCollege(null)}
          onUpdate={(updates) => handleUpdateCollege({ ...updates, id: selectedCollege.id })}
          onRemove={() => handleRemoveCollege(selectedCollege.id)}
        />
      )}
      
      <AddCollegeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCollege}
      />
      
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleSaveProfile}
        initialProfile={profile || undefined}
      />
    </div>
  );
}

export default App;