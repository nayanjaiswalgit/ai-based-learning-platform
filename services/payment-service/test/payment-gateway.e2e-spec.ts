import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Payment Gateway (e2e)', () => {
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

  describe('/payment-gateway/select (GET)', () => {
    it('should return recommended gateway for US', () => {
      return request(app.getHttpServer())
        .get('/payment-gateway/select?countryCode=US')
        .expect(200)
        .expect((res) => {
          expect(res.body.gateway).toBe('stripe');
          expect(Array.isArray(res.body.supportedCurrencies)).toBe(true);
        });
    });

    it('should return Razorpay for India', () => {
      return request(app.getHttpServer())
        .get('/payment-gateway/select?countryCode=IN')
        .expect(200)
        .expect((res) => {
          expect(res.body.gateway).toBe('razorpay');
        });
    });
  });

  describe('/payment-gateway/currencies (GET)', () => {
    it('should return supported currencies for Stripe', () => {
      return request(app.getHttpServer())
        .get('/payment-gateway/currencies?gateway=stripe')
        .expect(200)
        .expect((res) => {
          expect(res.body.gateway).toBe('stripe');
          expect(Array.isArray(res.body.currencies)).toBe(true);
          expect(res.body.currencies).toContain('USD');
        });
    });
  });
});
