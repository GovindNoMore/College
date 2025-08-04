import React, { useState } from 'react';

interface OnboardingProfile {
  grade: string;
  country: string;
  gpa: string;
  extracurriculars: string;
  name?: string;
  email?: string;
}

interface OnboardingProps {
  onComplete: (profile: OnboardingProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [profile, setProfile] = useState({
    grade: '',
    country: '',
    gpa: '',
    extracurriculars: '',
    name: '',
    email: ''
  });
  const [touched, setTouched] = useState(false);

  const isValid = profile.grade.trim() && profile.country.trim() && profile.gpa.trim();

  const handleContinue = () => {
    setTouched(true);
    if (!isValid) return;
    // Always provide a default name/email if not filled
    onComplete({
      ...profile,
      name: profile.name?.trim() || 'User',
      email: profile.email?.trim() || ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-green-100">
      <div className="bg-white/90 rounded-2xl shadow-xl p-10 w-full max-w-md flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-2">Welcome to CollegeTracker</h1>
        <p className="text-center text-gray-600 mb-4">Let's get to know you so we can personalize your experience.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400" placeholder="e.g., 12, College Freshman" value={profile.grade} onChange={e => setProfile({ ...profile, grade: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400" placeholder="Your country" value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GPA / Grades</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400" placeholder="e.g., 3.8/4.0, 90%" value={profile.gpa} onChange={e => setProfile({ ...profile, gpa: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extracurriculars (optional)</label>
            <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400" placeholder="Clubs, sports, leadership, etc." rows={2} value={profile.extracurriculars} onChange={e => setProfile({ ...profile, extracurriculars: e.target.value })} />
          </div>
        </div>
        {!isValid && touched && (
          <div className="text-red-500 text-sm text-center">Please fill in all required fields.</div>
        )}
        <button disabled={!isValid} onClick={handleContinue} className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-green-400 text-white font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-green-500 transition disabled:opacity-50">Continue</button>
      </div>
    </div>
  );
}
