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
  selector: 'widu-confirm-dialog',
  standalone: true,
  imports: [CommonModule, WiduDialogComponent],
  templateUrl: './widu-confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WiduConfirmDialogComponent {
  @Input() id!: string;
  @Input() title = 'Confirmación';
  @Input() message = '¿Estás seguro?';
  @Input() confirmText = 'Sí';
  @Input() cancelText = 'No';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
