import { inject } from '@angular/core';
import { ViewportService } from './viewport.service';

export function ResponsiveMixin<TBase extends new (...a: any[]) => {}>(Base: TBase) {
  return class extends Base {
    public vp = inject(ViewportService);
    /* ahora this.vp.isMobile() en cualquier componente */
  };
}
