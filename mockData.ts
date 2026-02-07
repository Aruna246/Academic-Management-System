import { DepartmentStructure, Student, StaffAssignment, FacultyAdvisorAccount, HODAccount, TimeTableEntry, ExamResult } from '../types';

export const initialDepartments: DepartmentStructure[] = [
  {
    id: 'cse',
    name: 'Computer Science',
    subModules: [
      { id: 'cse-hod', name: 'HOD' },
      { id: 'cse-y1', name: 'I Year', sections: ['Section A', 'Section B'] },
      { id: 'cse-y2', name: 'II Year', sections: ['Section A', 'Section B'] }
    ]
  },
  {
    id: 'ece',
    name: 'Electronics & Comm',
    subModules: [
      { id: 'ece-hod', name: 'HOD' },
      { id: 'ece-y1', name: 'I Year', sections: ['Section A'] }
    ]
  }
];

export const mockStudents: Student[] = [
  {
    id: 'TPGIT001',
    name: 'Arun Kumar',
    dob: '2004-05-15',
    department: 'CSE',
    year: 'II Year',
    section: 'Section A',
    grade: 'A+',
    attendancePercentage: 85,
    bloodGroup: 'O+',
    homeAddress: '123, Anna Nagar, Chennai',
    studentPhone: '9876543210',
    parentPhone: '9876543211',
    email: 'test@gmail.com',
    subjectMarks: {
      'Data Structures': {
        semester1: { cat1: 75, cat2: 82 },
        semester2: { cat1: 0, cat2: 0 }
      }
    }
  }
];

export const mockStaffAssignments: StaffAssignment[] = [
  {
    id: 'staff-1',
    departmentId: 'cse',
    year: 'II Year',
    section: 'Section A',
    staffName: 'Dr. Kavitha',
    email: 'kavitha@tpgit.edu',
    password: '123',
    subject: 'Data Structures',
    subjectCode: 'CS8391',
    semester: '3rd Semester'
  }
];

export const mockFacultyAdvisors: FacultyAdvisorAccount[] = [
  {
    id: 'fa-1',
    name: 'Mr. Rajesh',
    email: 'rajesh@tpgit.edu',
    password: '123',
    deptId: 'cse',
    yearId: 'II Year',
    section: 'Section A'
  }
];

export const mockHODAccounts: HODAccount[] = [
  {
    id: 'hod-cse',
    name: 'Dr. Santhosh',
    email: 'hodcse@tpgit.edu',
    password: '123',
    deptId: 'cse'
  }
];

export const mockTimeTables: TimeTableEntry[] = [];
export const mockExamResults: ExamResult[] = [];