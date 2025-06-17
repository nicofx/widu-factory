// libs/web-devkit/src/lib/dynamic/services/dynamic-registry.service.ts
import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable()
export class DynamicRegistryService<TService> {
  /** Señal interna con el mapa de servicios */
  private _map: WritableSignal<Map<string, TService>> =
    signal(new Map());

  /** Señal pública de sólo lectura */
  readonly map = this._map.asReadonly();

  /** Registra (añade) una instancia al mapa */
  register(id: string, svc: TService) {
    this._map.update(map => {
      map.set(id, svc);
      return map;
    });
  }

  /** Desregistra (elimina) una instancia del mapa */
  unregister(id: string) {
    this._map.update(map => {
      map.delete(id);
      return map;
    });
  }

  /** Obtiene el servicio asociado a un id */
  get(id: string): TService | undefined {
    return this._map().get(id);
  }
}
