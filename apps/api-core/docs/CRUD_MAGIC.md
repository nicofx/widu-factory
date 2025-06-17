Cómo añadir lógica extra sin romper la “magia”
Con Crud Magic ya tienes:

Rutas CRUD “core” → generadas a partir de tu CardSchema.

Un service “implícito” (envuelto dentro de CrudMagicModule) que sólo necesita el modelo Mongoose para hacer find/create/update/delete.

Cuando quieres algo más allá del CRUD (por ejemplo “calcular combos”, “importar desde CSV externo” o “invocar IA”), tienes tres formas de enchufarlo:

Opción	Cuándo elegirla	Dónde va el código	Ventaja
1. Hooks (beforeCreate, afterUpdate, etc.)	La función extra se ejecuta justo antes/después de una operación CRUD.	Archivo card.hooks.ts (ya usamos uno).	No agrega rutas ni service nuevo; lógica puntual.
2. Provider / Service propio	Necesitas lógica de dominio reutilizable (p. ej. CardsDomainService.computeSynergy(id)).	cards-domain.service.ts y lo registras como provider en el mismo módulo.	Puedes inyectarlo en hooks, otros módulos o controladores personalizados.
3. Controlador personalizado	Quieres rutas REST adicionales (/cards/:id/synergy, /cards/report/pdf).	Crea un controller que extienda o conviva con el que genera Crud Magic.	Añades endpoints sin tocar las rutas CRUD core.

1 · Usar un hook (lo más liviano)
Ya viste el beforeCreateCard. Basta con añadir otro:

export async function afterFindCard(cards: Card[]) {
  // añadir campo virtual “comboScore” a cada resultado
  cards.forEach(c => {
    c['comboScore'] = computeCombo(c);
  });
}
y en CrudMagicModule.forFeature:

hooks: {
  beforeCreate: ['beforeCreateCard'],
  afterFind:    ['afterFindCard'],
},
No se crea ningún Service adicional.

2 · Añadir un service de dominio
// apps/api-core/src/logic/cards/cards-domain.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card } from './schemas/card.schema';

@Injectable()
export class CardsDomainService {
  constructor(@InjectModel(Card.name) private model: Model<Card>) {}

  /** lógica compleja, reutilizable desde hooks o controllers */
  async computeSynergy(cardId: string) {
    const card = await this.model.findById(cardId).lean();
    // ...algoritmo...
    return { score: /* … */, combos: /* … */ };
  }
}

y en tu módulo:
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
    CrudMagicModule.forFeature([/* …config… */]),
  ],
  providers: [
    { provide: 'beforeCreateCard', useValue: beforeCreateCard },
    CardsDomainService,                      // Nuevo provider
  ],
})
export class CardsModule {}
Ahora puedes inyectar CardsDomainService:

Desde un hook (beforeCreateCard llama a this.cardsDomainService.computeSynergy()).

Desde un controlador adicional (ver Opción 3).

3 · Controlador adicional para rutas propias
// apps/api-core/src/logic/cards/cards-extra.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { CardsDomainService } from './cards-domain.service';

@Controller('cards')
export class CardsExtraController {
  constructor(private readonly domain: CardsDomainService) {}

  /** GET /cards/:id/synergy */
  @Get(':id/synergy')
  async getSynergy(@Param('id') id: string) {
    return this.domain.computeSynergy(id);
  }
}
Regístralo en el mismo módulo:
controllers: [CardsExtraController],
Las rutas CRUD automáticas siguen vivas (/cards, /cards/:id…), y ahora además tienes /cards/:id/synergy.

4 · ¿Y si quisiera sobrecargar el service CRUD?
Si Crud Magic expone una interfaz -por ejemplo CrudMagicService<T>- puedes:

@Injectable()
export class CardsCrudService extends CrudMagicService<Card> {
  // override create() para añadir auditoría extra
  async create(dto: any) {
    const created = await super.create(dto);
    // … lógica adicional …
    return created;
  }
}
y en CrudMagicModule.forFeature pasas:

serviceOverride: CardsCrudService,
(Sólo si tu versión de Crud Magic soporta serviceOverride; si no, usa hooks + domain service).

Patrón recomendado
90 % de la lógica → hooks (validaciones, cálculos, side-effects cortos).

Algoritmos reutilizables → CardsDomainService.

Endpoints extra → CardsExtraController que llama a tu service.

De esta forma:

No tocas lo que Crud Magic ya hace bien.

Mantienes Single Responsibility (CRUD auto, dominio aparte).

Puedes testear tu domain service de forma aislada.

Ejemplo rápido de combinación
// hook
export async function beforeCreateCard(dto, ctx) {
  dto.createdBy = ctx.user.id;                       // info del request
  dto.W_total   = sumFactors(dto.factors);
  dto.rarity    = rarityFromW(dto.W_total);
  dto.stats     = allocateStats(dto.archetype, baseBudget[dto.rarity], dto.W_total);
}

// service extra
@Injectable()
export class CardAuditService {
  async logCreate(cardId: string, userId: string) { /* … */ }
}

// controlador extra
@Controller('cards')
export class CardAuditController {
  constructor(private readonly audit: CardAuditService) {}

  @Post(':id/audit')
  auditCard(@Param('id') id: string, @Body() dto) {
    return this.audit.logCreate(id, dto.userId);
  }
}


Resumen
Crud Magic te libera del 80 % del boilerplate.

Para extender:

Hooks → lógica puntual ligada a operaciones CRUD.
Providers/Services → lógica de dominio reutilizable.
Controladores propios → rutas REST adicionales.

No necesitas modificar el código interno de Crud Magic; simplemente registras tus extras en el mismo módulo Nest.