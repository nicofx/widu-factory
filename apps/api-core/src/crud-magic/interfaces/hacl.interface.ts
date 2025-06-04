// crud-magic/src/interfaces/hacl.interface.ts

/**
 * HACL internal interface
 *
 * Determina los métodos mínimos que nuestro HaclService debe exponer
 * para que BaseCrudController pueda invocarlo en cada operación.
 */
export interface HaclInterface {
  /**
   * Verifica que el usuario (payload JWT) tenga el permiso “permiso”
   * para operar en tenant “tenantId”.  
   * - Devuelve void si OK, o lanza ForbiddenException si no.
   */
  checkPermission(tenantId: string, user: any, permiso: string): Promise<void>;
}
