import {
  Component, Input, HostBinding, OnInit, OnDestroy
} from '@angular/core';
import { SidePanelService } from './side-panel.service';
import { FocusTrapService } from '../../helpers/focus-trap.service';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../helpers/click-outside.directive';

@Component({
  selector: 'widu-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective] // añade CommonModule y ClickOutsideDirective en tu módulo si no usás standalone
})
export class SidePanelComponent implements OnInit, OnDestroy {
  /** 'left' | 'right' */
  @Input() position: 'left' | 'right' = 'right';
  /** cualquier CSS ancho válido: '320px', '25rem', '30%'… */
  @Input() width = '20rem';

  constructor(
    public sp: SidePanelService,
    private trap: FocusTrapService
  ) {}

  /* Host classes reactivas */
  @HostBinding('class.open')  get open()  { return this.sp.isOpen(); }
  @HostBinding('class.left')  get left()  { return this.position === 'left'; }
  @HostBinding('class.right') get right() { return this.position === 'right'; }

  /* width como CSS custom prop */
  @HostBinding('style.--panel-width') get w() { return this.width; }

  ngOnInit()  { this.trap.remember(); }
  ngOnDestroy() { this.trap.restore(); }

  close() { this.sp.close(); }
  esc()   { this.close(); }
}
