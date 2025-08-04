import { College, TaskColumn, ApplicationTask } from '../types';

export const mockColleges: College[] = [
  {
    id: '1',
    name: 'Stanford University',
    location: 'Stanford, CA',
    applicationDeadline: '2025-01-02',
    earlyDeadline: '2024-11-01',
    applicationFee: 90,
    portalLink: 'https://admission.stanford.edu/',
    scholarships: ['Knight-Hennessy Scholars', 'Stanford Scholars'],
    requirements: {
      essays: ['Personal Statement', 'Why Stanford Essay', 'Intellectual Vitality Essay'],
      testScores: ['SAT/ACT', 'TOEFL (International)'],
      documents: ['Transcripts', 'Letters of Recommendation (3)', 'Resume']
    },
    status: 'in-progress',
    notes: 'Focus on CS program, prepare for technical interviews',
    addedDate: '2024-10-15'
  },
  {
    id: '2',
    name: 'National University of Singapore',
    location: 'Singapore',
    applicationDeadline: '2025-02-28',
    earlyDeadline: '2024-12-15',
    applicationFee: 30,
    portalLink: 'https://www.nus.edu.sg/oam/',
    scholarships: ['ASEAN Undergraduate Scholarship', 'NUS Merit Scholarship'],
    requirements: {
      essays: ['Personal Statement', 'Academic Interest Essay'],
      testScores: ['SAT/A-Levels', 'IELTS/TOEFL'],
      documents: ['Academic Transcripts', 'Letters of Recommendation (2)', 'Portfolio (if applicable)']
    },
    status: 'not-started',
    notes: 'Strong in engineering, good scholarship opportunities',
    addedDate: '2024-10-20'
  },
  {
    id: '3',
    name: 'MIT',
    location: 'Cambridge, MA',
    applicationDeadline: '2025-01-01',
    earlyDeadline: '2024-11-01',
    applicationFee: 75,
    portalLink: 'https://mitadmissions.org/',
    scholarships: ['Need-based Financial Aid'],
    requirements: {
      essays: ['Main Essay', '5 Short Essays', 'Optional Essays'],
      testScores: ['SAT/ACT', 'SAT Subject Tests (recommended)'],
      documents: ['School Report', 'Teacher Evaluations (2)', 'Mid-year Report']
    },
    status: 'submitted',
    notes: 'Dream school for engineering',
    addedDate: '2024-09-01'
  }
];

export const defaultTaskColumns: TaskColumn[] = [
  { id: 'college', name: 'College', type: 'text' },
  { id: 'essays', name: 'Essays Completed', type: 'checkbox' },
  { id: 'recommendations', name: 'Recommendations', type: 'select', options: ['0/3', '1/3', '2/3', '3/3'] },
  { id: 'transcripts', name: 'Transcripts Sent', type: 'checkbox' },
  { id: 'testScores', name: 'Test Scores Sent', type: 'checkbox' },
  { id: 'applicationFee', name: 'Fee Paid', type: 'checkbox' },
  { id: 'submitted', name: 'Application Submitted', type: 'checkbox' },
  { id: 'interviewScheduled', name: 'Interview Scheduled', type: 'checkbox' },
  { id: 'admissionResult', name: 'Result', type: 'select', options: ['Pending', 'Admitted', 'Rejected', 'Waitlisted'] }
];

export const mockApplicationTasks: ApplicationTask[] = [
  {
    collegeId: '1',
    college: 'Stanford University',
    essays: true,
    recommendations: '2/3',
    transcripts: true,
    testScores: true,
    applicationFee: true,
    submitted: false,
    interviewScheduled: false,
    admissionResult: 'Pending'
  },
  {
    collegeId: '2',
    college: 'National University of Singapore',
    essays: false,
    recommendations: '0/3',
    transcripts: false,
    testScores: true,
    applicationFee: false,
    submitted: false,
    interviewScheduled: false,
    admissionResult: 'Pending'
  },
  {
    collegeId: '3',
    college: 'MIT',
    essays: true,
    recommendations: '3/3',
    transcripts: true,
    testScores: true,
    applicationFee: true,
    submitted: true,
    interviewScheduled: true,
    admissionResult: 'Pending'
  }
];