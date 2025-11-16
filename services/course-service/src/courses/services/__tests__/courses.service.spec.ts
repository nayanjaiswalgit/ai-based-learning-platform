import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../courses.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    course: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    courseModule: {
      count: jest.fn(),
    },
    courseEnrollment: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    courseReview: {
      findMany: jest.fn(),
    },
    userProgress: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const createCourseDto = {
        title: 'Test Course',
        description: 'Test Description',
        instructorId: 'instructor-id',
        price: 99.99,
        difficultyLevel: 'intermediate' as any,
      };

      const mockCourse = {
        id: 'course-id',
        ...createCourseDto,
        slug: 'test-course',
        isPublished: false,
        createdAt: new Date(),
      };

      mockPrismaService.course.findUnique.mockResolvedValue(null);
      mockPrismaService.course.create.mockResolvedValue(mockCourse);

      const result = await service.create(createCourseDto);

      expect(result).toEqual(mockCourse);
      expect(mockPrismaService.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: createCourseDto.title,
            slug: 'test-course',
          }),
        }),
      );
    });

    it('should throw error if course with same title exists', async () => {
      const createCourseDto = {
        title: 'Existing Course',
        instructorId: 'instructor-id',
      };

      mockPrismaService.course.findUnique.mockResolvedValue({
        id: 'existing-id',
        slug: 'existing-course',
      });

      await expect(service.create(createCourseDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      const mockCourses = [
        { id: '1', title: 'Course 1' },
        { id: '2', title: 'Course 2' },
      ];

      mockPrismaService.course.findMany.mockResolvedValue(mockCourses);
      mockPrismaService.course.count.mockResolvedValue(2);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result.data).toEqual(mockCourses);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by search term', async () => {
      mockPrismaService.course.findMany.mockResolvedValue([]);
      mockPrismaService.course.count.mockResolvedValue(0);

      await service.findAll({ search: 'react' });

      expect(mockPrismaService.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const mockCourse = {
        id: 'course-id',
        title: 'Test Course',
      };

      mockPrismaService.course.findFirst.mockResolvedValue(mockCourse);

      const result = await service.findOne('course-id');

      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('togglePublish', () => {
    it('should publish a course if it has modules', async () => {
      const mockCourse = { id: 'course-id', title: 'Test' };

      mockPrismaService.course.findFirst.mockResolvedValue(mockCourse);
      mockPrismaService.courseModule.count.mockResolvedValue(1);
      mockPrismaService.course.update.mockResolvedValue({
        ...mockCourse,
        isPublished: true,
      });

      const result = await service.togglePublish('course-id', true);

      expect(result.isPublished).toBe(true);
    });

    it('should throw error if publishing course without modules', async () => {
      const mockCourse = { id: 'course-id', title: 'Test' };

      mockPrismaService.course.findFirst.mockResolvedValue(mockCourse);
      mockPrismaService.courseModule.count.mockResolvedValue(0);

      await expect(service.togglePublish('course-id', true)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getCourseAnalytics', () => {
    it('should return course analytics', async () => {
      const mockCourse = {
        id: 'course-id',
        title: 'Test Course',
      };

      mockPrismaService.course.findFirst.mockResolvedValue(mockCourse);
      mockPrismaService.courseEnrollment.count
        .mockResolvedValueOnce(10) // total enrollments
        .mockResolvedValueOnce(7); // completions
      mockPrismaService.courseReview.findMany.mockResolvedValue([
        { rating: 4 },
        { rating: 5 },
      ]);
      mockPrismaService.userProgress.aggregate.mockResolvedValue({
        _avg: { timeSpentMinutes: 120 },
      });

      const result = await service.getCourseAnalytics('course-id');

      expect(result.totalEnrollments).toBe(10);
      expect(result.completions).toBe(7);
      expect(result.completionRate).toBe(70);
      expect(result.averageRating).toBe(4.5);
    });
  });
});
