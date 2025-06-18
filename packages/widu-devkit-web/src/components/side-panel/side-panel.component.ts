import {
  Component,
  Input,
  HostBinding,
  HostListener,
  AfterViewInit,
  ElementRef
} from '@angular/core';
import { CommonModule }          from '@angular/common';
import { SidePanelService }      from './side-panel.service';
import { ViewportService }       from '@widu/devkit-web';

export interface MenuItem { label: string; children?: MenuItem[]; open?: boolean; }
import { ClickOutsideDirective } 
  from '../../../../../packages/widu-devkit-web/src/helpers/click-outside.directive';
@Component({
  selector: 'widu-side-panel',
  standalone: true,
  imports: [
    CommonModule,
    ClickOutsideDirective     // <-- Importá aquí
  ],
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
})
export class SidePanelComponent implements AfterViewInit {
  @Input() position: 'left'|'right' = 'left';
  @Input() width        = '18rem';
  @Input() offsetTop    = '0';
  @Input() offsetBottom = '0';
  @Input() menu: MenuItem[] = [];

  @Input() closeOnClickOutside = true;
  @Input() locked              = false;

  constructor(
    public sp: SidePanelService,
    private vp: ViewportService,
    private hostEl: ElementRef<HTMLElement>
  ) {

    console.log('ClickOutsideDirective ref =', ClickOutsideDirective);
  }

  @HostBinding('class.open')               get open()  { return this.sp.isOpen(); }
  @HostBinding('class.left')               get left()  { return this.position==='left'; }
  @HostBinding('class.right')              get right() { return this.position==='right'; }
  @HostBinding('style.--panel-width')      get w()     { return this.width; }
  @HostBinding('style.--panel-offset-top')    get t()  { return this.offsetTop; }
  @HostBinding('style.--panel-offset-bottom') get b()  { return this.offsetBottom; }

  ngAfterViewInit() {
    this.sp._setPos(this.position);
    this.sp._setWidth(this.width);
  }

  toggleItem(item: MenuItem) {
    if (item.children) item.open = !item.open;
  }

  /** Recibe el evento de la directiva */
  onClickOutside() {
    if (this.open && this.closeOnClickOutside && !this.locked) {
      this.sp.close();
    }
  }

  /** Click en la X o Esc */
  close() {
    if (!this.locked) {
      this.sp.close();
    }
  }
}
