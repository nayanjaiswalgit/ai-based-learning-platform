import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Subscription (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/subscriptions/plans (GET)', () => {
    it('should return all subscription plans', () => {
      return request(app.getHttpServer())
        .get('/subscriptions/plans')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/subscriptions/plans/:planId (GET)', () => {
    it('should return 404 for non-existent plan', () => {
      return request(app.getHttpServer())
        .get('/subscriptions/plans/non-existent-id')
        .expect(404);
    });
  });

  describe('/subscriptions (POST)', () => {
    it('should reject invalid subscription data', () => {
      return request(app.getHttpServer())
        .post('/subscriptions')
        .send({
          userId: 'invalid',
          // missing required fields
        })
        .expect(400);
    });
  });
});
