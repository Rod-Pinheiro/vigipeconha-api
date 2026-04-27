import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/auth/enums/role.enum';

describe('NotificacoesController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;
  let createdNotificationId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const userEmail = `notifuser${Date.now()}@example.com`;
    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nome: 'Notif User',
        email: userEmail,
        senha: 'password123',
      });
    userToken = userRes.body.accessToken;

    const adminEmail = `notifadmin${Date.now()}@example.com`;
    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nome: 'Notif Admin',
        email: adminEmail,
        senha: 'password123',
        role: Role.ADMINISTRADOR,
      });
    adminToken = adminRes.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/notificacoes (POST)', () => {
    it('should allow authenticated user to create notification', () => {
      return request(app.getHttpServer())
        .post('/notificacoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dataNotificacao: '2026-04-27',
          horarioOcorrencia: '14:30:00',
          notificanteNome: 'Test User',
          tipoLocal: 'residencia',
          localizacao: {
            municipio: 'Campinas',
            bairro: 'Centro',
            latitude: -23.5505,
            longitude: -46.6333,
          },
          especies: [
            {
              especieId: '550e8400-e29b-41d4-a716-446655440000',
            },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          createdNotificationId = res.body.id;
        });
    });

    it('should deny unauthenticated user from creating notification', () => {
      return request(app.getHttpServer())
        .post('/notificacoes')
        .send({
          dataNotificacao: '2026-04-27',
          horarioOcorrencia: '14:30:00',
          notificanteNome: 'Test User',
          tipoLocal: 'residencia',
          localizacao: {
            municipio: 'Campinas',
            bairro: 'Centro',
          },
        })
        .expect(401);
    });
  });

  describe('/notificacoes (GET)', () => {
    it('should allow authenticated user to list notifications', async () => {
      const res = await request(app.getHttpServer())
        .post('/notificacoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dataNotificacao: '2026-04-27',
          horarioOcorrencia: '14:30:00',
          notificanteNome: 'Test User',
          tipoLocal: 'residencia',
          localizacao: {
            municipio: 'Campinas',
            bairro: 'Centro',
            latitude: -23.5505,
            longitude: -46.6333,
          },
          especies: [{ especieId: '550e8400-e29b-41d4-a716-446655440000' }],
        });
      createdNotificationId = res.body.id;

      return request(app.getHttpServer())
        .get('/notificacoes')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should deny unauthenticated user from listing notifications', () => {
      return request(app.getHttpServer()).get('/notificacoes').expect(401);
    });
  });

  describe('/notificacoes/:id (PUT)', () => {
    it('should allow admin to update notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/notificacoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dataNotificacao: '2026-04-27',
          horarioOcorrencia: '14:30:00',
          notificanteNome: 'Test User',
          tipoLocal: 'residencia',
          localizacao: {
            municipio: 'Campinas',
            bairro: 'Centro',
            latitude: -23.5505,
            longitude: -46.6333,
          },
          especies: [{ especieId: '550e8400-e29b-41d4-a716-446655440000' }],
        });
      createdNotificationId = res.body.id;

      return request(app.getHttpServer())
        .put(`/notificacoes/${createdNotificationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          referencia: 'Updated by admin',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.referencia).toBe('Updated by admin');
        });
    });

    it('should deny regular user from updating notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/notificacoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dataNotificacao: '2026-04-27',
          horarioOcorrencia: '14:30:00',
          notificanteNome: 'Test User',
          tipoLocal: 'residencia',
          localizacao: {
            municipio: 'Campinas',
            bairro: 'Centro',
          },
          especies: [{ especieId: '550e8400-e29b-41d4-a716-446655440000' }],
        });
      createdNotificationId = res.body.id;

      return request(app.getHttpServer())
        .put(`/notificacoes/${createdNotificationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          referencia: 'Hacked',
        })
        .expect(403);
    });
  });

  describe('/notificacoes/:id (DELETE)', () => {
    it('should allow admin to delete notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/notificacoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dataNotificacao: '2026-04-27',
          horarioOcorrencia: '14:30:00',
          notificanteNome: 'Test User',
          tipoLocal: 'residencia',
          localizacao: {
            municipio: 'Campinas',
            bairro: 'Centro',
          },
          especies: [{ especieId: '550e8400-e29b-41d4-a716-446655440000' }],
        });
      createdNotificationId = res.body.id;

      return request(app.getHttpServer())
        .delete(`/notificacoes/${createdNotificationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny regular user from deleting notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/notificacoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dataNotificacao: '2026-04-27',
          horarioOcorrencia: '14:30:00',
          notificanteNome: 'Test User',
          tipoLocal: 'residencia',
          localizacao: {
            municipio: 'Campinas',
            bairro: 'Centro',
          },
          especies: [{ especieId: '550e8400-e29b-41d4-a716-446655440000' }],
        });
      createdNotificationId = res.body.id;

      return request(app.getHttpServer())
        .delete(`/notificacoes/${createdNotificationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('/notificacoes/:id/fotos (POST)', () => {
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/notificacoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dataNotificacao: '2026-04-27',
          horarioOcorrencia: '14:30:00',
          notificanteNome: 'Test User',
          tipoLocal: 'residencia',
          localizacao: {
            municipio: 'Campinas',
            bairro: 'Centro',
          },
          especies: [{ especieId: '550e8400-e29b-41d4-a716-446655440000' }],
        });
      createdNotificationId = res.body.id;
    });

    it('should allow authenticated user to upload photos', () => {
      const pngPath = require('path').join(__dirname, 'fixtures', 'test.png');
      const fs = require('fs');
      const pngBuffer = fs.readFileSync(pngPath);
      return request(app.getHttpServer())
        .post(`/notificacoes/${createdNotificationId}/fotos`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('fotos', pngBuffer, 'test.png')
        .expect(201);
    });

    it('should deny unauthenticated user from uploading photos', () => {
      return request(app.getHttpServer())
        .post(`/notificacoes/${createdNotificationId}/fotos`)
        .attach('fotos', Buffer.from('test'), 'test.png')
        .expect(401);
    });

    it('should reject upload with no files', () => {
      return request(app.getHttpServer())
        .post(`/notificacoes/${createdNotificationId}/fotos`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(500);
    });

    it('should reject invalid file types', () => {
      return request(app.getHttpServer())
        .post(`/notificacoes/${createdNotificationId}/fotos`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('fotos', Buffer.from('not-a-image'), 'test.txt')
        .expect(500);
    });
  });
});
