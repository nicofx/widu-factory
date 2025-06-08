# 🪄 Crud Magic — Guía Rápida v2.0

> **TL;DR**  
> *Define tu _schema_ → declara un objeto → tienes un CRUD completo con filtros, permisos, soft-delete, auditoría, Swagger, SDK y CLI.*

---

## 1. Instalación y prerequisitos

```bash
pnpm add @nestjs/swagger swagger-ui-express          # runtime
pnpm add -D openapi-generator-cli tsx change-case@4  # dev/CLI



# script (desde la raíz del monorepo)
npm run crud:new <Entidad> -- [flags]

# ejemplos
npm run crud:new projects -- --preset simpleCrud
npm run crud:new relics   -- --softDelete --audit
Flag	Efecto
--preset simpleCrud	soft-delete ✅ · audit ✅ · importExport ❌ · bulkOps ❌
--preset catalog	soft-delete ❌ · audit ❌ · importExport ✅ · bulkOps ✅
--softDelete etc.	Sobrescribe cualquier ajuste del preset.

La CLI genera:
apps/api-core/src/logic/<entidad>/
  ├─ schemas/<entidad>.schema.ts
  └─ <entidad>.module.ts   (CrudMagicModule.forFeature([...]))

3. Declarar un módulo manualmente
CrudMagicModule.forFeature([
  {
    name: 'Card',
    schema: CardSchema,
    permisos: {
      create: 'cards.create',
      read:   'cards.read',
      update: 'cards.update',
      delete: 'cards.delete'
    },
    preset: 'simpleCrud',        // o flags individuales
    hooks: {
      beforeCreate: ['beforeCreateCard']
    }
  }
]);
Todos los flags son validados por AJV al arrancar.
Error → CrudMagic config invalid → …


4. Hooks tipados
import { CrudHook } from '@app/crud-magic/typings';
import { Card } from './schemas/card.schema';

export const beforeCreateCard: CrudHook<Card, Partial<Card>> = (dto, ctx) => {
  dto.tenantId = ctx.tenantId;
  // …lógica W_total, rarity…
};
5. Swagger & SDK
Arranca la app con GENERATE_SWAGGER=true
→ genera /api (UI) + docs/openapi.json.

Pipeline CI corre:
npx openapi-generator-cli generate \
  -i docs/openapi.json -g typescript-axios -o libs/sdk
Front-end importa:

import { Configuration, CardsApi } from '@widu/sdk';

6. Logging y debug
# en local
export CRUD_MAGIC_DEBUG=true
API log:
[CrudMagic] POST /cards → Card (85 ms)
