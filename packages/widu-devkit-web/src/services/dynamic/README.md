# Módulo DynamicComponents

Este sub-módulo agrupa un **patrón genérico** para construir componentes que:

- Exponen su propio estado interno con **Signals**.
- Se **registran** en un contenedor para ser controlados desde el padre sin ViewChild.
- Pueden **extenderse** fácilmente para Cards, Dialogs, Boxes, Charts, etc.

---

## 📁 Estructura

dynamic/
├── models/
│ └── dynamic-component.model.ts
├── services/
│ ├── dynamic-component.service.ts
│ └── dynamic-registry.service.ts
├── base/
│ └── base-dynamic.component.ts
├── examples/
│ ├── widu-card/
│ │ ├── widu-card.component.ts
│ │ └── widu-card.component.html
│ └── widu-dialog/
│ ├── widu-dialog.component.ts
│ └── widu-dialog.component.html
└── index.ts

---

## ⚙️ Instalación

Ya está dentro de tu workspace, así que en cualquier módulo Angular basta con:
import { WiduCardComponent } from '@your-org/web-devkit/dynamic';
No hay que añadir nada a NgModule: todos son standalone: true.

🔧 Conceptos clave
1. Modelo de datos genérico
export interface DynamicComponentData<Body = any, Footer = any> {
  body: Body;
  footer: Footer;
  loading: boolean;
  updatedAt?: Date;
}


2. Servicio de estado
DynamicComponentService

Mantiene un signal< DynamicComponentData >.

Métodos:

updateBody(patch: Partial<Body>)

updateFooter(patch: Partial<Footer>)

load(fetchFn) para cargas asíncronas.
DynamicRegistryService
Registro de instancias por id.
Expone un signal<Map<string, Service>> para descubrir y manipular a vuelo.

3. BaseDynamicComponent
export abstract class BaseDynamicComponent<B, F>
  implements OnInit, OnDestroy {
  @Input() id!: string;
  protected svc = inject(DynamicComponentService<B, F>);
  private registry = inject(
    DynamicRegistryService<DynamicComponentService<B, F>>,
    { optional: true }
  );
  readonly data = this.svc.data;

  ngOnInit() {
    if (!this.id) throw new Error('ID requerido');
    this.registry?.register(this.id, this.svc);
  }
  ngOnDestroy() {
    this.registry?.unregister(this.id);
  }
}


Lo extienden tus componentes concretos, por ejemplo:
@Component({ selector: 'widu-card', standalone: true, /*…*/ })
export class WiduCardComponent
  extends BaseDynamicComponent<ProfileBody, ProfileFooter> {}

4. Uso en el padre
<widu-cards-panel #panel>    <!-- componente que provee DynamicRegistryService -->
  <widu-card id="cardA"></widu-card>
  <widu-card id="cardB"></widu-card>
  <widu-dialog id="dlg1"></widu-dialog>
</widu-cards-panel>

<button (click)="panel.update('cardA').updateBody({ bio: 'Hola!' })">
  Cambiar bio de la A
</button>
panel.update('cardA') retorna la instancia de WiduCardService para esa card.

A partir de ahí usás sus métodos updateBody, updateFooter o load().

📈 Cómo extender
Define tu interfaz MyBody y MyFooter en /models.

Crea tu componente:
@Component({ selector: 'widu-box', /*…*/ })
export class WiduBoxComponent
  extends BaseDynamicComponent<MyBody, MyFooter> {}
Template: usa data().body y data().footer.

Regístralo en /examples o directamente en /index.ts.

🤝 Buenas prácticas
- Siempre pasar un @Input() id único por instancia.
- No subscribirte a Observables: usa svc.data() en template.
- Mantén tu lógica de negocio en el servicio, el componente solo renderiza.
- Si tu componente tiene lógica muy propia, puedes inyectar más servicios, ¡sin perder el patrón!