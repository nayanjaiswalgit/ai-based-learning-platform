/**
 * Test data fixtures for E2E tests
 */

export const testUsers = {
  validUser: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
  },
  instructor: {
    name: 'Test Instructor',
    email: 'instructor@example.com',
    password: 'InstructorPass123!',
  },
  admin: {
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'AdminPass123!',
  },
};

export const testCourses = {
  webDevelopment: {
    title: 'Complete Web Development Bootcamp',
    description: 'Learn web development from scratch',
    price: 99.99,
    duration: '40 hours',
    level: 'Beginner',
    category: 'Web Development',
  },
  dataScience: {
    title: 'Data Science with Python',
    description: 'Master data science fundamentals',
    price: 149.99,
    duration: '60 hours',
    level: 'Intermediate',
    category: 'Data Science',
  },
  devOps: {
    title: 'DevOps Engineering',
    description: 'Learn DevOps practices and tools',
    price: 129.99,
    duration: '50 hours',
    level: 'Advanced',
    category: 'DevOps',
  },
};

export const testProblems = {
  twoSum: {
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Find two numbers that add up to a target',
    testCases: [
      { input: '[2,7,11,15], 9', output: '[0,1]' },
      { input: '[3,2,4], 6', output: '[1,2]' },
    ],
  },
  reverseString: {
    title: 'Reverse String',
    difficulty: 'Easy',
    description: 'Reverse a given string',
    testCases: [
      { input: '"hello"', output: '"olleh"' },
      { input: '"world"', output: '"dlrow"' },
    ],
  },
};

export const searchQueries = [
  'React',
  'Python',
  'JavaScript',
  'Data Science',
  'Machine Learning',
  'Web Development',
  'DevOps',
  'Cloud Computing',
];

export const courseCategories = [
  'Web Development',
  'Data Science',
  'DevOps',
  'Mobile Development',
  'Cloud Computing',
  'Cybersecurity',
  'AI & Machine Learning',
  'Database',
];

export const courseLevels = ['Beginner', 'Intermediate', 'Advanced'];

export const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    features: [
      'Access to free courses',
      'Basic coding challenges',
      'Community forum access',
    ],
  },
  {
    name: 'Pro',
    price: 29.99,
    features: [
      'All free features',
      'Access to premium courses',
      'Advanced coding challenges',
      'Certificate of completion',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 99.99,
    features: [
      'All pro features',
      'Custom learning paths',
      'Team management',
      'Analytics dashboard',
      'Dedicated support',
    ],
  },
];

export const testCode = {
  javascript: {
    twoSum: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    fibonacci: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  },
  python: {
    twoSum: `def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
    fibonacci: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,
  },
};

export const terminalCommands = [
  'ls',
  'pwd',
  'cd ~',
  'mkdir test',
  'touch file.txt',
  'echo "Hello World"',
  'cat file.txt',
];

export const forumTopics = [
  {
    title: 'How to debug React hooks?',
    category: 'React',
    replies: 12,
  },
  {
    title: 'Best practices for Python testing',
    category: 'Python',
    replies: 8,
  },
  {
    title: 'Docker vs Kubernetes',
    category: 'DevOps',
    replies: 25,
  },
];

export const notifications = [
  {
    type: 'course_enrollment',
    message: 'You have successfully enrolled in a new course',
  },
  {
    type: 'assignment_due',
    message: 'Assignment due in 2 days',
  },
  {
    type: 'new_message',
    message: 'You have a new message from instructor',
  },
];

export const achievements = [
  {
    title: 'First Course Completed',
    description: 'Complete your first course',
    icon: '🎓',
  },
  {
    title: 'Problem Solver',
    description: 'Solve 10 coding problems',
    icon: '💡',
  },
  {
    title: '7 Day Streak',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
  },
];
