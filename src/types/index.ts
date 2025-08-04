export interface Subject {
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

export interface College {
  id: string;
  name: string;
  location: string;
  applicationDeadline: string;
  earlyDeadline?: string;
  applicationFee: number;
  portalLink: string;
  scholarships: string[];
  requirements: {
    essays: string[];
    testScores: string[];
    documents: string[];
  };
  status: 'not-started' | 'in-progress' | 'submitted' | 'admitted' | 'rejected' | 'waitlisted';
  notes: string;
  addedDate: string;
}

export interface TaskColumn {
  id: string;
  name: string;
  type: 'checkbox' | 'text' | 'date' | 'select';
  options?: string[];
}

export interface ApplicationTask {
  collegeId: string;
  [key: string]: any;
}

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isSearching?: boolean;
}