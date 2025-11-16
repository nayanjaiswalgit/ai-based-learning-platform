import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create skills
  console.log('Creating skills...');
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'JavaScript' },
      update: {},
      create: {
        name: 'JavaScript',
        category: 'programming',
        description: 'Modern JavaScript and ES6+',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: {
        name: 'React',
        category: 'frontend',
        description: 'React.js library for building user interfaces',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: {
        name: 'Node.js',
        category: 'backend',
        description: 'Server-side JavaScript runtime',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'TypeScript' },
      update: {},
      create: {
        name: 'TypeScript',
        category: 'programming',
        description: 'Typed superset of JavaScript',
      },
    }),
    prisma.skill.upsert({
      where: { name: 'Next.js' },
      update: {},
      create: {
        name: 'Next.js',
        category: 'frontend',
        description: 'React framework for production',
      },
    }),
  ]);

  // Create instructor user
  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      username: 'instructor',
      passwordHash,
      role: 'instructor',
      isEmailVerified: true,
      profile: {
        create: {
          fullName: 'John Instructor',
          bio: 'Experienced full-stack developer with 10+ years of teaching experience',
          experienceLevel: 'advanced',
          preferredLearningStyle: 'hands_on',
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      username: 'student',
      passwordHash,
      role: 'student',
      isEmailVerified: true,
      profile: {
        create: {
          fullName: 'Jane Student',
          bio: 'Aspiring web developer',
          experienceLevel: 'beginner',
          preferredLearningStyle: 'visual',
        },
      },
    },
  });

  // Create courses
  console.log('Creating courses...');
  const course1 = await prisma.course.create({
    data: {
      title: 'Complete React & Next.js Course',
      slug: 'complete-react-nextjs-course',
      description: 'Learn React and Next.js from scratch to advanced level',
      longDescription: `Master React and Next.js in this comprehensive course.

You'll learn:
- React fundamentals and hooks
- Next.js app router and server components
- State management with Zustand
- API routes and server actions
- Deployment and optimization

Perfect for beginners and intermediate developers looking to level up their React skills.`,
      instructorId: instructor.id,
      difficultyLevel: 'intermediate',
      estimatedDurationHours: 40,
      price: 99.99,
      isPublished: true,
      isFree: false,
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
      language: 'en',
      skills: {
        create: [
          { skillId: skills.find((s) => s.name === 'React')!.id },
          { skillId: skills.find((s) => s.name === 'Next.js')!.id },
          { skillId: skills.find((s) => s.name === 'TypeScript')!.id },
        ],
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Node.js Backend Development Masterclass',
      slug: 'nodejs-backend-masterclass',
      description: 'Build scalable backend applications with Node.js and Express',
      longDescription: `Learn to build production-ready backend applications with Node.js.

This course covers:
- Express.js and REST APIs
- Database design with PostgreSQL
- Authentication and authorization
- Microservices architecture
- Testing and deployment

Ideal for developers wanting to specialize in backend development.`,
      instructorId: instructor.id,
      difficultyLevel: 'advanced',
      estimatedDurationHours: 50,
      price: 129.99,
      isPublished: true,
      isFree: false,
      thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479',
      language: 'en',
      skills: {
        create: [
          { skillId: skills.find((s) => s.name === 'Node.js')!.id },
          { skillId: skills.find((s) => s.name === 'JavaScript')!.id },
        ],
      },
    },
  });

  // Create modules and lessons for course 1
  console.log('Creating modules and lessons...');
  const module1 = await prisma.courseModule.create({
    data: {
      courseId: course1.id,
      title: 'Introduction to React',
      description: 'Get started with React fundamentals',
      orderIndex: 1,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        moduleId: module1.id,
        title: 'What is React?',
        contentType: 'video',
        durationMinutes: 15,
        orderIndex: 1,
        isFreePreview: true,
        contentText: '# What is React?\n\nReact is a JavaScript library for building user interfaces...',
      },
      {
        moduleId: module1.id,
        title: 'Setting Up Your Development Environment',
        contentType: 'video',
        durationMinutes: 20,
        orderIndex: 2,
        isFreePreview: true,
      },
      {
        moduleId: module1.id,
        title: 'Your First React Component',
        contentType: 'video',
        durationMinutes: 25,
        orderIndex: 3,
        isFreePreview: false,
      },
    ],
  });

  const module2 = await prisma.courseModule.create({
    data: {
      courseId: course1.id,
      title: 'React Hooks Deep Dive',
      description: 'Master useState, useEffect, and custom hooks',
      orderIndex: 2,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        moduleId: module2.id,
        title: 'Understanding useState',
        contentType: 'video',
        durationMinutes: 30,
        orderIndex: 1,
      },
      {
        moduleId: module2.id,
        title: 'Working with useEffect',
        contentType: 'video',
        durationMinutes: 35,
        orderIndex: 2,
      },
    ],
  });

  // Create a course bundle
  console.log('Creating course bundle...');
  const bundle = await prisma.courseBundle.create({
    data: {
      title: 'Full Stack Developer Bundle',
      slug: 'full-stack-developer-bundle',
      description: 'Complete frontend and backend development',
      price: 199.99,
      discount: 15,
      isActive: true,
      courses: {
        create: [
          { courseId: course1.id },
          { courseId: course2.id },
        ],
      },
    },
  });

  // Create coupons
  console.log('Creating coupons...');
  await prisma.coupon.create({
    data: {
      code: 'WELCOME2024',
      couponType: 'percentage',
      discountValue: 20,
      maxUses: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'FIRSTTIME',
      couponType: 'first_time_user',
      discountValue: 25,
      maxUses: 1000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
    },
  });

  // Create affiliate links
  console.log('Creating affiliate links...');
  await prisma.affiliateLink.create({
    data: {
      courseId: course1.id,
      affiliateCode: 'REACT2024',
      commissionRate: 15,
    },
  });

  // Enroll student in course
  console.log('Creating enrollments...');
  await prisma.courseEnrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      progressPercentage: 25,
    },
  });

  // Create SEO data
  console.log('Creating SEO metadata...');
  await prisma.courseSEO.create({
    data: {
      courseId: course1.id,
      metaTitle: 'Complete React & Next.js Course | Learn Online',
      metaDescription: 'Master React and Next.js from scratch. Build modern web applications with hands-on projects. Enroll now!',
      keywords: ['react', 'nextjs', 'javascript', 'web development'],
      ogTitle: 'Complete React & Next.js Course',
      ogDescription: 'Learn React and Next.js from scratch to advanced level',
      ogImage: course1.thumbnailUrl,
      twitterCard: 'summary_large_image',
      canonicalUrl: `https://yourplatform.com/courses/${course1.slug}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course1.title,
        description: course1.description,
        provider: {
          '@type': 'Organization',
          name: 'Your Learning Platform',
        },
      },
    },
  });

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Created:');
  console.log(`- ${skills.length} skills`);
  console.log('- 2 users (instructor, student)');
  console.log('- 2 courses');
  console.log('- 2 modules with lessons');
  console.log('- 1 course bundle');
  console.log('- 2 coupons');
  console.log('- 1 affiliate link');
  console.log('- 1 enrollment');
  console.log('- SEO metadata');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
