import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/auth/enums/role.enum';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create admin user and get token
    const adminEmail = `admin${Date.now()}@example.com`;
    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nome: 'Admin User',
        email: adminEmail,
        senha: 'password123',
        role: Role.ADMINISTRADOR,
      });
    adminToken = adminRes.body.accessToken;
    adminUser = adminRes.body.user;

    // Create regular user and get token
    const userEmail = `user${Date.now()}@example.com`;
    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nome: 'Regular User',
        email: userEmail,
        senha: 'password123',
      });
    userToken = userRes.body.accessToken;
    regularUser = userRes.body.user;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should allow admin to list all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should deny regular user from listing all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny access without token', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should allow authenticated user to get user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(regularUser.id);
        });
    });
  });

  describe('/users/:id (PUT)', () => {
    it('should allow admin to update user', () => {
      return request(app.getHttpServer())
        .put(`/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.nome).toBe('Updated Name');
        });
    });

    it('should deny regular user from updating user', () => {
      return request(app.getHttpServer())
        .put(`/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          nome: 'Hacked Name',
        })
        .expect(403);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should allow admin to delete user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny regular user from deleting user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
