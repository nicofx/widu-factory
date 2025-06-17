# Módulo DataTable

**WiduDataTableComponent** es un componente de tabla ultra-completo y **reactivo**:
- Basado en **Signals** para todo el estado interno.
- Registro dinámico por instancia (`id`) con **DynamicRegistryService**.
- Slots y Events para editar, borrar y extender.

---

## Definición
<widu-data-table
  id="myTable"
  [config]="{
    columns: [...],
    data: [...],
    enableActions: true,
    enableColumnConfig: true,
    enableColumnFilters: true,
    enableInlineEdit: true,
    enableHoverEffect: true,
    pageSize: 5
  }"
  (edit)="onEdit($event)"
  (delete)="onDelete($event)"
></widu-data-table>
Parámetros (Inputs / Outputs)
Parámetro	Tipo	Descripción
@Input() id	string	ID único para el registro en DynamicRegistryService.
@Input() config	DataTableConfig	Objeto con toda la configuración (columnas, datos y flags).
@Output() edit	EventEmitter<any>	Emite la fila a editar (click en ✏️).
@Output() delete	EventEmitter<any>	Emite la fila a borrar (click en 🗑️).

DataTableConfig:

Campo	Tipo	Descripción
columns	ColumnDef[]	Definición de columnas (key, label, tooltip?, class?).
data	any[]	Array de objetos a mostrar.
enableActions?	boolean	Muestra columna de acciones.
enableColumnConfig?	boolean	Permite mostrar/ocultar columnas.
enableColumnFilters?	boolean	Muestra inputs de filtro por columna.
enableInlineEdit?	boolean	Activa modo edición inline de una fila.
enableHoverEffect?	boolean	Aplica estilo hover a filas.
tableClass?	string	Clase Tailwind personalizada para <table>.
headerClass?	string	Clase Tailwind para <thead>.
footerClass?	string	Clase Tailwind para contenedor de paginación.
rowClass?	string	Clase Tailwind para filas <tr>.
pageSize?	number	Cantidad de filas por página (default 10).

Cómo extenderlo
Crear una variante:

Importa WiduDataTableComponent.

Crea un componente wrapper que inyecte su propio @Input() config o inputs más finos (e.g. @Input() columns, @Input() data).

Proyectar templates personalizados:

Usa <ng-template #rowTpl let-row> y pásalo via @Input() para renderizar columnas a medida.

Control dinámico:

Desde un contenedor con DynamicRegistryService.get('myTable') podés llamar .updateBody({ data: nuevaLista }) o cambiar flags.

Ejemplos de uso

1. Tabla básica
columns = [
  { key:'name', label:'Nombre' },
  { key:'email', label:'Email' },
  { key:'age', label:'Edad' }
];
data = [
  { name:'Ana', email:'ana@mail.com', age: 28 },
  { name:'Luis', email:'luis@mail.com', age: 34 }
];


<widu-data-table
  id="tabla1"
  [config]="{ columns, data, enableActions: true }"
  (edit)="editar($event)"
  (delete)="borrar($event)"
></widu-data-table>

2. Tabla con filtros y configuración de columnas
<widu-data-table
  id="tabla2"
  [config]="{ columns, data, enableColumnConfig: true, enableColumnFilters: true }"
></widu-data-table>

3. Actualización dinámica (desde un panel)
// obtenés la instancia del servicio
const svc = registry.get('tabla1');
// refrescás datos
svc.updateBody({ data: nuevosDatos });
// ocultás columna
svc.updateBody({ enableColumnConfig: true });