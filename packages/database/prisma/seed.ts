import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create skills
  console.log('📚 Seeding skills...');
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'JavaScript' },
      update: {},
      create: {
        name: 'JavaScript',
        category: 'programming',
        description: 'Modern JavaScript programming language',
        iconUrl: '/icons/javascript.svg',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Python' },
      update: {},
      create: {
        name: 'Python',
        category: 'programming',
        description: 'Python programming language',
        iconUrl: '/icons/python.svg',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: {
        name: 'React',
        category: 'frontend',
        description: 'React.js library for building user interfaces',
        iconUrl: '/icons/react.svg',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: {
        name: 'Node.js',
        category: 'backend',
        description: 'Node.js JavaScript runtime',
        iconUrl: '/icons/nodejs.svg',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'PostgreSQL' },
      update: {},
      create: {
        name: 'PostgreSQL',
        category: 'database',
        description: 'PostgreSQL relational database',
        iconUrl: '/icons/postgresql.svg',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Docker' },
      update: {},
      create: {
        name: 'Docker',
        category: 'devops',
        description: 'Container platform',
        iconUrl: '/icons/docker.svg',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'AWS' },
      update: {},
      create: {
        name: 'AWS',
        category: 'devops',
        description: 'Amazon Web Services cloud platform',
        iconUrl: '/icons/aws.svg',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Data Structures' },
      update: {},
      create: {
        name: 'Data Structures',
        category: 'programming',
        description: 'Fundamental data structures',
        iconUrl: '/icons/datastructures.svg',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Algorithms' },
      update: {},
      create: {
        name: 'Algorithms',
        category: 'programming',
        description: 'Algorithm design and analysis',
        iconUrl: '/icons/algorithms.svg',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'System Design' },
      update: {},
      create: {
        name: 'System Design',
        category: 'programming',
        description: 'System architecture and design',
        iconUrl: '/icons/systemdesign.svg',
      },
    }),
  ]);

  console.log(`✅ Created ${skills.length} skills`);

  // Create admin user
  console.log('👤 Seeding admin user...');
  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@learning-platform.com' },
    update: {},
    create: {
      email: 'admin@learning-platform.com',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
      profile: {
        create: {
          fullName: 'Platform Admin',
          bio: 'System Administrator',
          experienceLevel: 'ADVANCED',
          preferredLearningStyle: 'MIXED',
        },
      },
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email}`);

  // Create instructor user
  console.log('👨‍🏫 Seeding instructor user...');
  const instructorPasswordHash = await bcrypt.hash('instructor123', 10);

  const instructorUser = await prisma.user.upsert({
    where: { email: 'instructor@learning-platform.com' },
    update: {},
    create: {
      email: 'instructor@learning-platform.com',
      username: 'instructor',
      passwordHash: instructorPasswordHash,
      role: 'INSTRUCTOR',
      isEmailVerified: true,
      isActive: true,
      profile: {
        create: {
          fullName: 'John Instructor',
          bio: 'Experienced software engineer and educator',
          experienceLevel: 'ADVANCED',
          preferredLearningStyle: 'HANDS_ON',
          githubUrl: 'https://github.com/johninstructor',
          linkedinUrl: 'https://linkedin.com/in/johninstructor',
        },
      },
    },
  });

  console.log(`✅ Created instructor user: ${instructorUser.email}`);

  // Create student user
  console.log('🎓 Seeding student user...');
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@learning-platform.com' },
    update: {},
    create: {
      email: 'student@learning-platform.com',
      username: 'student',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isEmailVerified: true,
      isActive: true,
      profile: {
        create: {
          fullName: 'Jane Student',
          bio: 'Aspiring full-stack developer',
          experienceLevel: 'BEGINNER',
          preferredLearningStyle: 'VISUAL',
          currentGoal: 'Become a full-stack developer',
          dailyLearningTimeMinutes: 120,
        },
      },
      learningStreak: {
        create: {
          currentStreakDays: 5,
          longestStreakDays: 10,
          lastActivityDate: new Date(),
          totalActiveDays: 25,
        },
      },
    },
  });

  console.log(`✅ Created student user: ${studentUser.email}`);

  // Create a sample course
  console.log('📖 Seeding sample course...');
  const sampleCourse = await prisma.course.create({
    data: {
      title: 'Complete Web Development Bootcamp',
      slug: 'complete-web-development-bootcamp',
      description: 'Learn web development from scratch with HTML, CSS, JavaScript, React, Node.js, and more.',
      longDescription: 'A comprehensive course covering everything you need to know to become a professional web developer. From the basics of HTML and CSS to advanced topics like React, Node.js, databases, and deployment.',
      instructorId: instructorUser.id,
      difficultyLevel: 'BEGINNER',
      estimatedDurationHours: 40,
      price: 99.99,
      isPublished: true,
      isFree: false,
      thumbnailUrl: '/courses/web-dev-bootcamp.jpg',
      language: 'en',
      courseSkills: {
        create: [
          { skillId: skills[0].id }, // JavaScript
          { skillId: skills[2].id }, // React
          { skillId: skills[3].id }, // Node.js
        ],
      },
      modules: {
        create: [
          {
            title: 'Introduction to Web Development',
            description: 'Learn the basics of web development',
            orderIndex: 1,
            lessons: {
              create: [
                {
                  title: 'What is Web Development?',
                  contentType: 'VIDEO',
                  contentUrl: '/videos/intro-to-web-dev.mp4',
                  durationMinutes: 15,
                  orderIndex: 1,
                  isFreePreview: true,
                },
                {
                  title: 'Setting Up Your Development Environment',
                  contentType: 'VIDEO',
                  contentUrl: '/videos/setup-dev-env.mp4',
                  durationMinutes: 20,
                  orderIndex: 2,
                  isFreePreview: true,
                },
              ],
            },
          },
          {
            title: 'HTML Fundamentals',
            description: 'Master HTML from the ground up',
            orderIndex: 2,
            lessons: {
              create: [
                {
                  title: 'HTML Basics',
                  contentType: 'VIDEO',
                  contentUrl: '/videos/html-basics.mp4',
                  durationMinutes: 30,
                  orderIndex: 1,
                },
                {
                  title: 'HTML Forms and Input',
                  contentType: 'VIDEO',
                  contentUrl: '/videos/html-forms.mp4',
                  durationMinutes: 25,
                  orderIndex: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created sample course: ${sampleCourse.title}`);

  // Create sample DSA sheet
  console.log('📝 Seeding DSA sheet...');
  const dsaSheet = await prisma.dsaSheet.create({
    data: {
      title: 'Top 100 Coding Interview Questions',
      slug: 'top-100-coding-interview-questions',
      description: 'Curated list of the most important coding interview questions',
      createdBy: instructorUser.id,
      isPublic: true,
      isOfficial: true,
      totalProblems: 0,
      thumbnailUrl: '/dsa-sheets/top-100.jpg',
    },
  });

  console.log(`✅ Created DSA sheet: ${dsaSheet.title}`);

  // Create sample questions
  console.log('❓ Seeding sample questions...');
  const question1 = await prisma.question.create({
    data: {
      questionType: 'CODING',
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'EASY',
      topics: ['arrays', 'hash-table'],
      companyTags: ['Google', 'Amazon', 'Facebook'],
      createdBy: instructorUser.id,
      isPublic: true,
      codingQuestion: {
        create: {
          starterCode: {
            python: 'def two_sum(nums, target):\n    # Your code here\n    pass',
            javascript: 'function twoSum(nums, target) {\n    // Your code here\n}',
          },
          testCases: [
            { input: '([2,7,11,15], 9)', expectedOutput: '[0,1]', isHidden: false },
            { input: '([3,2,4], 6)', expectedOutput: '[1,2]', isHidden: false },
            { input: '([3,3], 6)', expectedOutput: '[0,1]', isHidden: true },
          ],
          constraints: '2 <= nums.length <= 10^4',
          hints: ['Use a hash map to store seen numbers', 'For each number, check if target - num exists in the map'],
          timeLimitSeconds: 5,
          memoryLimitMb: 256,
        },
      },
    },
  });

  console.log(`✅ Created question: ${question1.title}`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin: admin@learning-platform.com / admin123');
  console.log('Instructor: instructor@learning-platform.com / instructor123');
  console.log('Student: student@learning-platform.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
