import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';

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
    const prismaService = app.get(PrismaService);

    await prismaService.user.deleteMany({
      where: {
        email: {
          not: 'admin@vandelay-labs.com',
        },
      },
    });

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
      const createUserData = {
        username: 'new-username-no-groups',
        email: 'without-groups@vandelay.com',
        password: '234234234',
      };

      const updateUserData = {
        username: createUserData.username + '-edit',
      };

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
                'mutation CreateUser($createUserData: CreateUserInput!) { createUser(createUserData: $createUserData) { cuid email username }}',
              variables: {
                createUserData,
              },
            }),
        );

        graphqlResponses.set(
          'updateUser',
          await request(app.getHttpServer())
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${response.body.access_token}`)
            .send({
              query:
                'mutation UpdateUser($cuid: String!, $updateUserData: UpdateUserInput!) { updateUser(cuid: $cuid, updateUserData: $updateUserData) { username }}',
              variables: {
                cuid: graphqlResponses.get('createUser').body.data.createUser
                  .cuid,
                updateUserData,
              },
            }),
        );

        graphqlResponses.set(
          'getAllUsersAfterUpdate',
          await request(app.getHttpServer())
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${response.body.access_token}`)
            .send({ query: '{users { cuid email username }}' }),
        );

        graphqlResponses.set(
          'removeUser',
          await request(app.getHttpServer())
            .post('/graphql')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${response.body.access_token}`)
            .send({
              query:
                'mutation RemoveUser($cuid: String!) { removeUser(cuid: $cuid) { cuid }}',
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
        ).toHaveProperty('email', createUserData.email);
      });

      it('should update user', async () => {
        expect(
          graphqlResponses.get('updateUser').body.data.updateUser,
        ).toHaveProperty('username', updateUserData.username);
      });

      it('should get admin and updated user', async () => {
        expect(
          graphqlResponses.get('getAllUsersAfterUpdate').body.data.users.length,
        ).toBeGreaterThanOrEqual(2);
        expect(
          graphqlResponses.get('getAllUsersAfterUpdate').body.data.users[0],
        ).toHaveProperty('username', 'admin');

        const updatedUser = graphqlResponses
          .get('getAllUsersAfterUpdate')
          .body.data.users.find(
            (user) => user.username === updateUserData.username,
          );

        expect(updatedUser).toBeTruthy();
      });

      it('should remove user', async () => {
        expect(
          graphqlResponses.get('removeUser').body.data.removeUser,
        ).toHaveProperty(
          'cuid',
          graphqlResponses.get('createUser').body.data.createUser.cuid,
        );
      });

      it('should not create user with invalid email', async () => {
        const errorResponse = await request(app.getHttpServer())
          .post('/graphql')
          .set('content-type', 'application/json')
          .set('Authorization', `Bearer ${response.body.access_token}`)
          .send({
            query:
              'mutation CreateUser($createUserData: CreateUserInput!) { createUser(createUserData: $createUserData) { cuid email username }}',
            variables: {
              createUserData: {
                ...createUserData,
                email: 'I am not valid email',
              },
            },
          });

        expect(errorResponse.status).toBe(200);
        expect(errorResponse.body.errors).toHaveLength(1);
        expect(errorResponse.body.errors[0]).toHaveProperty(
          'message',
          'invalid email',
        );
      });

      it('should not update user with invalid email', async () => {
        const createUserResponse = await request(app.getHttpServer())
          .post('/graphql')
          .set('content-type', 'application/json')
          .set('Authorization', `Bearer ${response.body.access_token}`)
          .send({
            query:
              'mutation CreateUser($createUserData: CreateUserInput!) { createUser(createUserData: $createUserData) { cuid email username }}',
            variables: {
              createUserData,
            },
          });

        const updateUserResponse = await request(app.getHttpServer())
          .post('/graphql')
          .set('content-type', 'application/json')
          .set('Authorization', `Bearer ${response.body.access_token}`)
          .send({
            query:
              'mutation UpdateUser($cuid: String!, $updateUserData: UpdateUserInput!) { updateUser(cuid: $cuid, updateUserData: $updateUserData) { username }}',
            variables: {
              cuid: createUserResponse.body.data.createUser.cuid,
              updateUserData: {
                email: 'I am not valid email',
              },
            },
          });

        expect(updateUserResponse.status).toBe(200);
      });
    });
  });
});
