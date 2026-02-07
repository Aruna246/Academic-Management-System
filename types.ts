export interface Student {
  id: string;
  name: string;
  dob: string;
  department: string;
  year: string;
  section: string;
  grade: string;
  attendancePercentage: number;
  bloodGroup: string;
  homeAddress: string;
  studentPhone: string;
  parentPhone: string;
  // New fields added to fix errors
  email?: string; 
  password?: string;
  isFirstLogin?: boolean;
  documents?: {
    aadhar?: string;
    community?: string;
    firstGraduate?: string;
    passbook?: string;
  };
  subjectMarks?: Record<string, {
    semester1: { cat1: number; cat2: number };
    semester2: { cat1: number; cat2: number };
  }>;
  semesterResultDetailed?: SemesterResultDetailed;
}

export interface SemesterResultDetailed {
  subjects: SubjectResult[];
  gpa: string;
  cgpa: string;
}

export interface SubjectResult {
  subject: string;
  grade: string;
}

export interface DepartmentStructure {
  id: string;
  name: string;
  subModules: {
    id: string;
    name: string;
    sections?: string[];
  }[];
}

export interface StaffAssignment {
  id: string;
  departmentId: string;
  year: string;
  section: string;
  staffName: string;
  email: string;
  password?: string;
  subject: string;
  subjectCode: string;
  semester: string;
}

export interface HODAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  deptId: string;
}

export interface FacultyAdvisorAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  deptId: string;
  yearId: string;
  section: string;
}

export interface TimeTableEntry {
  id: string;
  departmentId: string;
  year: string;
  section: string;
  schedule: Record<string, string[]>;
}

export interface SystemConfig {
  collegeName: string;
  logoLeft: string;
  logoRight: string;
  currentYear: string;
  currentSemester: '1st' | '2nd';
}

export interface AcademicArchive {
  year: string;
  semester: string;
  archivedAt: string;
  data: {
    students: Student[];
    departments: DepartmentStructure[];
  };
}

export interface ExamResult {
  studentId: string;
  subjectCode: string;
  marks: number;
  grade: string;
}

export interface FacultyAdvice {
  studentId: string;
  message: string;
  date: string;
}