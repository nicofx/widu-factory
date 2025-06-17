// crud-magic/src/interfaces/pagination.interface.ts

/**
 * PaginationOptions
 *
 * Opciones que pasaremos a BaseCrudService.findAll:
 *   - filter: criterios Mongoose
 *   - sort: objeto { campo: 1 | -1 }
 *   - skip: cantidad a omitir
 *   - limit: cantidad máxima a devolver
 */
export interface PaginationOptions {
  filter: Record<string, any>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
  page: number;
}
