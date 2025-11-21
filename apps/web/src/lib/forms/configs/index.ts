/**
 * Form Configurations Index
 * Central export for all form configurations
 */

// Authentication forms
export {
  loginFormConfig,
  signupFormConfig,
  forgotPasswordFormConfig,
  resetPasswordFormConfig,
} from './auth';

// Course forms
export {
  createCourseFormConfig,
  editCourseFormConfig,
  createModuleFormConfig,
  createLessonFormConfig,
} from './course';

// Organization forms
export {
  createOrganizationFormConfig,
  editOrganizationFormConfig,
  inviteUserFormConfig,
} from './organization';

// DSA forms
export {
  createDSAProblemFormConfig,
  generateDSASheetFormConfig,
} from './dsa';

// Forum/Community forms
export {
  createThreadFormConfig,
  replyFormConfig,
} from './forum';

// Helper function to get form config by ID
export function getFormConfigById(id: string) {
  const configs = {
    // Auth
    'login-form': require('./auth').loginFormConfig,
    'signup-form': require('./auth').signupFormConfig,
    'forgot-password-form': require('./auth').forgotPasswordFormConfig,
    'reset-password-form': require('./auth').resetPasswordFormConfig,

    // Course
    'create-course-form': require('./course').createCourseFormConfig,
    'edit-course-form': require('./course').editCourseFormConfig,
    'create-module-form': require('./course').createModuleFormConfig,
    'create-lesson-form': require('./course').createLessonFormConfig,

    // Organization
    'create-organization-form': require('./organization').createOrganizationFormConfig,
    'edit-organization-form': require('./organization').editOrganizationFormConfig,
    'invite-user-form': require('./organization').inviteUserFormConfig,

    // DSA
    'create-dsa-problem-form': require('./dsa').createDSAProblemFormConfig,
    'generate-dsa-sheet-form': require('./dsa').generateDSASheetFormConfig,

    // Forum
    'create-thread-form': require('./forum').createThreadFormConfig,
    'reply-form': require('./forum').replyFormConfig,
  };

  return configs[id];
}

// Helper function to clone and customize a form config
export function cloneFormConfig(config: any, overrides: Partial<any> = {}) {
  return {
    ...config,
    ...overrides,
    sections: config.sections.map((section: any, idx: number) => ({
      ...section,
      ...(overrides.sections?.[idx] || {}),
    })),
  };
}
