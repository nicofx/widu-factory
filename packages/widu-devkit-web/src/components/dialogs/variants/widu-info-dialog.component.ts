import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WiduDialogComponent } from '../widu-dialog.component';

@Component({
  selector: 'widu-info-dialog',
  standalone: true,
  imports: [CommonModule, WiduDialogComponent],
  templateUrl: './widu-info-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WiduInfoDialogComponent {
  @Input() id!: string;
  @Input() title = 'Información';
  @Input() content = '';
  @Input() closeText = 'Cerrar';

  @Output() close = new EventEmitter<void>();
}
