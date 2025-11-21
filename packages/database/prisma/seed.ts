import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.userSubmission.deleteMany();
  await prisma.userDsaProgress.deleteMany();
  await prisma.dsaProblem.deleteMany();
  await prisma.dsaSheet.deleteMany();
  await prisma.question.deleteMany();
  await prisma.courseReview.deleteMany();
  await prisma.courseEnrollment.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.courseSEO.deleteMany();
  await prisma.affiliateLink.deleteMany();
  await prisma.courseBundle.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.course.deleteMany();
  await prisma.cohortEnrollment.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.bootcamp.deleteMany();
  await prisma.dailyRecommendation.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.discussionReply.deleteMany();
  await prisma.discussionThread.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.learningStreak.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.learningAnalytics.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.oAuthProvider.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data\n');

  // =====================================================
  // 1. Create Users
  // =====================================================
  console.log('👥 Creating users...');

  const adminPassword = await hashPassword('admin123');
  const userPassword = await hashPassword('user123');

  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@platform.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      profile: {
        create: {
          fullName: 'Platform Admin',
          bio: 'System administrator',
          experienceLevel: 'expert',
          preferredLearningStyle: 'visual',
          dailyLearningTimeMinutes: 120,
        },
      },
    },
  });

  // Create 10 instructors
  const instructors = [];
  for (let i = 1; i <= 10; i++) {
    const instructor = await prisma.user.create({
      data: {
        email: `instructor${i}@platform.com`,
        username: `instructor${i}`,
        passwordHash: userPassword,
        role: 'instructor',
        isEmailVerified: true,
        isActive: true,
        profile: {
          create: {
            fullName: `Instructor ${i}`,
            bio: `Experienced instructor with ${5 + i} years of teaching. Specialized in modern web development and software engineering.`,
            experienceLevel: 'expert',
            preferredLearningStyle: i % 2 === 0 ? 'visual' : 'hands_on',
            dailyLearningTimeMinutes: 60,
            githubUrl: `https://github.com/instructor${i}`,
            linkedinUrl: `https://linkedin.com/in/instructor${i}`,
            websiteUrl: `https://instructor${i}.dev`,
          },
        },
      },
    });
    instructors.push(instructor);
  }

  // Create 5 mentors
  const mentors = [];
  for (let i = 1; i <= 5; i++) {
    const mentor = await prisma.user.create({
      data: {
        email: `mentor${i}@platform.com`,
        username: `mentor${i}`,
        passwordHash: userPassword,
        role: 'mentor',
        isEmailVerified: true,
        isActive: true,
        profile: {
          create: {
            fullName: `Mentor ${i}`,
            bio: `Senior software engineer and mentor. Passionate about helping students succeed.`,
            experienceLevel: 'advanced',
            preferredLearningStyle: 'hands_on',
            dailyLearningTimeMinutes: 90,
          },
        },
      },
    });
    mentors.push(mentor);
  }

  // Create 50 students
  const students = [];
  const experienceLevels = ['beginner', 'intermediate', 'advanced'];
  const learningStyles = ['visual', 'auditory', 'reading_writing', 'hands_on'];

  for (let i = 1; i <= 50; i++) {
    const student = await prisma.user.create({
      data: {
        email: `student${i}@example.com`,
        username: `student${i}`,
        passwordHash: userPassword,
        role: 'student',
        isEmailVerified: i % 10 !== 0, // 90% verified
        isActive: true,
        profile: {
          create: {
            fullName: `Student ${i}`,
            bio: i % 3 === 0 ? `Aspiring ${['Full Stack Developer', 'Data Scientist', 'DevOps Engineer'][i % 3]}` : undefined,
            currentGoal: ['Get a job as a software developer', 'Learn full-stack development', 'Master DSA for interviews'][i % 3],
            experienceLevel: experienceLevels[i % 3] as any,
            preferredLearningStyle: learningStyles[i % 4] as any,
            dailyLearningTimeMinutes: 30 + (i % 6) * 15,
          },
        },
        subscription: i % 5 === 0 ? {
          create: {
            plan: i % 10 === 0 ? 'enterprise' : 'pro',
            status: 'active',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-01-01'),
            autoRenew: true,
          },
        } : undefined,
        learningStreak: {
          create: {
            currentStreak: i % 30,
            longestStreak: i % 30 + 5,
            lastActiveDate: new Date(),
          },
        },
      },
    });
    students.push(student);
  }

  console.log(`✅ Created ${1 + instructors.length + mentors.length + students.length} users\n`);

  // =====================================================
  // 2. Create Skills
  // =====================================================
  console.log('🎯 Creating skills...');

  const skillsData = [
    { name: 'JavaScript', category: 'programming', description: 'Modern JavaScript programming language' },
    { name: 'TypeScript', category: 'programming', description: 'Typed superset of JavaScript' },
    { name: 'React', category: 'frontend', description: 'Popular UI library for building web applications' },
    { name: 'Next.js', category: 'frontend', description: 'React framework for production' },
    { name: 'Node.js', category: 'backend', description: 'JavaScript runtime for server-side development' },
    { name: 'Python', category: 'programming', description: 'Versatile programming language' },
    { name: 'PostgreSQL', category: 'database', description: 'Advanced open-source relational database' },
    { name: 'MongoDB', category: 'database', description: 'Popular NoSQL database' },
    { name: 'Redis', category: 'database', description: 'In-memory data structure store' },
    { name: 'Docker', category: 'devops', description: 'Container platform' },
    { name: 'Kubernetes', category: 'devops', description: 'Container orchestration platform' },
    { name: 'AWS', category: 'cloud', description: 'Amazon Web Services cloud platform' },
    { name: 'Git', category: 'tools', description: 'Version control system' },
    { name: 'Data Structures', category: 'dsa', description: 'Fundamental data structures' },
    { name: 'Algorithms', category: 'dsa', description: 'Problem-solving algorithms' },
  ];

  const skills = await Promise.all(
    skillsData.map(skill => prisma.skill.create({ data: skill }))
  );

  console.log(`✅ Created ${skills.length} skills\n`);

  // =====================================================
  // 3. Create Courses
  // =====================================================
  console.log('📚 Creating courses...');

  const coursesData = [
    {
      title: 'Complete JavaScript Mastery',
      slug: 'complete-javascript-mastery',
      description: 'Master JavaScript from basics to advanced concepts',
      longDescription: 'Comprehensive JavaScript course covering everything from fundamentals to advanced patterns.',
      difficultyLevel: 'beginner',
      estimatedDurationHours: 40,
      price: 49.99,
      isFree: false,
      isPublished: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a',
      language: 'en',
    },
    {
      title: 'React & Next.js - Complete Guide',
      slug: 'react-nextjs-complete-guide',
      description: 'Build modern web applications with React and Next.js',
      longDescription: 'Learn to build production-ready applications with React and Next.js.',
      difficultyLevel: 'intermediate',
      estimatedDurationHours: 60,
      price: 79.99,
      isFree: false,
      isPublished: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
      language: 'en',
    },
    {
      title: 'Full-Stack Development Bootcamp',
      slug: 'fullstack-bootcamp',
      description: 'Complete full-stack development from frontend to backend',
      longDescription: 'Learn full-stack development with React, Node.js, and PostgreSQL.',
      difficultyLevel: 'advanced',
      estimatedDurationHours: 100,
      price: 129.99,
      isFree: false,
      isPublished: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      language: 'en',
    },
  ];

  const courses = [];
  for (let i = 0; i < coursesData.length; i++) {
    const courseData = coursesData[i];
    const instructor = instructors[i % instructors.length];

    const course = await prisma.course.create({
      data: {
        ...courseData,
        instructorId: instructor.id,
        enrollmentCount: Math.floor(Math.random() * 500) + 50,
        averageRating: 4.0 + Math.random() * 1.0,
      },
    });

    // Create modules
    for (let m = 1; m <= 3; m++) {
      const module = await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: `Module ${m}: ${['Introduction', 'Core Concepts', 'Advanced Topics'][m - 1]}`,
          description: `Learn about ${['basics', 'core concepts', 'advanced topics'][m - 1]}`,
          orderIndex: m,
        },
      });

      // Create lessons
      for (let l = 1; l <= 3; l++) {
        await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: `Lesson ${l}: ${['Getting Started', 'Hands-on Practice', 'Project'][l - 1]}`,
            contentType: ['video', 'article', 'exercise'][l - 1] as any,
            durationMinutes: 15 + l * 5,
            orderIndex: l,
            isFreePreview: m === 1 && l === 1,
            contentText: l === 2 ? '# Article Content\n\nThis is the lesson content.' : undefined,
            videoUrl: l === 1 ? 'https://example.com/video.mp4' : undefined,
          },
        });
      }
    }

    courses.push(course);
  }

  console.log(`✅ Created ${courses.length} courses with modules and lessons\n`);

  // =====================================================
  // 4. Create Enrollments
  // =====================================================
  console.log('📝 Creating enrollments and reviews...');

  let enrollmentCount = 0;
  for (const student of students.slice(0, 30)) {
    const enrolledCourses = getRandomItems(courses, 1 + Math.floor(Math.random() * 2));

    for (const course of enrolledCourses) {
      await prisma.courseEnrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          enrolledAt: randomDate(new Date('2024-01-01'), new Date()),
          progressPercentage: Math.floor(Math.random() * 100),
        },
      });
      enrollmentCount++;
    }
  }

  console.log(`✅ Created ${enrollmentCount} enrollments\n`);

  // =====================================================
  // 5. Create DSA Sheet
  // =====================================================
  console.log('🧮 Creating DSA sheet and problems...');

  const dsaSheet = await prisma.dsaSheet.create({
    data: {
      name: 'Top Interview 150',
      description: 'Curated list of 150 DSA problems for coding interviews',
      difficultyLevel: 'intermediate',
      estimatedHours: 80,
      authorId: instructors[0].id,
      isPublic: true,
    },
  });

  const problemsData = [
    { title: 'Two Sum', difficulty: 'easy', topic: 'ARRAYS', company: 'GOOGLE' },
    { title: 'Reverse Linked List', difficulty: 'easy', topic: 'LINKED_LISTS', company: 'AMAZON' },
    { title: 'Valid Palindrome', difficulty: 'easy', topic: 'STRINGS', company: 'MICROSOFT' },
    { title: 'Merge Intervals', difficulty: 'medium', topic: 'ARRAYS', company: 'META' },
    { title: 'Binary Tree Level Order', difficulty: 'medium', topic: 'TREES', company: 'GOOGLE' },
    { title: 'Coin Change', difficulty: 'medium', topic: 'DYNAMIC_PROGRAMMING', company: 'AMAZON' },
    { title: 'Word Ladder', difficulty: 'hard', topic: 'GRAPHS', company: 'GOOGLE' },
  ];

  for (let i = 0; i < problemsData.length; i++) {
    await prisma.dsaProblem.create({
      data: {
        ...problemsData[i],
        sheetId: dsaSheet.id,
        orderIndex: i + 1,
        description: `${problemsData[i].title} problem description`,
        examples: 'Example 1: ...\nExample 2: ...',
        constraints: 'Time: O(n), Space: O(1)',
        hints: 'Try using a hash map',
        solution: '// Solution code here',
      },
    });
  }

  console.log(`✅ Created DSA sheet with ${problemsData.length} problems\n`);

  // =====================================================
  // 6. Create Bootcamps
  // =====================================================
  console.log('🎓 Creating bootcamps...');

  const bootcampsData = [
    {
      title: 'Full Stack Developer Bootcamp',
      slug: 'full-stack-developer-bootcamp',
      description: 'Become job-ready in 16 weeks with comprehensive full-stack development training. Learn React, Node.js, PostgreSQL, and deploy production-ready applications.',
      durationWeeks: 16,
      price: 2999,
      difficultyLevel: 'Beginner to Advanced',
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      isPublished: true,
      syllabus: {
        weeks: [
          { range: '1-2', topic: 'Web Fundamentals', description: 'HTML, CSS, JavaScript basics' },
          { range: '3-4', topic: 'JavaScript & TypeScript', description: 'Modern JavaScript and TypeScript' },
          { range: '5-7', topic: 'React & Modern Frontend', description: 'Build interactive UIs with React' },
          { range: '8-10', topic: 'Backend with Node.js', description: 'Server-side development' },
          { range: '11-12', topic: 'Databases & APIs', description: 'PostgreSQL and REST APIs' },
          { range: '13-14', topic: 'DevOps & Deployment', description: 'Docker, CI/CD, cloud deployment' },
          { range: '15-16', topic: 'Capstone Project', description: 'Build and deploy your portfolio project' },
        ],
        benefits: [
          'Live classes 3 times per week',
          '1:1 mentorship sessions',
          'Career support and job placement',
          'Industry-recognized certificate',
        ],
      },
    },
    {
      title: 'Data Science & Machine Learning Bootcamp',
      slug: 'data-science-ml-bootcamp',
      description: 'Master data science and machine learning in 12 weeks. Learn Python, statistics, ML algorithms, and build real-world projects.',
      durationWeeks: 12,
      price: 3499,
      difficultyLevel: 'Intermediate',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      isPublished: true,
      syllabus: {
        weeks: [
          { range: '1-2', topic: 'Python & Data Analysis', description: 'NumPy, Pandas, data manipulation' },
          { range: '3-4', topic: 'Statistics & Probability', description: 'Statistical analysis fundamentals' },
          { range: '5-6', topic: 'Machine Learning Basics', description: 'Supervised and unsupervised learning' },
          { range: '7-8', topic: 'Deep Learning', description: 'Neural networks with TensorFlow' },
          { range: '9-10', topic: 'ML Engineering', description: 'Model deployment and MLOps' },
          { range: '11-12', topic: 'Capstone Project', description: 'End-to-end ML project' },
        ],
        benefits: [
          'Real-world datasets and projects',
          'Industry expert instructors',
          'Job interview preparation',
          'Portfolio-ready projects',
        ],
      },
    },
    {
      title: 'DevOps Engineering Bootcamp',
      slug: 'devops-engineering-bootcamp',
      description: 'Learn modern DevOps practices in 10 weeks. Master Docker, Kubernetes, CI/CD, infrastructure as code, and cloud platforms.',
      durationWeeks: 10,
      price: 2499,
      difficultyLevel: 'Advanced',
      thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
      isPublished: true,
      syllabus: {
        weeks: [
          { range: '1-2', topic: 'Linux & Scripting', description: 'Linux fundamentals and bash scripting' },
          { range: '3-4', topic: 'Docker & Containers', description: 'Containerization with Docker' },
          { range: '5-6', topic: 'Kubernetes', description: 'Container orchestration' },
          { range: '7-8', topic: 'CI/CD Pipelines', description: 'Jenkins, GitHub Actions, GitLab CI' },
          { range: '9-10', topic: 'Cloud & IaC', description: 'AWS/Azure and Terraform' },
        ],
        benefits: [
          'Hands-on labs and exercises',
          'Production environment simulation',
          'Cloud certifications prep',
          'Industry best practices',
        ],
      },
    },
    {
      title: 'Frontend Development Bootcamp',
      slug: 'frontend-development-bootcamp',
      description: 'Master modern frontend development in 8 weeks. Build stunning, responsive web applications with React, Next.js, and TypeScript.',
      durationWeeks: 8,
      price: 1999,
      difficultyLevel: 'Beginner',
      thumbnailUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
      isPublished: true,
      syllabus: {
        weeks: [
          { range: '1-2', topic: 'HTML, CSS & JavaScript', description: 'Modern web fundamentals' },
          { range: '3-4', topic: 'React Fundamentals', description: 'Components, hooks, state management' },
          { range: '5-6', topic: 'Next.js & TypeScript', description: 'Production-ready applications' },
          { range: '7-8', topic: 'Advanced Patterns', description: 'Performance, testing, deployment' },
        ],
        benefits: [
          'Build 5+ portfolio projects',
          'Modern tooling and best practices',
          'Responsive design mastery',
          'Job-ready skills',
        ],
      },
    },
  ];

  const bootcamps = [];
  for (let i = 0; i < bootcampsData.length; i++) {
    const bootcampData = bootcampsData[i];
    const instructor = instructors[i % instructors.length];

    const bootcamp = await prisma.bootcamp.create({
      data: {
        ...bootcampData,
        instructorId: instructor.id,
      },
    });

    // Create cohorts for each bootcamp
    const cohortStartDates = [
      { name: 'January 2025', startDate: new Date('2025-01-15'), status: 'upcoming' },
      { name: 'March 2025', startDate: new Date('2025-03-15'), status: 'upcoming' },
      { name: 'November 2024', startDate: new Date('2024-11-01'), status: 'active' },
    ];

    for (const cohortData of cohortStartDates) {
      const endDate = new Date(cohortData.startDate);
      endDate.setDate(endDate.getDate() + bootcampData.durationWeeks * 7);

      await prisma.cohort.create({
        data: {
          bootcampId: bootcamp.id,
          name: cohortData.name,
          startDate: cohortData.startDate,
          endDate,
          status: cohortData.status,
          currentEnrollment: cohortData.status === 'active' ? 18 : 5,
          maxEnrollment: 30,
          scheduleDetails: {
            weeklyHours: '15-20 hours',
            liveSessionDays: ['Monday', 'Wednesday', 'Friday'],
            sessionTime: '7:00 PM - 9:00 PM EST',
          },
        },
      });
    }

    bootcamps.push(bootcamp);
  }

  console.log(`✅ Created ${bootcamps.length} bootcamps with cohorts\n`);

  // =====================================================
  // Summary
  // =====================================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • Users: ${1 + instructors.length + mentors.length + students.length}`);
  console.log(`     - Admin: 1`);
  console.log(`     - Instructors: ${instructors.length}`);
  console.log(`     - Mentors: ${mentors.length}`);
  console.log(`     - Students: ${students.length}`);
  console.log(`   • Skills: ${skills.length}`);
  console.log(`   • Courses: ${courses.length}`);
  console.log(`   • Enrollments: ${enrollmentCount}`);
  console.log(`   • Bootcamps: ${bootcamps.length}`);
  console.log(`   • DSA Problems: ${problemsData.length}`);
  console.log('='.repeat(60));

  console.log('\n🔑 Test Credentials:');
  console.log('   Admin:      admin@platform.com / admin123');
  console.log('   Instructor: instructor1@platform.com / user123');
  console.log('   Student:    student1@example.com / user123');
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
