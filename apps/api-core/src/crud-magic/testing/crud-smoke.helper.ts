import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export class CrudSmoke {
  constructor(private readonly app: INestApplication) {}

  async test(path: string, sample: Record<string, any>) {
    const srv = this.app.getHttpServer();

    /* CREATE */
    const { body } = await request(srv).post(`/${path}`).send(sample).expect(201);
    const id = body._id;

    /* READ */
    await request(srv).get(`/${path}/${id}`).expect(200);

    /* UPDATE (no-op) */
    await request(srv).patch(`/${path}/${id}`).send({ updatedAt: new Date() }).expect(200);

    /* DELETE */
    await request(srv).delete(`/${path}/${id}`).expect(200);
  }
}
