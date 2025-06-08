import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { CrudSmoke } from '../../src/crud-magic/testing/crud-smoke.helper';
import { describe, it } from 'node:test';

describe('CrudMagic – Cards Smoke', () => {
  let app: INestApplication;

  beforeAll(async () => {
    try {
      const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
      app = mod.createNestApplication();
      await app.init();
    } catch (err) {
      console.error('❌ beforeAll failed:', err);
      throw err;                       // hace fallar la suite antes de los tests
    }
  });

  afterAll(() => app.close());

  it('cards CRUD => all 2xx', async () => {
    await new CrudSmoke(app).test('cards', {
      name: 'Ping',
      type: 'deity',
      archetype: 'guerrero',
      universe: 'Test',
      factors: { dominio:1, autoridad:1, cultura:1, impacto:1, simbolo:0, auraOculta:0 }
    });
  });
});
