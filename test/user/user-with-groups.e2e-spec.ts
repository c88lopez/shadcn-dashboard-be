import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaClient } from '@prisma/client';

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
    await app.get(PrismaClient).user.deleteMany({
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

    const graphqlResponses = new Map<string, request.Response['body']>();

    beforeAll(async () => {
      response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);
    });

    describe('CRUD operations', () => {
      const createUserData = {
        username: 'new-username-groups',
        email: 'with-groups@vandelay.com',
        password: '234234234',
      };

      const updateUserData = {
        username: createUserData.username + '-edit',
      };

      beforeAll(async () => {
        graphqlResponses.set(
          'getAllGroups',
          (
            await request(app.getHttpServer())
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('Authorization', `Bearer ${response.body.access_token}`)
              .send({ query: '{userGroups { cuid name }}' })
          ).body,
        );

        graphqlResponses.set(
          'getAllUsers',
          (
            await request(app.getHttpServer())
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('Authorization', `Bearer ${response.body.access_token}`)
              .send({ query: '{users { cuid email username }}' })
          ).body,
        );

        const adminCuid =
          graphqlResponses.get('getAllUsers').data.users[0].cuid;

        graphqlResponses.set(
          'getAdminUser',
          (
            await request(app.getHttpServer())
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('Authorization', `Bearer ${response.body.access_token}`)
              .send({
                query:
                  'query User ($cuid: String!) { user(cuid: $cuid) { cuid email username }}',
                variables: { cuid: adminCuid },
              })
          ).body,
        );

        graphqlResponses.set(
          'createUser',
          (
            await request(app.getHttpServer())
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('Authorization', `Bearer ${response.body.access_token}`)
              .send({
                query: `mutation CreateUser($createUserData: CreateUserInput!) { 
                  createUser(createUserData: $createUserData) { 
                    cuid email username 
                    groups { cuid } }
                }`,
                variables: {
                  createUserData: {
                    ...createUserData,
                    groups: [
                      graphqlResponses.get('getAllGroups').data.userGroups[0]
                        .cuid,
                    ],
                  },
                },
              })
          ).body,
        );

        graphqlResponses.set(
          'updateUser',
          (
            await request(app.getHttpServer())
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('Authorization', `Bearer ${response.body.access_token}`)
              .send({
                query: `mutation UpdateUser($cuid: String!, $updateUserData: UpdateUserInput!) { 
                  updateUser(cuid: $cuid, updateUserData: $updateUserData) {
                   username 
                  }
                }`,
                variables: {
                  cuid: graphqlResponses.get('createUser').data.createUser.cuid,
                  updateUserData,
                },
              })
          ).body,
        );

        graphqlResponses.set(
          'getAllUsersAfterUpdate',
          (
            await request(app.getHttpServer())
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('Authorization', `Bearer ${response.body.access_token}`)
              .send({ query: '{users { cuid email username }}' })
          ).body,
        );

        graphqlResponses.set(
          'removeUser',
          (
            await request(app.getHttpServer())
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('Authorization', `Bearer ${response.body.access_token}`)
              .send({
                query:
                  'mutation RemoveUser($cuid: String!) { removeUser(cuid: $cuid) { cuid }}',
                variables: {
                  cuid: graphqlResponses.get('createUser').data.createUser.cuid,
                },
              })
          ).body,
        );
      });

      it('should get list of users', async () => {
        expect(
          graphqlResponses.get('getAllUsers').data.users.length,
        ).toBeGreaterThanOrEqual(1);
      });

      it('should get user', async () => {
        expect(graphqlResponses.get('getAdminUser').data.user).toHaveProperty(
          'email',
          credentials.email,
        );
      });

      it('should create user with groups and return them', async () => {
        expect(
          graphqlResponses.get('createUser').data.createUser.groups,
        ).toHaveLength(1);
      });

      it('should update user', async () => {
        expect(
          graphqlResponses.get('updateUser').data.updateUser,
        ).toHaveProperty('username', updateUserData.username);
      });

      it('should get admin and updated user', async () => {
        expect(
          graphqlResponses.get('getAllUsersAfterUpdate').data.users.length,
        ).toBeGreaterThanOrEqual(2);
        expect(
          graphqlResponses.get('getAllUsersAfterUpdate').data.users[0],
        ).toHaveProperty('username', 'admin');
        expect(
          graphqlResponses.get('getAllUsersAfterUpdate').data.users[1],
        ).toHaveProperty('username', updateUserData.username);
      });

      it('should remove user', async () => {
        expect(
          graphqlResponses.get('removeUser').data.removeUser,
        ).toHaveProperty(
          'cuid',
          graphqlResponses.get('createUser').data.createUser.cuid,
        );
      });
    });
  });
});
