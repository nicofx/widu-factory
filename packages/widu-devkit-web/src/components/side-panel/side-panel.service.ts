import { Injectable, signal, WritableSignal, effect } from '@angular/core';
import { ViewportService } from '@widu/devkit-web';

@Injectable({ providedIn: 'root' })
export class SidePanelService {
  private _open: WritableSignal<boolean> = signal(false);
  readonly isOpen = this._open.asReadonly();

  constructor(private vp: ViewportService) {
    /* Cierra automáticamente si cambia a mobile */
    effect(() => {
      if (this.vp.isMobile()) {
        this._open.set(false);
      }
    });
  }

  toggle() { this._open.update(v => !v); }
  open()   { this._open.set(true); }
  close()  { this._open.set(false); }
}
