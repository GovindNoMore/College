import React, { useState, useMemo } from 'react';
import { 
  MapPin, Calendar, DollarSign, ExternalLink, Clock, CheckCircle, 
  XCircle, Pause, AlertTriangle, Award, BookOpen, FileText, 
  TestTube, Users, Star, Bot, Sparkles, ChevronDown, ChevronUp,
  Globe, Target, TrendingUp, Edit3, Eye, MoreVertical, Heart,
  Share2, Flag, Zap
} from 'lucide-react';
import { College } from '../types';

interface CollegeCardProps {
  college: College;
  onClick: () => void;
  onRemove?: () => void;
  onUpdate?: (updates: Partial<College>) => void;
  onAIAssist?: (prompt: string) => void;
  showAnalytics?: boolean;
  isCompact?: boolean;
  showActions?: boolean;
}

export default function CollegeCard({ 
  college, 
  onClick, 
  onRemove, 
  onUpdate,
  onAIAssist,
  showAnalytics = true,
  isCompact = false,
  showActions = true
}: CollegeCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  // Calculate urgency and insights
  const insights = useMemo(() => {
    const now = new Date();
    const deadline = new Date(college.applicationDeadline);
    const earlyDeadline = college.earlyDeadline ? new Date(college.earlyDeadline) : null;
    
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilEarly = earlyDeadline ? Math.ceil((earlyDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    const urgency = daysUntilDeadline <= 7 ? 'critical' : 
                   daysUntilDeadline <= 14 ? 'high' :
                   daysUntilDeadline <= 30 ? 'medium' : 'low';
    
    const requirementsCount = (college.requirements?.essays?.length || 0) + 
                             (college.requirements?.testScores?.length || 0) + 
                             (college.requirements?.documents?.length || 0);
    
    const completionScore = college.status === 'submitted' ? 100 :
                           college.status === 'in-progress' ? 60 :
                           college.status === 'not-started' ? 0 : 100;
    
    const earlyAdvantage = earlyDeadline && daysUntilEarly > 0;
    const hasScholarships = college.scholarships && college.scholarships.length > 0;
    const isAffordable = (college.applicationFee || 0) <= 50;
    
    return {
      daysUntilDeadline,
      daysUntilEarly,
      urgency,
      requirementsCount,
      completionScore,
      earlyAdvantage,
      hasScholarships,
      isAffordable,
      isPastDeadline: daysUntilDeadline < 0
    };
  }, [college]);

  const getStatusConfig = (status: College['status']) => {
    const configs = {
      'not-started': {
        icon: Clock,
        color: 'text-gray-400',
        bgColor: 'bg-gray-800',
        borderColor: 'border-gray-600',
        label: 'Not Started',
        pulse: false
      },
      'in-progress': {
        icon: Clock,
        color: 'text-blue-400',
        bgColor: 'bg-blue-900/30',
        borderColor: 'border-blue-500/50',
        label: 'In Progress',
        pulse: true
      },
      'submitted': {
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-900/30',
        borderColor: 'border-green-500/50',
        label: 'Submitted',
        pulse: false
      },
      'admitted': {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-900/40',
        borderColor: 'border-green-400',
        label: 'Admitted! 🎉',
        pulse: false
      },
      'rejected': {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-900/30',
        borderColor: 'border-red-500/50',
        label: 'Rejected',
        pulse: false
      },
      'waitlisted': {
        icon: Pause,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/30',
        borderColor: 'border-yellow-500/50',
        label: 'Waitlisted',
        pulse: true
      }
    };
    
    return configs[status] || configs['not-started'];
  };

  const getUrgencyConfig = (urgency: string) => {
    const configs = {
      critical: { color: 'text-red-400', bgColor: 'bg-red-900/30', icon: AlertTriangle },
      high: { color: 'text-orange-400', bgColor: 'bg-orange-900/30', icon: Clock },
      medium: { color: 'text-yellow-400', bgColor: 'bg-yellow-900/30', icon: Calendar },
      low: { color: 'text-green-400', bgColor: 'bg-green-900/30', icon: CheckCircle }
    };
    return configs[urgency as keyof typeof configs] || configs.low;
  };

  const formatDeadline = (deadline: string, showRelative = true) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (!showRelative) return date.toLocaleDateString();
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow!';
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return date.toLocaleDateString();
  };

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'favorite':
        setIsFavorite(!isFavorite);
        break;
      case 'ai-deadline':
        onAIAssist?.(`Help me prepare for ${college.name}'s application deadline on ${college.applicationDeadline}. What should I prioritize?`);
        break;
      case 'ai-requirements':
        onAIAssist?.(`What are the specific application requirements for ${college.name}? Help me create a checklist.`);
        break;
      case 'ai-scholarships':
        onAIAssist?.(`Find scholarship opportunities at ${college.name} and help me understand the application process.`);
        break;
      case 'status-progress':
        onUpdate?.({ status: 'in-progress' });
        break;
      case 'status-submitted':
        onUpdate?.({ status: 'submitted' });
        break;
    }
    setShowQuickActions(false);
  };

  const statusConfig = getStatusConfig(college.status);
  const urgencyConfig = getUrgencyConfig(insights.urgency);
  const StatusIcon = statusConfig.icon;
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <div className={`group relative transition-all duration-300 ${
      isCompact ? 'bg-gray-800/60' : 'bg-gray-800'
    } rounded-xl border ${statusConfig.borderColor} hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer backdrop-blur-sm ${
      isCompact ? 'p-4' : 'p-6'
    }`}>
      
      {/* Urgency Indicator */}
      {!insights.isPastDeadline && college.status !== 'submitted' && insights.urgency !== 'low' && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${urgencyConfig.bgColor} border-2 border-gray-800 flex items-center justify-center ${
          insights.urgency === 'critical' ? 'animate-pulse' : ''
        }`}>
          <UrgencyIcon className={`w-3 h-3 ${urgencyConfig.color}`} />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4" onClick={onClick}>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div>
              <h3 className={`font-semibold text-white group-hover:text-blue-400 transition-colors ${
                isCompact ? 'text-base' : 'text-lg'
              } truncate`}>
                {college.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{college.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2 ml-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`} />
            <span className={`text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>

          {showActions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickActions(!showQuickActions);
                }}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {/* Quick Actions Dropdown */}
              {showQuickActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={(e) => handleQuickAction('favorite', e)}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-lg"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-400 fill-current' : ''}`} />
                      {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    </button>
                    
                    {college.status === 'not-started' && (
                      <button
                        onClick={(e) => handleQuickAction('status-progress', e)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-lg"
                      >
                        <Target className="w-4 h-4 text-blue-400" />
                        Mark as In Progress
                      </button>
                    )}
                    
                    {college.status === 'in-progress' && (
                      <button
                        onClick={(e) => handleQuickAction('status-submitted', e)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-lg"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Mark as Submitted
                      </button>
                    )}

                    <div className="border-t border-gray-600 my-1"></div>
                    
                    <button
                      onClick={(e) => handleQuickAction('ai-deadline', e)}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-lg"
                    >
                      <Bot className="w-4 h-4 text-purple-400" />
                      AI: Deadline Help
                    </button>
                    
                    <button
                      onClick={(e) => handleQuickAction('ai-requirements', e)}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      AI: Requirements
                    </button>
                    
                    {college.scholarships && college.scholarships.length > 0 && (
                      <button
                        onClick={(e) => handleQuickAction('ai-scholarships', e)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-lg"
                      >
                        <Award className="w-4 h-4 text-yellow-400" />
                        AI: Scholarships
                      </button>
                    )}

                    {onRemove && (
                      <>
                        <div className="border-t border-gray-600 my-1"></div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemove(); }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg"
                        >
                          <XCircle className="w-4 h-4" />
                          Remove College
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3" onClick={onClick}>
        {/* Deadline Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={`${
              insights.isPastDeadline ? 'text-red-400' : 
              insights.urgency === 'critical' ? 'text-red-400' :
              insights.urgency === 'high' ? 'text-orange-400' : 'text-gray-300'
            }`}>
              {formatDeadline(college.applicationDeadline)}
            </span>
            {insights.isPastDeadline && (
              <span className="px-2 py-0.5 text-xs bg-red-900/30 text-red-400 rounded-full">
                Passed
              </span>
            )}
          </div>
          
          {college.earlyDeadline && !insights.isPastDeadline && (
            <div className="text-xs">
              <span className="text-blue-400 font-medium">Early: </span>
              <span className="text-blue-300">{formatDeadline(college.earlyDeadline)}</span>
              {insights.earlyAdvantage && (
                <Zap className="w-3 h-3 text-yellow-400 inline ml-1" title="Early application advantage" />
              )}
            </div>
          )}
        </div>

        {/* Key Stats Row */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className={`${insights.isAffordable ? 'text-green-400' : 'text-gray-300'}`}>
              ${college.applicationFee || 0}
            </span>
            {insights.isAffordable && <Star className="w-3 h-3 text-green-400" title="Affordable" />}
          </div>

          {insights.hasScholarships && (
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                {college.scholarships?.length} scholarship{(college.scholarships?.length || 0) > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {insights.requirementsCount > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">
                {insights.requirementsCount} requirement{insights.requirementsCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Application Portal Link */}
        {college.portalLink && (
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-gray-400" />
            <a 
              href={college.portalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Application Portal
            </a>
          </div>
        )}

        {/* Progress Bar */}
        {showAnalytics && !isCompact && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Completion</span>
              <span>{insights.completionScore}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  insights.completionScore === 100 ? 'bg-green-500' :
                  insights.completionScore >= 60 ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}
                style={{ width: `${insights.completionScore}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Requirements Section */}
        {!isCompact && college.requirements && (
          <div className="mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRequirements(!showRequirements);
              }}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Requirements ({insights.requirementsCount})</span>
              {showRequirements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showRequirements && (
              <div className="mt-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                <div className="space-y-2 text-xs">
                  {college.requirements.essays && college.requirements.essays.length > 0 && (
                    <div>
                      <span className="text-purple-400 font-medium">Essays:</span>
                      <ul className="ml-4 mt-1 space-y-1">
                        {college.requirements.essays.map((essay, index) => (
                          <li key={index} className="text-gray-300">• {essay}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {college.requirements.testScores && college.requirements.testScores.length > 0 && (
                    <div>
                      <span className="text-blue-400 font-medium">Test Scores:</span>
                      <ul className="ml-4 mt-1 space-y-1">
                        {college.requirements.testScores.map((test, index) => (
                          <li key={index} className="text-gray-300">• {test}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {college.requirements.documents && college.requirements.documents.length > 0 && (
                    <div>
                      <span className="text-green-400 font-medium">Documents:</span>
                      <ul className="ml-4 mt-1 space-y-1">
                        {college.requirements.documents.map((doc, index) => (
                          <li key={index} className="text-gray-300">• {doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {college.notes && !isCompact && (
          <div className="mt-4 p-3 bg-gray-700/30 rounded-lg border-l-4 border-blue-500">
            <div className="text-sm text-gray-300">{college.notes}</div>
          </div>
        )}

        {/* AI Suggestions */}
        {!isCompact && onAIAssist && college.status !== 'submitted' && (
          <div className="mt-4 flex flex-wrap gap-2">
            {insights.urgency === 'critical' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction('ai-deadline', e);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-900/20 text-red-400 border border-red-500/30 rounded-full hover:bg-red-900/30 transition-colors"
              >
                <Bot className="w-3 h-3" />
                Urgent: Get AI Help
              </button>
            )}
            
            {insights.hasScholarships && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction('ai-scholarships', e);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-900/20 text-yellow-400 border border-yellow-500/30 rounded-full hover:bg-yellow-900/30 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Explore Scholarships
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
