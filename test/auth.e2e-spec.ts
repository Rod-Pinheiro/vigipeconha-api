import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/auth/enums/role.enum';

describe('AuthController (e2e)', () => {
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

  describe('/auth/register (POST)', () => {
    it('should register a new user as usuario_registrado by default', () => {
      const email = `test${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          nome: 'Test User',
          email,
          senha: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toBe(email);
          expect(res.body.user.role).toBe(Role.USUARIO_REGISTRADO);
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('should register a new user with admin role when specified', () => {
      const email = `admin${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          nome: 'Admin User',
          email,
          senha: 'password123',
          role: Role.ADMINISTRADOR,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.role).toBe(Role.ADMINISTRADOR);
        });
    });

    it('should reject register with existing email', () => {
      const email = `existing${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          nome: 'User One',
          email,
          senha: 'password123',
        })
        .expect(201)
        .then(() => {
          return request(app.getHttpServer())
            .post('/auth/register')
            .send({
              nome: 'User Two',
              email,
              senha: 'password123',
            })
            .expect(409);
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with correct credentials', async () => {
      const email = `login${Date.now()}@example.com`;

      await request(app.getHttpServer()).post('/auth/register').send({
        nome: 'Login Test',
        email,
        senha: 'password123',
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          senha: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.user.email).toBe(email);
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('should reject login with incorrect password', async () => {
      const email = `wrongpass${Date.now()}@example.com`;

      await request(app.getHttpServer()).post('/auth/register').send({
        nome: 'Wrong Pass',
        email,
        senha: 'password123',
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          senha: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          senha: 'password123',
        })
        .expect(401);
    });
  });
});
