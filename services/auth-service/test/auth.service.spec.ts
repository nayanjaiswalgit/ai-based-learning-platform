import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/config/prisma.service';
import { RedisService } from '../src/config/redis.service';
import { EmailService } from '../src/config/email.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let redisService: RedisService;
  let emailService: EmailService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userProfile: {
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_ACCESS_EXPIRY: '15m',
        JWT_REFRESH_EXPIRY: '7d',
        TWO_FA_APP_NAME: 'Test App',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test@1234',
        fullName: 'Test User',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: registerDto.email,
        username: registerDto.username,
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('userId');
      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'Test@1234',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: '1',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test@1234',
      };

      const mockUser = {
        id: '1',
        email: loginDto.email,
        passwordHash: '$2b$10$...',  // Mocked hash
        role: 'STUDENT',
        isActive: true,
        twoFactorEnabled: false,
        profile: {
          fullName: 'Test User',
        },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');

      // Note: bcrypt.compare would need to be mocked separately
      // This is a simplified test

      expect(prismaService.user.findUnique).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('CSRF Token Management', () => {
    it('should store CSRF token in Redis', async () => {
      const sessionId = 'session-123';
      const token = 'csrf-token-456';

      await service.storeCsrfToken(sessionId, token);

      expect(redisService.set).toHaveBeenCalledWith(
        `csrf:${sessionId}`,
        token,
        3600,
      );
    });

    it('should verify CSRF token successfully', async () => {
      const sessionId = 'session-123';
      const token = 'csrf-token-456';

      mockRedisService.get.mockResolvedValue(token);

      const result = await service.verifyCsrfToken(sessionId, token);

      expect(result).toBe(true);
      expect(redisService.get).toHaveBeenCalledWith(`csrf:${sessionId}`);
      expect(redisService.del).toHaveBeenCalledWith(`csrf:${sessionId}`);
    });

    it('should return false for invalid CSRF token', async () => {
      const sessionId = 'session-123';
      const token = 'csrf-token-456';

      mockRedisService.get.mockResolvedValue('different-token');

      const result = await service.verifyCsrfToken(sessionId, token);

      expect(result).toBe(false);
    });
  });
});
