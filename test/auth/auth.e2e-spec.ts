import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { z } from 'zod';
import { AppModule } from '../../src/app.module';

describe('Auth e2e', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    const credentials = {
      email: 'admin@vandelay-labs.com',
      password: '123123123',
    };

    let response: request.Response;

    beforeEach(() => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials)
        .then((r) => {
          response = r;
        });
    });

    it('jwt payload should contain email and sub with valid cuid', () => {
      const cuid = z.string().cuid();
      const payload = Buffer.from(
        response.body.access_token.split('.')[1],
        'base64',
      ).toString();

      expect(JSON.parse(payload)).toHaveProperty('email', credentials.email);
      expect(cuid.safeParse(JSON.parse(payload).sub)).toHaveProperty(
        'success',
        true,
      );
    });
  });
});
