# Módulo Cards

Un conjunto de componentes de tarjeta (**WiduCard**) ultra-flexibles y reutilizables, basados en slots y Signals para manejo dinámico de datos.

---

## Definición

- **`WiduCardComponent`**  
  Componente base genérico que provee un contenedor con 4 slots:  
  - `[card-header]`  
  - `[card-media]`  
  - `[card-body]`  
  - `[card-footer]`  

  Usa **DynamicRegistryService** para exponer un servicio por instancia, permitiendo actualizar su contenido desde cualquier parte sin recargar el padre.

---

## Parámetros (Inputs/Outputs)

| Parámetro        | Tipo               | Descripción                                                          |
|------------------|--------------------|----------------------------------------------------------------------|
| `@Input() id`    | `string`           | Identificador único para el registro en el DynamicRegistryService.   |
| `@Input() bg`    | `string`           | Clase Tailwind para fondo. (ej. `bg-white`)                         |
| `@Input() textColor` | `string`       | Clase Tailwind para color de texto. (ej. `text-gray-900`)           |
| `@Input() border`| `string`           | Clase Tailwind para borde. (ej. `border border-gray-200`)           |
| `@Input() rounded`| `string`          | Clase para esquinas redondeadas. (ej. `rounded-lg`)                  |
| `@Input() shadow`| `string`           | Clase para sombra. (ej. `shadow-sm`)                                 |
| `@Input() padding`| `string`          | Clase para padding interno. (ej. `p-4`)                              |
| `@Input() hoverFeedback`| `boolean`   | Activa escala al pasar el ratón.                                      |
| `@Input() glow`  | `boolean`          | Activa efecto glow al pasar el ratón.                                 |
| `@Input() disabled`| `boolean`        | Deshabilita interacciones y aplica opacidad baja.                     |
| `@Input() skeleton`| `boolean`        | Activa animación de skeleton.                                         |
| `@Input() selected`| `boolean`        | Resalta con un ring de color primario.                                |
| `@Output() cardClick`| `EventEmitter<void>` | Emite al hacer click o pulsar Enter/Espacio.                |

---

## Cómo extenderlo

1. **Crear un wrapper**: Define un nuevo componente standalone que importe `WiduCardComponent`.  
2. **Exponer Inputs propios**: Cada variante (e.g. media, list, info) define sus `@Input()` y proyecta contenido en slots.  
3. **Ejemplo mínimo**:

   @Component({
     selector: 'widu-card-info',
     standalone: true,
     imports: [CommonModule, WiduCardComponent],
     template: `
       <widu-card [id]="id">
         <div card-header>{{ title }}</div>
         <div card-body><ng-content></ng-content></div>
         <div card-footer>{{ footer }}</div>
       </widu-card>
     `
   })
   export class WiduCardInfoComponent {
     @Input() id!: string;
     @Input() title = '';
     @Input() footer = '';
   }
Registry opcional: Si necesitás control dinámico por id, usá DynamicRegistryService.get(id).

Ejemplos de uso
Tarjeta simple:
<widu-card id="card1">
  <div card-header>Hola Mundo</div>
  <div card-body>Contenido de ejemplo.</div>
  <div card-footer>Footer</div>
</widu-card>


Tarjeta con imagen:
<widu-card id="card2" [hoverFeedback]="true" [glow]="true">
  <div card-header>Título</div>
  <img card-media src="https://picsum.photos/seed/1/400/200" />
  <div card-body>Texto bajo la imagen.</div>
</widu-card>

Actualización dinámica (desde un contenedor):
// en CardsPanelComponent
const svc = registry.get('card1');
svc?.updateBody({ /* merges con existing body si usaste esa estrategia */ });