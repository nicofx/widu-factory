import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { describe } from 'node:test';

describe('CrudMagic smoke', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = mod.createNestApplication();
    await app.init();
  });

  afterAll(async () => app.close());

  it('/cards CRUD 2xx', async () => {
    const srv = app.getHttpServer();
    const create = await request(srv).post('/cards').send({
      name:'Ping', type:'deity', archetype:'guerrero', universe:'Test',
      factors:{dominio:1,autoridad:1,cultura:1,impacto:1,simbolo:0,auraOculta:0}
    }).expect(201);

    const id = create.body._id;
    await request(srv).get(`/cards/${id}`).expect(200);
    await request(srv).patch(`/cards/${id}`).send({ lore:'X'}).expect(200);
    await request(srv).delete(`/cards/${id}`).expect(200);
  });
});
