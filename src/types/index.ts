// Core application types
export interface College {
  id: string;
  name: string;
  location: string;
  applicationDeadline: string;
  earlyDeadline?: string;
  applicationFee: number;
  status: 'not-started' | 'in-progress' | 'submitted' | 'admitted' | 'rejected' | 'waitlisted';
  portalLink: string;
  requirements: {
    essays: string[];
    testScores: string[];
    documents: string[];
  };
  scholarships: string[];
  notes: string;
  addedDate: string;
  lastUpdated: string;
}

export interface TaskColumn {
  id: string;
  name: string;
  type: 'checkbox' | 'text' | 'select' | 'date' | 'number';
  options?: string[];
  required?: boolean;
  editable?: boolean;
}

export interface ApplicationTask {
  collegeId: string;
  college: string;
  essays: boolean;
  recommendations: string;
  transcripts: boolean;
  testScores: boolean;
  applicationFee: boolean;
  submitted: boolean;
  interviewScheduled: boolean;
  admissionResult: 'Pending' | 'Admitted' | 'Rejected' | 'Waitlisted';
  createdAt: string;
  [key: string]: any; // Allow dynamic properties for custom columns
}

export interface UserProfile {
  name: string;
  email: string;
  grade: number;
  subjects: Array<{
    name: string;
    grade: string;
  }>;
  resume: {
    text?: string;
    file?: File;
  };
  preferences: {
    notifications: boolean;
    autoSync: boolean;
    theme: 'light' | 'dark';
  };
  createdAt: string;
  lastUpdated: string;
}

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isSearching?: boolean;
  metadata?: {
    searchQuery?: string;
    sources?: string[];
  };
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
  relevanceScore?: number;
}

export interface AISuggestion {
  type: 'college' | 'scholarship' | 'deadline' | 'requirement' | 'openCollegeModal';
  title: string;
  description: string;
  data?: any;
  action?: () => void;
}

export interface AIResponse {
  content: string;
  searchResults?: SearchResult[];
  suggestions?: AISuggestion[];
  confidence?: number;
}
