import {
  Component,
  Input,
  HostBinding,
  AfterViewInit,
  ElementRef,
  signal
} from '@angular/core';
import { CommonModule }       from '@angular/common';
import { SidePanelService }   from './side-panel.service';
import { ViewportService }    from '@widu/devkit-web';

export interface MenuItem { label: string; children?: MenuItem[]; open?: boolean; }

@Component({
  selector: 'widu-side-panel',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
})
export class SidePanelComponent implements AfterViewInit {
  /** configurables desde el padre */
  @Input() position: 'left'|'right' = 'left';
  @Input() width        = '18rem';
  @Input() offsetTop    = '0';
  @Input() offsetBottom = '0';
  @Input() menu: MenuItem[] = [];
  @Input() closeOnClickOutside = true;
  @Input() initialLocked       = false;

  /** signals internos */
  private _locked = signal<boolean>(false);

  /** expuestos como getters (para el template) */
  get locked() { return this._locked(); }

  constructor(
    public sp: SidePanelService,
    public vp: ViewportService,
    private hostEl: ElementRef<HTMLElement>
  ) {}

  @HostBinding('class.open')  get open()  { return this.sp.isOpen(); }
  @HostBinding('class.left')  get left()  { return this.position==='left'; }
  @HostBinding('class.right') get right() { return this.position==='right'; }
  @HostBinding('class.locked')    get lockedClass() { return this.locked; }
  @HostBinding('style.--panel-width')      get w() { return this.width; }
  @HostBinding('style.--panel-offset-top')    get t() { return this.offsetTop; }
  @HostBinding('style.--panel-offset-bottom') get b() { return this.offsetBottom; }

  ngAfterViewInit() {
    // inicializamos posición/ancho en el service
    this.sp._setPos(this.position);
    this.sp._setWidth(this.width);
    // inicializamos el locked desde el input
    this._locked.set(this.initialLocked);
  }

  /** toggle pin/unpin */
  toggleLock() {
    this._locked.update(v => !v);
  }

  /** acordeón */
  toggleItem(item: MenuItem) {
    if (item.children) item.open = !item.open;
  }

  /** cerrado al click fuera */
  onClickOutside() {
    if (this.open && this.closeOnClickOutside && !this.locked) {
      this.sp.close();
    }
  }

  /** cerrado por X o Escape */
  close() {
    if (!this.locked) {
      this.sp.close();
    }
  }
}
