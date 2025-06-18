import { Injectable, signal, effect } from '@angular/core';
import { ViewportService } from '@widu/devkit-web';

/**
 * SidePanelService v2.2 corregido
 *
 * • Mantiene isOpen y posición.
 * • Añade/remueve body.panel-open-{left|right} **solo en desktop**
 *   para habilitar el push en CSS.
 * • Actualiza la var --sidebar-offset con el ancho actual.
 */
@Injectable({ providedIn: 'root' })
export class SidePanelService {
  private _open  = signal(false);
  private _pos   = signal<'left' | 'right'>('left');
  private _width = signal('18rem');

  readonly isOpen     = this._open.asReadonly();
  readonly position   = this._pos.asReadonly();
  readonly panelWidth = this._width.asReadonly();

  constructor(private vp: ViewportService) {
    effect(() => {
      const body = document.body;
      // Siempre quitar ambas clases...
      body.classList.remove('panel-open-left', 'panel-open-right');

      // ...y si estamos en desktop + abierto, agregar la correcta
      if (this.isOpen() && !this.vp.isMobile()) {
        body.classList.add(`panel-open-${this.position()}`);
        document.documentElement.style.setProperty(
          '--sidebar-offset',
          this.panelWidth()
        );
      } else {
        // En mobile o cerrado, quitar cualquier offset
        document.documentElement.style.setProperty('--sidebar-offset', '0');
      }
    });
  }

  /** Alterna abierto/cerrado */
  toggle() { this._open.update(v => !v); }
  open()   { this._open.set(true); }
  close()  { this._open.set(false); }

  /** (Invocado por el componente) */
  _setPos(p: 'left' | 'right') { this._pos.set(p); }
  _setWidth(w: string)         { this._width.set(w); }
}
