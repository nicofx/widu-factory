import { Injectable, signal, WritableSignal, effect } from '@angular/core';
import { ViewportService } from '@widu/devkit-web';
@Injectable({ providedIn: 'root' })
export class SidebarService {
  private _isOpen: WritableSignal<boolean> = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  constructor(private vp: ViewportService) {
    // Cada vez que cambie isMobile, cierro en móvil automáticamente
    effect(() => {
      if (this.vp.isMobile()) {
        this._isOpen.set(false);
      }
    });
  }

  toggle() {
    this._isOpen.update(v => !v);
  }
  open() {
    this._isOpen.set(true);
  }
  close() {
    this._isOpen.set(false);
  }
}
