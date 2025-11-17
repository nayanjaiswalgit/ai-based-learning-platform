import { UserRole, OrganizationType } from '@prisma/client';

/**
 * Title-to-Role Mapping
 * Maps organizational titles to core system roles
 */

export const TITLE_ROLE_MAPPING: Record<string, UserRole> = {
  // Academic Titles
  'Dean': UserRole.ADMIN,
  'Vice Dean': UserRole.ADMIN,
  'Department Head': UserRole.ADMIN,
  'Professor': UserRole.INSTRUCTOR,
  'Associate Professor': UserRole.INSTRUCTOR,
  'Assistant Professor': UserRole.INSTRUCTOR,
  'Lecturer': UserRole.INSTRUCTOR,
  'Teaching Assistant': UserRole.MENTOR,
  'Research Assistant': UserRole.MENTOR,
  'Graduate Assistant': UserRole.MENTOR,
  'Student': UserRole.STUDENT,
  'Undergraduate': UserRole.STUDENT,
  'Graduate Student': UserRole.STUDENT,
  'PhD Candidate': UserRole.STUDENT,

  // Corporate Titles
  'CEO': UserRole.ADMIN,
  'CTO': UserRole.ADMIN,
  'CXO': UserRole.ADMIN,
  'VP Engineering': UserRole.ADMIN,
  'Director': UserRole.ADMIN,
  'Engineering Manager': UserRole.INSTRUCTOR,
  'Tech Lead': UserRole.INSTRUCTOR,
  'Team Lead': UserRole.INSTRUCTOR,
  'Senior Engineer': UserRole.MENTOR,
  'Staff Engineer': UserRole.MENTOR,
  'Principal Engineer': UserRole.INSTRUCTOR,
  'Senior Developer': UserRole.MENTOR,
  'Developer': UserRole.STUDENT,
  'Junior Developer': UserRole.STUDENT,
  'Intern': UserRole.STUDENT,
  'Trainee': UserRole.STUDENT,

  // Training/Bootcamp Titles
  'Program Director': UserRole.ADMIN,
  'Head Instructor': UserRole.INSTRUCTOR,
  'Instructor': UserRole.INSTRUCTOR,
  'Mentor': UserRole.MENTOR,
  'Teaching Fellow': UserRole.MENTOR,
  'Student': UserRole.STUDENT,
  'Participant': UserRole.STUDENT,

  // Default
  'Founder': UserRole.ADMIN,
  'Administrator': UserRole.ADMIN,
  'Manager': UserRole.INSTRUCTOR,
  'Member': UserRole.STUDENT,
};

/**
 * Get suggested titles based on organization type
 */
export const ORGANIZATION_TITLES: Record<OrganizationType, string[]> = {
  [OrganizationType.UNIVERSITY]: [
    'Dean',
    'Vice Dean',
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Teaching Assistant',
    'Research Assistant',
    'Graduate Student',
    'Undergraduate',
    'Student',
  ],
  [OrganizationType.COLLEGE]: [
    'Dean',
    'Department Head',
    'Professor',
    'Lecturer',
    'Teaching Assistant',
    'Student',
  ],
  [OrganizationType.COMPANY]: [
    'CEO',
    'CTO',
    'CXO',
    'VP Engineering',
    'Director',
    'Engineering Manager',
    'Tech Lead',
    'Senior Engineer',
    'Developer',
    'Junior Developer',
    'Intern',
  ],
  [OrganizationType.BOOTCAMP]: [
    'Program Director',
    'Head Instructor',
    'Instructor',
    'Mentor',
    'Teaching Fellow',
    'Participant',
    'Student',
  ],
  [OrganizationType.TRAINING_CENTER]: [
    'Program Director',
    'Instructor',
    'Mentor',
    'Trainee',
    'Student',
  ],
  [OrganizationType.SCHOOL]: [
    'Principal',
    'Teacher',
    'Assistant Teacher',
    'Student',
  ],
  [OrganizationType.OTHER]: [
    'Administrator',
    'Instructor',
    'Mentor',
    'Member',
  ],
};

/**
 * Get role from title
 */
export function getRoleFromTitle(title: string): UserRole {
  return TITLE_ROLE_MAPPING[title] || UserRole.STUDENT;
}

/**
 * Get suggested titles for organization type
 */
export function getSuggestedTitles(orgType: OrganizationType): string[] {
  return ORGANIZATION_TITLES[orgType] || ORGANIZATION_TITLES[OrganizationType.OTHER];
}

/**
 * Get role display name with custom title
 */
export function getDisplayName(role: UserRole, customTitle?: string): string {
  if (customTitle) {
    return `${customTitle} (${role})`;
  }
  return role;
}
