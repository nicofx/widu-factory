import {
  Component,
  Input,
  HostBinding,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidePanelService } from './side-panel.service';
import { ViewportService }    from '@widu/devkit-web';

/** Modelo de menú para acordeón */
export interface MenuItem {
  label: string;
  children?: MenuItem[];
  open?: boolean;
}

@Component({
  selector: 'widu-side-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
})
export class SidePanelComponent implements AfterViewInit {
  /** Lado donde aparece */
  @Input() position: 'left' | 'right' = 'left';
  /** Ancho: '18rem', '320px', '30%'… */
  @Input() width = '18rem';
  /** No tapar header: '64px' o 'var(--header-height)' */
  @Input() offsetTop = '0';
  /** No tapar footer: '64px' o 'var(--footer-height)' */
  @Input() offsetBottom = '0';
  /** Menú jerárquico opcional */
  @Input() menu: MenuItem[] = [];

  constructor(
    public sp: SidePanelService,
    private vp: ViewportService
  ) {}

  // — Bindings para clases y CSS variables —
  @HostBinding('class.open')               get open()   { return this.sp.isOpen(); }
  @HostBinding('class.left')               get left()   { return this.position === 'left'; }
  @HostBinding('class.right')              get right()  { return this.position === 'right'; }
  @HostBinding('style.--panel-width')      get w()      { return this.width; }
  @HostBinding('style.--panel-offset-top') get top()    { return this.offsetTop; }
  @HostBinding('style.--panel-offset-bottom') get bottom(){ return this.offsetBottom; }

  ngAfterViewInit() {
    // Registramos en el service para el push desktop
    this.sp._setPos(this.position);
    this.sp._setWidth(this.width);
  }

  /** Alterna submenú (acordeón) */
  toggleItem(item: MenuItem) {
    if (item.children) item.open = !item.open;
  }

  /** Cierra el panel */
  close() {
    this.sp.close();
  }
}
