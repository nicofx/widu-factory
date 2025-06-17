import {
  Component,
  Input,
  HostBinding,
  OnInit,
  signal,
  WritableSignal,
  effect
} from '@angular/core';
import { ViewportService } from '@widu/devkit-web';
import { MenuItem } from './sidebar.model';
import { CommonModule } from '@angular/common';
import { SidebarService } from './widu-sidebar.service';

@Component({
  selector: 'widu-sidebar',
  templateUrl: './widu-sidebar.component.html',
  styleUrls: ['./widu-sidebar.component.scss'],
  imports: [
    CommonModule
  ]
})
export class WiduSidebarComponent implements OnInit {
  @Input() position: 'left' | 'right' = 'left';
  @Input() initialOpen = true;
  @Input() fullHeight = true;
  @Input() offsetHeader = false;
  @Input() offsetFooter = false;
  @Input() menuItems: MenuItem[] = [];

  constructor(
    public sidebarSvc: SidebarService,
    public vp: ViewportService
  ) {}

  ngOnInit() {
    // Inicializamos SOLO UNA VEZ al montar: en desktop abrimos según initialOpen
    if (!this.vp.isMobile()) {
      this.sidebarSvc[ this.initialOpen ? 'open' : 'close' ]();
    }
  }

  toggle() {
    this.sidebarSvc.toggle();
  }

  trackByLabel(_: number, item: MenuItem) {
    return item.label;
  }

  // — Clases dinámicas leyendo Signals directamente —
  @HostBinding('class.sidebar--left')
  get left() { return this.position === 'left'; }

  @HostBinding('class.sidebar--right')
  get right() { return this.position === 'right'; }

  @HostBinding('class.sidebar--open')
  get open() { return this.sidebarSvc.isOpen(); }

  @HostBinding('class.sidebar--closed')
  get closed() { return !this.sidebarSvc.isOpen(); }

  // — Offset dinámico con CSS custom props —
  @HostBinding('style.--sidebar-top')
  get top() {
    return this.fullHeight
      ? '0'
      : this.offsetHeader
        ? 'var(--header-height)'
        : '0';
  }

  @HostBinding('style.--sidebar-bottom')
  get bottom() {
    return this.fullHeight
      ? '0'
      : this.offsetFooter
        ? 'var(--footer-height)'
        : '0';
  }
}