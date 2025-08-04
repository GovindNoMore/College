import React from 'react';
import { Calendar, TrendingUp, Clock, CheckCircle, Award, Target } from 'lucide-react';
import { College, ApplicationTask } from '../types';

interface AnalyticsViewProps {
  colleges: College[];
  tasks: ApplicationTask[];
}

export default function AnalyticsView({ colleges, tasks }: AnalyticsViewProps) {
  // Defensive: ensure arrays are always defined
  colleges = Array.isArray(colleges) ? colleges : [];
  tasks = Array.isArray(tasks) ? tasks : [];

  const totalColleges = colleges.length;
  const submittedApplications = colleges.filter(c => c.status === 'submitted').length;
  const admittedColleges = colleges.filter(c => c.status === 'admitted').length;
  const rejectedColleges = colleges.filter(c => c.status === 'rejected').length;
  const waitlistedColleges = colleges.filter(c => c.status === 'waitlisted').length;

  const upcomingDeadlines = colleges
    .filter(c => c.applicationDeadline && new Date(c.applicationDeadline) > new Date() && c.status !== 'submitted')
    .sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime())
    .slice(0, 5);

  const totalFees = colleges.reduce((sum, college) => sum + (college.applicationFee || 0), 0);
  const completionRate = totalColleges > 0 ? (submittedApplications / totalColleges) * 100 : 0;

  const stats = [
    {
      label: 'Total Colleges',
      value: totalColleges,
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30'
    },
    {
      label: 'Applications Submitted',
      value: submittedApplications,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-900/30'
    },
    {
      label: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30'
    },
    {
      label: 'Total Application Fees',
      value: `$${totalFees}`,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  const statusData = [
    { label: 'In Progress', count: colleges.filter(c => c.status === 'in-progress').length, color: 'bg-blue-500' },
    { label: 'Not Started', count: colleges.filter(c => c.status === 'not-started').length, color: 'bg-gray-400' },
    { label: 'Submitted', count: submittedApplications, color: 'bg-green-500' },
    { label: 'Admitted', count: admittedColleges, color: 'bg-green-600' },
    { label: 'Rejected', count: rejectedColleges, color: 'bg-red-500' },
    { label: 'Waitlisted', count: waitlistedColleges, color: 'bg-yellow-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-6 backdrop-blur-sm bg-opacity-80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 backdrop-blur-sm bg-opacity-80">
          <h3 className="text-lg font-semibold text-white mb-4">Application Status Distribution</h3>
          <div className="space-y-3">
            {statusData.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <span className="text-sm text-gray-300">{status.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-100">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 backdrop-blur-sm bg-opacity-80">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Upcoming Deadlines
          </h3>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((college) => {
                const daysUntil = Math.ceil(
                  (new Date(college.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={college.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{college.name}</p>
                      <p className="text-sm text-gray-400">{new Date(college.applicationDeadline).toLocaleDateString()}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      daysUntil <= 7 ? 'bg-red-900/30 text-red-400' :
                      daysUntil <= 30 ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {daysUntil} days
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No upcoming deadlines</p>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 backdrop-blur-sm bg-opacity-80">
        <h3 className="text-lg font-semibold text-white mb-4">Overall Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-300 mb-2">
              <span>Application Completion</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          
          {totalColleges > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{admittedColleges}</p>
                <p className="text-sm text-gray-400">Admitted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{rejectedColleges}</p>
                <p className="text-sm text-gray-400">Rejected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{waitlistedColleges}</p>
                <p className="text-sm text-gray-400">Waitlisted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{totalColleges - submittedApplications}</p>
                <p className="text-sm text-gray-400">Pending</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}