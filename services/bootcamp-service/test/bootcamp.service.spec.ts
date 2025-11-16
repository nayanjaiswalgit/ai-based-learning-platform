import { Test, TestingModule } from '@nestjs/testing';
import { BootcampService } from '../src/modules/bootcamp/bootcamp.service';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('BootcampService', () => {
  let service: BootcampService;
  let prisma: PrismaService;

  const mockPrismaService = {
    bootcamp: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BootcampService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BootcampService>(BootcampService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new bootcamp', async () => {
      const bootcampData = {
        title: 'Full Stack Development',
        slug: 'full-stack-dev',
        description: 'Learn full stack development',
        durationWeeks: 12,
        syllabus: [],
        instructorId: 'instructor-123',
        price: 999,
        difficultyLevel: 'intermediate',
      };

      const expectedResult = {
        id: 'bootcamp-123',
        ...bootcampData,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.bootcamp.findUnique.mockResolvedValue(null);
      mockPrismaService.bootcamp.create.mockResolvedValue(expectedResult);

      const result = await service.create(bootcampData as any);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.bootcamp.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: bootcampData.title,
          slug: bootcampData.slug,
        }),
        include: {
          instructor: {
            select: {
              id: true,
              username: true,
              email: true,
              profilePictureUrl: true,
            },
          },
        },
      });
    });

    it('should throw error if slug already exists', async () => {
      const bootcampData = {
        title: 'Full Stack Development',
        slug: 'full-stack-dev',
        description: 'Learn full stack development',
        durationWeeks: 12,
        syllabus: [],
        instructorId: 'instructor-123',
        price: 999,
        difficultyLevel: 'intermediate',
      };

      mockPrismaService.bootcamp.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(bootcampData as any)).rejects.toThrow(
        'Bootcamp with this slug already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all published bootcamps', async () => {
      const bootcamps = [
        { id: '1', title: 'Bootcamp 1', isPublished: true },
        { id: '2', title: 'Bootcamp 2', isPublished: true },
      ];

      mockPrismaService.bootcamp.findMany.mockResolvedValue(bootcamps);

      const result = await service.findAll({ isPublished: true });

      expect(result).toEqual(bootcamps);
      expect(mockPrismaService.bootcamp.findMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a bootcamp by id', async () => {
      const bootcamp = {
        id: 'bootcamp-123',
        title: 'Full Stack Development',
        slug: 'full-stack-dev',
      };

      mockPrismaService.bootcamp.findFirst.mockResolvedValue(bootcamp);

      const result = await service.findOne('bootcamp-123');

      expect(result).toEqual(bootcamp);
    });

    it('should throw error if bootcamp not found', async () => {
      mockPrismaService.bootcamp.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Bootcamp not found',
      );
    });
  });
});
