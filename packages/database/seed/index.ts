import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Load config files
const loadConfig = <T>(filename: string): T => {
  const filePath = path.join(__dirname, 'config', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

async function seedUsers() {
  console.log('🌱 Seeding users...');
  const config = loadConfig<{ users: any[] }>('users.json');

  for (const userData of config.users) {
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        username: userData.username,
        passwordHash,
        role: userData.role,
        isEmailVerified: userData.isEmailVerified,
        profile: {
          create: {
            fullName: userData.fullName,
            bio: userData.profile.bio,
            location: userData.profile.location,
            githubUrl: userData.profile.githubUrl,
            linkedinUrl: userData.profile.linkedinUrl,
            experienceLevel: userData.profile.experienceLevel,
            currentGoal: userData.profile.currentGoal,
            dailyLearningTimeMinutes: userData.profile.dailyLearningTimeMinutes || 30,
          },
        },
        learningStreak: {
          create: {
            currentStreak: Math.floor(Math.random() * 30) + 1,
            longestStreak: Math.floor(Math.random() * 60) + 10,
            lastActivityDate: new Date(),
          },
        },
      },
    });

    console.log(`✓ Created user: ${user.username}`);
  }
}

async function seedCourses() {
  console.log('🌱 Seeding courses...');
  const config = loadConfig<{ courses: any[] }>('courses.json');

  for (const courseData of config.courses) {
    const instructor = await prisma.user.findUnique({
      where: { username: courseData.instructorUsername },
    });

    if (!instructor) {
      console.log(`✗ Instructor ${courseData.instructorUsername} not found`);
      continue;
    }

    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        difficultyLevel: courseData.difficultyLevel,
        price: courseData.price,
        discountedPrice: courseData.discountedPrice,
        isPublished: courseData.isPublished,
        thumbnailUrl: courseData.thumbnailUrl,
        instructorId: instructor.id,
        modules: {
          create: courseData.modules.map((module: any) => ({
            title: module.title,
            description: module.description,
            order: module.order,
            lessons: {
              create: module.lessons.map((lesson: any) => ({
                title: lesson.title,
                contentType: lesson.contentType,
                content: lesson.content,
                duration: lesson.duration,
                isFree: lesson.isFree,
                order: lesson.order,
              })),
            },
          })),
        },
      },
    });

    console.log(`✓ Created course: ${course.title}`);
  }
}

async function seedQuestions() {
  console.log('🌱 Seeding coding questions...');
  const config = loadConfig<{ questions: any[] }>('questions.json');

  for (const questionData of config.questions) {
    const creator = await prisma.user.findUnique({
      where: { username: questionData.creatorUsername },
    });

    if (!creator) continue;

    const question = await prisma.question.upsert({
      where: { slug: questionData.slug },
      update: {},
      create: {
        title: questionData.title,
        slug: questionData.slug,
        type: questionData.type,
        difficulty: questionData.difficulty,
        content: questionData.content,
        creatorId: creator.id,
        companies: questionData.companies,
        topics: questionData.topics,
        codingQuestion: questionData.codingQuestion
          ? {
              create: {
                starterCode: questionData.codingQuestion.starterCode,
                timeLimit: questionData.codingQuestion.timeLimit,
                memoryLimit: questionData.codingQuestion.memoryLimit,
                testCases: questionData.codingQuestion.testCases,
              },
            }
          : undefined,
      },
    });

    console.log(`✓ Created question: ${question.title}`);
  }
}

async function seedLabs() {
  console.log('🌱 Seeding terminal labs...');
  const config = loadConfig<{ labs: any[] }>('labs.json');

  for (const labData of config.labs) {
    const creator = await prisma.user.findUnique({
      where: { username: labData.creatorUsername },
    });

    if (!creator) continue;

    const lab = await prisma.terminalChallenge.upsert({
      where: { slug: labData.slug },
      update: {},
      create: {
        title: labData.title,
        slug: labData.slug,
        description: labData.description,
        difficulty: labData.difficulty,
        scenario: labData.scenario,
        estimatedMinutes: labData.estimatedMinutes,
        tasks: labData.tasks,
        creatorId: creator.id,
      },
    });

    console.log(`✓ Created lab: ${lab.title}`);
  }
}

async function seedAchievements() {
  console.log('🌱 Seeding achievements...');
  const config = loadConfig<{ achievements: any[] }>('achievements.json');

  for (const achievementData of config.achievements) {
    await prisma.achievement.upsert({
      where: { name: achievementData.name },
      update: {},
      create: {
        name: achievementData.name,
        description: achievementData.description,
        icon: achievementData.icon,
        category: achievementData.category,
        points: achievementData.points,
      },
    });

    console.log(`✓ Created achievement: ${achievementData.name}`);
  }
}

async function seedEnrollments() {
  console.log('🌱 Seeding course enrollments...');

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
  });

  const courses = await prisma.course.findMany();

  for (const student of students) {
    // Enroll in 2-3 random courses
    const numCourses = Math.floor(Math.random() * 2) + 2;
    const selectedCourses = courses
      .sort(() => Math.random() - 0.5)
      .slice(0, numCourses);

    for (const course of selectedCourses) {
      await prisma.courseEnrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          progress: Math.floor(Math.random() * 100),
          completedAt:
            Math.random() > 0.5 ? new Date() : null,
        },
      });

      console.log(`✓ Enrolled ${student.username} in ${course.title}`);
    }
  }
}

async function seedAnalytics() {
  console.log('🌱 Seeding learning analytics...');

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
  });

  for (const student of students) {
    // Create analytics for the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      await prisma.learningAnalytics.create({
        data: {
          userId: student.id,
          date,
          lessonsCompleted: Math.floor(Math.random() * 5),
          timeSpentMinutes: Math.floor(Math.random() * 120) + 30,
          problemsSolved: Math.floor(Math.random() * 10),
        },
      });
    }

    console.log(`✓ Created analytics for ${student.username}`);
  }
}

async function main() {
  console.log('🚀 Starting database seed...\n');

  try {
    await seedUsers();
    await seedCourses();
    await seedQuestions();
    await seedLabs();
    await seedAchievements();
    await seedEnrollments();
    await seedAnalytics();

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
