// packages/widu-devkit-web/src/services/app-injector.ts
import { Injectable, Injector } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppInjector {
  /** Será asignado en el constructor */
  static injector: Injector | null = null;

  constructor(injector: Injector) {
    AppInjector.injector = injector;
  }
}
