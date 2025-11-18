/**
 * Configuration System Index
 * Central export for all configuration systems
 */

// Types
export * from './types';

// Navigation Configs
export { studentNavigationConfig } from './navigation/student';
export { instructorNavigationConfig } from './navigation/instructor';

// Dashboard Configs
export { studentDashboardConfig } from './dashboards/student';

// Table Configs
export { coursesTableConfig, enrolledCoursesTableConfig } from './tables/courses';
export { studentsTableConfig } from './tables/students';

// Form Configs (re-export from forms)
export * from '../forms/configs';
