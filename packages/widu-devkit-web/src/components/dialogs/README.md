## 📦 Dialogs Module

```markdown
# Módulo Dialogs

Componentes de diálogo (**WiduDialog**) basados en slots y Signals, para confirmaciones, mensajes de info y más.

---

## Definición

- **`WiduDialogComponent`**  
  Contenedor modal genérico con overlay, que expone 3 slots:  
  - `[dialog-header]`  
  - `[dialog-body]`  
  - `[dialog-footer]`  

  Cada instancia registra su propio servicio dinámico para control reactivo desde el contenedor padre.

---

## Parámetros (Inputs/Outputs)

| Parámetro        | Tipo               | Descripción                                              |
|------------------|--------------------|----------------------------------------------------------|
| `@Input() id`    | `string`           | Identificador único para el DynamicRegistryService.      |
| `@Input() width` | `string`           | Clases Tailwind para ancho máximo. (ej. `max-w-lg`)      |
| `@Input() bg`    | `string`           | Clase de fondo. (ej. `bg-white`)                         |
| `@Input() rounded`| `string`          | Clase para esquinas redondeadas. (ej. `rounded-xl`)      |
| `@Input() shadow`| `string`           | Clase para sombra. (ej. `shadow-xl`)                     |
| `@Input() padding`| `string`          | Clase para padding. (ej. `p-6`)                          |

**Variantes**:

- **`WiduConfirmDialogComponent`**  
  - `@Input() title`, `message`, `confirmText`, `cancelText`  
  - `@Output() confirm`, `cancel`

- **`WiduInfoDialogComponent`**  
  - `@Input() title`, `content`, `closeText`  
  - `@Output() close`

---

## Cómo extenderlo

1. **Crear nueva variante**: Importá `WiduDialogComponent` y usalo como wrapper.  
2. **Definí Inputs/Outputs** para tu caso de uso.  
3. **Ejemplo mínimo**:

   ```ts
   @Component({
     selector: 'widu-warning-dialog',
     standalone: true,
     imports: [CommonModule, WiduDialogComponent],
     template: `
       <widu-dialog [id]="id" bg="bg-yellow-50" border="border-yellow-300">
         <div dialog-header>{{ title }}</div>
         <div dialog-body>{{ warningText }}</div>
         <div dialog-footer>
           <button (click)="ack.emit()">Entendido</button>
         </div>
       </widu-dialog>
     `
   })
   export class WiduWarningDialogComponent {
     @Input() id!: string;
     @Input() title = 'Atención';
     @Input() warningText = '';
     @Output() ack = new EventEmitter<void>();
   }
Ejemplos de uso
Confirmación:
<widu-confirm-dialog
  id="dlgConfirm"
  title="Borrar ítem"
  message="¿Querés eliminar este elemento?"
  confirmText="Sí, borrar"
  cancelText="Cancelar"
  (confirm)="onConfirm()"
  (cancel)="onCancel()"
></widu-confirm-dialog>

Mensaje de info:
<widu-info-dialog
  id="dlgInfo"
  title="Información"
  content="Operación completada con éxito."
  closeText="Cerrar"
  (close)="onClose()"
></widu-info-dialog>

Control dinámico:

// en DialogsPanelComponent
const infoSvc = registry.get('dlgInfo');
infoSvc?.updateBody({ content: 'Nuevo mensaje dinámico' });