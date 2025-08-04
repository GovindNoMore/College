import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, TrendingUp, Clock, CheckCircle, Award, Target, 
  Globe, Search, Bot, AlertTriangle, DollarSign, BookOpen,
  MapPin, Users, Zap, Brain, Filter, ChevronDown, ChevronUp,
  ExternalLink, Sparkles, TrendingDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { College, ApplicationTask, UserProfile } from '../types';

interface AnalyticsViewProps {
  colleges: College[];
  tasks: ApplicationTask[];
  profile?: UserProfile | null;
  onCollegeUpdate?: (updates: Partial<College> & { id: string }) => void;
  onOpenAIAssistant?: () => void;
}

interface AnalyticsInsight {
  type: 'warning' | 'info' | 'success' | 'urgent';
  title: string;
  description: string;
  action?: string;
  actionType?: 'ai' | 'search' | 'update';
}

export default function AnalyticsView({ 
  colleges = [], 
  tasks = [], 
  profile,
  onCollegeUpdate,
  onOpenAIAssistant 
}: AnalyticsViewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const [showInsights, setShowInsights] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Enhanced calculations
  const analytics = useMemo(() => {
    const totalColleges = colleges.length;
    const submittedApplications = colleges.filter(c => c.status === 'submitted').length;
    const admittedColleges = colleges.filter(c => c.status === 'admitted').length;
    const rejectedColleges = colleges.filter(c => c.status === 'rejected').length;
    const waitlistedColleges = colleges.filter(c => c.status === 'waitlisted').length;
    const inProgressColleges = colleges.filter(c => c.status === 'in-progress').length;
    const notStartedColleges = colleges.filter(c => c.status === 'not-started').length;

    // Time-based filtering
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const filterDate = selectedTimeframe === 'week' ? weekAgo : 
                      selectedTimeframe === 'month' ? monthAgo : null;
    
    const recentColleges = filterDate ? 
      colleges.filter(c => c.addedDate && new Date(c.addedDate) >= filterDate) : colleges;

    // Deadline analysis
    const upcomingDeadlines = colleges
      .filter(c => c.applicationDeadline && new Date(c.applicationDeadline) > now && c.status !== 'submitted')
      .sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime());

    const urgentDeadlines = upcomingDeadlines.filter(c => {
      const daysUntil = Math.ceil((new Date(c.applicationDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 14;
    });

    // Financial analysis
    const totalFees = colleges.reduce((sum, college) => sum + (college.applicationFee || 0), 0);
    const avgFee = totalColleges > 0 ? totalFees / totalColleges : 0;
    const scholarshipOpportunities = colleges.reduce((sum, college) => 
      sum + (college.scholarships?.length || 0), 0);

    // Geographic distribution
    const locationData = colleges.reduce((acc, college) => {
      const location = college.location || 'Unknown';
      const country = location.split(',').pop()?.trim() || location;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Requirements analysis
    const requirementsAnalysis = colleges.reduce((acc, college) => {
      if (college.requirements) {
        acc.totalEssays += college.requirements.essays?.length || 0;
        acc.testScoreReqs += college.requirements.testScores?.length || 0;
        acc.documentsReqs += college.requirements.documents?.length || 0;
      }
      return acc;
    }, { totalEssays: 0, testScoreReqs: 0, documentsReqs: 0 });

    const completionRate = totalColleges > 0 ? (submittedApplications / totalColleges) * 100 : 0;
    const acceptanceRate = submittedApplications > 0 ? (admittedColleges / submittedApplications) * 100 : 0;

    return {
      totalColleges,
      submittedApplications,
      admittedColleges,
      rejectedColleges,
      waitlistedColleges,
      inProgressColleges,
      notStartedColleges,
      upcomingDeadlines: upcomingDeadlines.slice(0, 5),
      urgentDeadlines,
      totalFees,
      avgFee,
      scholarshipOpportunities,
      locationData,
      requirementsAnalysis,
      completionRate,
      acceptanceRate,
      recentColleges
    };
  }, [colleges, selectedTimeframe]);

  // AI-powered insights
  const insights = useMemo((): AnalyticsInsight[] => {
    const insights: AnalyticsInsight[] = [];
    
    // Urgent deadlines
    if (analytics.urgentDeadlines.length > 0) {
      insights.push({
        type: 'urgent',
        title: `${analytics.urgentDeadlines.length} Urgent Deadline${analytics.urgentDeadlines.length > 1 ? 's' : ''}`,
        description: `You have applications due within 2 weeks. Priority focus needed!`,
        action: 'Get AI assistance with prioritization',
        actionType: 'ai'
      });
    }

    // Low completion rate
    if (analytics.totalColleges > 0 && analytics.completionRate < 30) {
      insights.push({
        type: 'warning',
        title: 'Low Application Progress',
        description: `Only ${analytics.completionRate.toFixed(1)}% of applications completed. Consider creating a timeline.`,
        action: 'Ask AI for a study plan',
        actionType: 'ai'
      });
    }

    // No colleges added yet
    if (analytics.totalColleges === 0) {
      insights.push({
        type: 'info',
        title: 'Get Started',
        description: 'Add your first college to begin tracking your applications and deadlines.',
        action: 'Search for colleges with AI',
        actionType: 'search'
      });
    }

    // High application fees
    if (analytics.avgFee > 75) {
      insights.push({
        type: 'warning',
        title: 'High Application Costs',
        description: `Average fee of $${analytics.avgFee.toFixed(0)} per application. Consider fee waivers.`,
        action: 'Find fee waiver opportunities',
        actionType: 'ai'
      });
    }

    // Scholarship opportunities
    if (analytics.scholarshipOpportunities > 5) {
      insights.push({
        type: 'success',
        title: 'Scholarship Opportunities',
        description: `${analytics.scholarshipOpportunities} scholarship opportunities identified across your colleges.`,
        action: 'Get scholarship application tips',
        actionType: 'ai'
      });
    }

    // Geographic diversity suggestion
    const locationCount = Object.keys(analytics.locationData).length;
    if (locationCount === 1 && analytics.totalColleges > 3) {
      insights.push({
        type: 'info',
        title: 'Consider Geographic Diversity',
        description: 'All colleges are in the same location. Explore options in other regions.',
        action: 'Discover colleges in new locations',
        actionType: 'ai'
      });
    }

    return insights;
  }, [analytics]);

  const handleInsightAction = (insight: AnalyticsInsight) => {
    if (insight.actionType === 'ai' && onOpenAIAssistant) {
      onOpenAIAssistant();
    }
  };

  const stats = [
    {
      label: 'Total Colleges',
      value: analytics.totalColleges,
      change: analytics.recentColleges.length,
      changeLabel: selectedTimeframe === 'week' ? 'this week' : 'this month',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30'
    },
    {
      label: 'Applications Submitted',
      value: analytics.submittedApplications,
      change: null,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-900/30'
    },
    {
      label: 'Completion Rate',
      value: `${analytics.completionRate.toFixed(1)}%`,
      change: null,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30'
    },
    {
      label: 'Total Fees',
      value: `$${analytics.totalFees}`,
      change: analytics.avgFee > 0 ? `$${analytics.avgFee.toFixed(0)} avg` : null,
      changeLabel: 'per application',
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/30'
    }
  ];

  const statusData = [
    { label: 'Not Started', count: analytics.notStartedColleges, color: 'bg-gray-500', textColor: 'text-gray-400' },
    { label: 'In Progress', count: analytics.inProgressColleges, color: 'bg-blue-500', textColor: 'text-blue-400' },
    { label: 'Submitted', count: analytics.submittedApplications, color: 'bg-green-500', textColor: 'text-green-400' },
    { label: 'Admitted', count: analytics.admittedColleges, color: 'bg-green-600', textColor: 'text-green-500' },
    { label: 'Waitlisted', count: analytics.waitlistedColleges, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
    { label: 'Rejected', count: analytics.rejectedColleges, color: 'bg-red-500', textColor: 'text-red-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">
            Track your college application progress and get AI-powered insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'all')}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          
          {onOpenAIAssistant && (
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Bot className="w-4 h-4" />
              Ask AI
            </button>
          )}
        </div>
      </div>

      {/* AI Insights Panel */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">AI Insights</h3>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                {insights.length} insight{insights.length > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showInsights ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
          
          {showInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'urgent' ? 'bg-red-900/20 border-red-500' :
                    insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500' :
                    insight.type === 'success' ? 'bg-green-900/20 border-green-500' :
                    'bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${
                      insight.type === 'urgent' ? 'text-red-400' :
                      insight.type === 'warning' ? 'text-yellow-400' :
                      insight.type === 'success' ? 'text-green-400' :
                      'text-blue-400'
                    }`}>
                      {insight.type === 'urgent' ? <AlertTriangle className="w-5 h-5" /> :
                       insight.type === 'warning' ? <Clock className="w-5 h-5" /> :
                       insight.type === 'success' ? <Award className="w-5 h-5" /> :
                       <Sparkles className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                      {insight.action && (
                        <button
                          onClick={() => handleInsightAction(insight)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-1"
                        >
                          {insight.action}
                          {insight.actionType === 'ai' && <Bot className="w-3 h-3" />}
                          {insight.actionType === 'search' && <Search className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-6 backdrop-blur-sm bg-opacity-80 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <ArrowUp className="w-3 h-3" />
                      +{stat.change}
                    </div>
                    <div className="text-xs text-gray-500">{stat.changeLabel}</div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Application Status</h3>
          <div className="space-y-4">
            {statusData.map((status, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <span className="text-sm text-gray-300">{status.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${status.textColor}`}>{status.count}</span>
                  <span className="text-xs text-gray-500">
                    {analytics.totalColleges > 0 ? `${((status.count / analytics.totalColleges) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
            <div className="flex justify-between text-sm font-medium text-gray-300 mb-2">
              <span>Overall Progress</span>
              <span>{analytics.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${analytics.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Requirements Overview */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-400" />
              Requirements
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Total Essays</span>
                <span className="text-lg font-bold text-orange-400">{analytics.requirementsAnalysis.totalEssays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Test Score Requirements</span>
                <span className="text-lg font-bold text-blue-400">{analytics.requirementsAnalysis.testScoreReqs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Documents Needed</span>
                <span className="text-lg font-bold text-purple-400">{analytics.requirementsAnalysis.documentsReqs}</span>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          {analytics.submittedApplications > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Success Rate</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {analytics.acceptanceRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">
                  {analytics.admittedColleges} admitted out of {analytics.submittedApplications} submitted
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          Upcoming Deadlines
          {analytics.urgentDeadlines.length > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              {analytics.urgentDeadlines.length} urgent
            </span>
          )}
        </h3>
        
        {analytics.upcomingDeadlines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.upcomingDeadlines.map((college) => {
              const daysUntil = Math.ceil(
                (new Date(college.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isUrgent = daysUntil <= 14;
              
              return (
                <div 
                  key={college.id} 
                  className={`p-4 rounded-lg border-l-4 ${
                    isUrgent ? 'bg-red-900/20 border-red-500' :
                    daysUntil <= 30 ? 'bg-yellow-900/20 border-yellow-500' :
                    'bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white text-sm">{college.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isUrgent ? 'bg-red-500/20 text-red-400' :
                      daysUntil <= 30 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {daysUntil} days
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{college.location}</p>
                  <p className="text-xs text-gray-300">{new Date(college.applicationDeadline).toLocaleDateString()}</p>
                  
                  {college.portalLink && (
                    <a
                      href={college.portalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
                    >
                      Application Portal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No upcoming deadlines</p>
            <p className="text-sm text-gray-500 mt-1">All caught up! 🎉</p>
          </div>
        )}
      </div>

      {/* Geographic Distribution */}
      {Object.keys(analytics.locationData).length > 1 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            Geographic Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.locationData)
              .sort(([,a], [,b]) => b - a)
              .map(([location, count]) => (
                <div key={location} className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{count}</div>
                  <div className="text-sm text-gray-300">{location}</div>
                  <div className="text-xs text-gray-500">
                    {((count / analytics.totalColleges) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Financial Overview */}
      {analytics.totalFees > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            Financial Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">${analytics.totalFees}</div>
              <div className="text-sm text-gray-400">Total Application Fees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">${analytics.avgFee.toFixed(0)}</div>
              <div className="text-sm text-gray-400">Average per Application</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{analytics.scholarshipOpportunities}</div>
              <div className="text-sm text-gray-400">Scholarship Opportunities</div>
            </div>
          </div>
          
          {analytics.scholarshipOpportunities > 0 && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-300">
                💡 You have {analytics.scholarshipOpportunities} scholarship opportunities to explore!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
