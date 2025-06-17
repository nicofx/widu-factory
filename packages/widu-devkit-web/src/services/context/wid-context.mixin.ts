import { inject, WritableSignal } from '@angular/core';
import { AppContextService } from './app-context.service';

type Ctor<T = {}> = new (...args: any[]) => T;

/**
 * Helpers de AppContext; la subclase declara su @Input() ctxScope.
 */
export function withContext<TBase extends Ctor>(Base: TBase = class {} as TBase) {
  return class extends Base {
    /** Servicio de contexto (público) */
    public ctx = inject(AppContextService);

    /** Lectura reactiva */
    public readCtx<T = any>(key: string): WritableSignal<T | undefined> {
      return this.ctx.read$(key, (this as any).ctxScope) as WritableSignal<T | undefined>;
    }

    /** Escritura */
    public setCtx(key: string, value: any) {
      this.ctx.set(key, value, (this as any).ctxScope);
    }
  };
}
