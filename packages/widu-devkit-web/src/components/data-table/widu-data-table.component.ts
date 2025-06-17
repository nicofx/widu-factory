import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseDynamicComponent, DynamicComponentService } from '../../services/dynamic';

export interface ColumnDef {
  key: string;
  label: string;
  tooltip?: string;
  class?: string;
}

export interface DataTableConfig {
  columns: ColumnDef[];
  data: any[];
  enableActions?: boolean;
  enableColumnConfig?: boolean;
  enableColumnFilters?: boolean;
  enableInlineEdit?: boolean;
  enableHoverEffect?: boolean;
  tableClass?: string;
  headerClass?: string;
  footerClass?: string;
  rowClass?: string;
  pageSize?: number;
}

@Component({
  selector: 'widu-data-table',
  standalone: true,
  imports: [CommonModule],
  providers: [DynamicComponentService<DataTableConfig, any>],
  templateUrl: './widu-data-table.component.ts',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WiduDataTableComponent
  extends BaseDynamicComponent<DataTableConfig, any>
  implements OnChanges
{
  /** ID único para el registro dinámico */
  @Input() id: string = '';

  /** Configuración completa de la tabla */
  @Input() config!: DataTableConfig;

  /** Acciones sobre fila */
  @Output() edit   = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  /** Señales locales para filtros y paginación */
  private filters     = signal<{ [key: string]: string }>({});
  private currentPage = signal(0);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'] && this.config) {
      // Enviamos toda la config al DynamicComponentService
      this.svc.updateBody({ ...this.config });
      this.currentPage.set(0);
      this.filters.set({});
    }
  }

  /** Accesos a body de la señal */
  get columns()             { return this.svc.data().body.columns; }
  get rawData()             { return this.svc.data().body.data; }
  get enableActions()       { return !!this.svc.data().body.enableActions; }
  get enableColumnFilters(){ return !!this.svc.data().body.enableColumnFilters; }
  get enableHover()         { return !!this.svc.data().body.enableHoverEffect; }
  get tableClass()          { return this.svc.data().body.tableClass ?? ''; }
  get headerClass()         { return this.svc.data().body.headerClass ?? ''; }
  get footerClass()         { return this.svc.data().body.footerClass ?? ''; }
  get rowClass()            { return this.svc.data().body.rowClass ?? ''; }
  get pageSize()            { return this.svc.data().body.pageSize ?? 10; }

  /** Filtro reactivo */
  private filteredData = computed(() => {
    const f = this.filters();
    return this.rawData.filter((row: any) =>
      this.columns.every((col: any) => {
        const term = f[col.key]?.toLowerCase() ?? '';
        const val  = (row[col.key]?.toString() ?? '').toLowerCase();
        return val.includes(term);
      })
    );
  });

  /** Cálculo de total de páginas */
  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredData().length / this.pageSize));
  }

  /** Datos paginados */
  pagedData(): any[] {
    const start = this.currentPage() * this.pageSize;
    return this.filteredData().slice(start, start + this.pageSize);
  }

  /** Handler de filtro en columna */
  onFilter(key: string, value: string) {
    this.filters.update(f => ({ ...f, [key]: value }));
    this.currentPage.set(0);
  }

  /** Navegación de páginas */
  prevPage() { this.currentPage.update(p => Math.max(0, p - 1)); }
  nextPage() { this.currentPage.update(p => Math.min(this.totalPages() - 1, p + 1)); }
}
