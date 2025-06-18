// with-context.mixin.ts
import { AppInjector } from '../app-injector';
import { AppContextService } from './app-context.service';

type Ctor<T = {}> = new (...args: any[]) => T;

export function withContext<TBase extends Ctor>(Base: TBase = class {} as TBase) {
  return class extends Base {
    public ctx: AppContextService;

    constructor(...args: any[]) {
      super(...args);
      // obtenemos el servicio desde el injector global
      this.ctx = AppInjector.injector!.get(AppContextService);
    }

    readCtx<T = any>(key: string) {
      return this.ctx.read$(key, (this as any).ctxScope) as any;
    }

    setCtx(key: string, value: any) {
      this.ctx.set(key, value, (this as any).ctxScope);
    }
  };
}
