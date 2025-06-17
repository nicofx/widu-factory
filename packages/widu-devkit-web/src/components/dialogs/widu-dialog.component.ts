import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseDynamicComponent, DynamicComponentService } from 'packages/widu-devkit-web/src/services/dynamic';

@Component({
  selector: 'widu-dialog',
  standalone: true,
  imports: [CommonModule],
  providers: [DynamicComponentService<any, any>],
  templateUrl: './widu-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WiduDialogComponent
  extends BaseDynamicComponent<any, any>
{
  /** Único ID para registro en el DynamicRegistryService */
  @Input() id: string = '';

  /** Tailwind helpers personalizables */
  @Input() width = 'max-w-lg';
  @Input() bg = 'bg-white';
  @Input() rounded = 'rounded-xl';
  @Input() shadow = 'shadow-xl';
  @Input() padding = 'p-6';
}
