/*
🛠️ Cómo usarlo
1. Global (broadcast)
constructor(private ctx: AppContextService) {}

saveUserName(name: string) {
  this.ctx.set('user.name', name);      // global
}

username$ = this.ctx.read$('user.name'); // se reactualiza en cualquier lado

2. Scoped por componente / instancia
En un Sidebar «left»
const SIDEBAR_ID = 'sidebar-left';
this.ctx.set('collapsed', true, SIDEBAR_ID);

Otro Sidebar «right» no se ve afectado:
this.ctx.read$('collapsed', 'sidebar-right');

3. Patch parcial
this.ctx.patch('profile', { age: 31 }, 'user-card-42');

🔄 Ejemplo de “Broadcast vs Targeted”
Actualiza el badge en TODOS los widgets de tipo “notificaciones”
this.ctx.set('notifications.count', 8);

Solo actualiza el widget de usuario #42
this.ctx.set('user.status', 'offline', 'user-widget-42');
*/

import { Injectable, signal, computed, effect, WritableSignal } from '@angular/core';

/** Tipo genérico de los valores guardados */
export type CtxValue = any;

/** Clave compuesta -> "scope:key" (scope vacío = global) */
type Key = string;

/** Utilidad para componer la clave */
const makeKey = (scope: string | undefined, key: string): Key =>
  scope ? `${scope}:${key}` : key;

@Injectable({ providedIn: 'root' })
export class AppContextService {
  /** Diccionario interno reactivo <Key, any> */
  private _ctxSig = signal<Record<Key, CtxValue>>({});

  // ---------- APIs públicas ----------

  /**
   * Lee reactivamente un valor (como `computed`).
   * Si `scope` es omitido, lee la clave global.
   */
  read$ = (key: string, scope?: string) =>
    computed(() => this._ctxSig()[makeKey(scope, key)]);

  /**
   * Escribe (o sobreescribe) un valor completo.
   */
  set(key: string, value: CtxValue, scope?: string): void {
    this._ctxSig.update(obj => ({ ...obj, [makeKey(scope, key)]: value }));
  }

  /**
   * Aplica un patch “shallow merge” si el valor actual es dict/obj.
   * Si no existía, actúa como `set`.
   */
  patch(key: string, partial: Record<string, unknown>, scope?: string): void {
    this._ctxSig.update(obj => {
      const k = makeKey(scope, key);
      const current = obj[k] ?? {};
      return { ...obj, [k]: { ...current, ...partial } };
    });
  }

  /**
   * Elimina una clave del contexto.
   */
  remove(key: string, scope?: string): void {
    this._ctxSig.update(obj => {
      const clone = { ...obj };
      delete clone[makeKey(scope, key)];
      return clone;
    });
  }

  /**
   * Limpia todas las claves bajo un scope
   * (o todo el contexto si no se pasa scope).
   */
  clear(scope?: string): void {
    this._ctxSig.update(obj => {
      if (!scope) return {};
      const clone: Record<Key, CtxValue> = {};
      Object.entries(obj).forEach(([k, v]) => {
        if (!k.startsWith(scope + ':')) clone[k] = v;
      });
      return clone;
    });
  }

  // ---------- Helpers convenientes ----------

  /** Devuelve `true` si existe la clave */
  has(key: string, scope?: string): boolean {
    return makeKey(scope, key) in this._ctxSig();
  }

  /** Obtiene el valor en modo “snapshot” (no reactivo) */
  snapshot(key: string, scope?: string): CtxValue {
    return this._ctxSig()[makeKey(scope, key)];
  }
}
