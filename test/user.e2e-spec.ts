import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('User e2e', () => {
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

  describe('GRAPHQL users', () => {
    const credentials = {
      email: 'admin@vandelay-labs.com',
      password: '123123123',
    };

    let response: request.Response;

    const graphqlResponses: request.Response[] = [];

    beforeAll(async () => {
      response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);
    });

    describe('CRUD operations', () => {
      beforeAll(async () => {
        graphqlResponses.push(
          await request(app.getHttpServer())
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${response.body.access_token}`)
            .send({ query: '{users { cuid email username }}' }),
        );

        const adminCuid = graphqlResponses[0].body.data.users[0].cuid;

        graphqlResponses.push(
          await request(app.getHttpServer())
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${response.body.access_token}`)
            .send({
              query:
                'query User ($cuid: String!) { user(cuid: $cuid) { cuid email username }}',
              variables: { cuid: adminCuid },
            }),
        );
      });

      it('should get list of users', async () => {
        expect(
          graphqlResponses[0].body.data.users.length,
        ).toBeGreaterThanOrEqual(1);
      });

      it('should get user', async () => {
        expect(graphqlResponses[1].body.data.user).toHaveProperty(
          'email',
          credentials.email,
        );
      });
    });
  });
});
