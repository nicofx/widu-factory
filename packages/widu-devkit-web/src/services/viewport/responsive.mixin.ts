// responsive.mixin.ts
import { AppInjector } from '../app-injector';
import { ViewportService } from './viewport.service';

type Ctor<T = {}> = new (...args: any[]) => T;

export function ResponsiveMixin<TBase extends Ctor>(Base: TBase) {
  return class extends Base {
    public vp: ViewportService;

    constructor(...args: any[]) {
      super(...args);
      this.vp = AppInjector.injector!.get(ViewportService);
    }
  };
}
