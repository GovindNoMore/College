import { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface Subject {
  name: string;
  grade: string;
}

export interface UserProfile {
  name: string;
  email: string;
  grade: number;
  subjects: Subject[];
  resume: {
    text?: string;
    file?: File;
  };
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

export default function ProfileModal({ isOpen, onClose, onSave, initialProfile }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    name: '',
    email: '',
    grade: 9,
    subjects: [],
    resume: {}
  });
  const [newSubject, setNewSubject] = useState({ name: '', grade: '' });
  const [resumeText, setResumeText] = useState('');

  if (!isOpen) return null;
  // Fallback for blank modal: show loading or error if profile is missing
  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-lg shadow-xl border border-gray-700 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Profile Setup</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
          <div className="py-8 text-center text-gray-300">Profile not loaded. Please refresh and try again.</div>
        </div>
      </div>
    );
  }

  const handleAddSubject = () => {
    if (newSubject.name && newSubject.grade) {
      setProfile(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject]
      }));
      setNewSubject({ name: '', grade: '' });
    }
  };

  const handleRemoveSubject = (index: number) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfile(prev => ({
        ...prev,
        resume: { ...prev.resume, file }
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl shadow-xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Your Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Grade Level</label>
            <select
              value={profile.grade}
              onChange={e => setProfile(prev => ({ ...prev, grade: parseInt(e.target.value) }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              {[9, 10, 11, 12].map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subjects & Grades</label>
            <div className="space-y-2">
              {profile.subjects.map((subject, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="flex-1 text-white">{subject.name}: {subject.grade}</span>
                  <button
                    onClick={() => handleRemoveSubject(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-2">
              <input
                type="text"
                value={newSubject.name}
                onChange={e => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Subject name"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newSubject.grade}
                onChange={e => setNewSubject(prev => ({ ...prev, grade: e.target.value }))}
                placeholder="Grade"
                className="w-24 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Resume</label>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                />
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">Upload resume (PDF, DOC, DOCX)</span>
                </label>
              </div>
              <div>
                <textarea
                  value={resumeText}
                  onChange={e => {
                    setResumeText(e.target.value);
                    setProfile(prev => ({
                      ...prev,
                      resume: { ...prev.resume, text: e.target.value }
                    }));
                  }}
                  placeholder="Or paste your resume text here..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(profile)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
