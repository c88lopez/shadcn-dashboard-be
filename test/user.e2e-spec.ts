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

    const graphqlResponses = new Map<string, request.Response>();

    beforeAll(async () => {
      response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);
    });

    describe('CRUD operations', () => {
      beforeAll(async () => {
        graphqlResponses.set(
          'getAllUsers',
          await request(app.getHttpServer())
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${response.body.access_token}`)
            .send({ query: '{users { cuid email username }}' }),
        );

        const adminCuid =
          graphqlResponses.get('getAllUsers').body.data.users[0].cuid;

        graphqlResponses.set(
          'getAdminUser',
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

        graphqlResponses.set(
          'createUser',
          await request(app.getHttpServer())
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${response.body.access_token}`)
            .send({
              query:
                'mutation CreateUser ($createUserData: CreateUserInput!) { createUser(createUserData: $createUserData) { cuid email username }}',
              variables: {
                createUserData: {
                  username: 'new user username',
                  email: 'dummy@vandelay.com',
                  password: '234234234',
                },
              },
            }),
        );

        graphqlResponses.set(
          'removeUser',
          await request(app.getHttpServer())
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${response.body.access_token}`)
            .send({
              query:
                'mutation RemoveUser ($cuid: String!) { removeUser(cuid: $cuid) { cuid }}',
              variables: {
                cuid: graphqlResponses.get('createUser').body.data.createUser
                  .cuid,
              },
            }),
        );
      });

      it('should get list of users', async () => {
        expect(
          graphqlResponses.get('getAllUsers').body.data.users.length,
        ).toBeGreaterThanOrEqual(1);
      });

      it('should get user', async () => {
        expect(
          graphqlResponses.get('getAdminUser').body.data.user,
        ).toHaveProperty('email', credentials.email);
      });

      it('should create user', async () => {
        expect(
          graphqlResponses.get('createUser').body.data.createUser,
        ).toHaveProperty('email', 'dummy@vandelay.com');
      });

      it('should remove user', async () => {
        expect(
          graphqlResponses.get('removeUser').body.data.removeUser,
        ).toHaveProperty(
          'cuid',
          graphqlResponses.get('createUser').body.data.createUser.cuid,
        );
      });
    });
  });
});
