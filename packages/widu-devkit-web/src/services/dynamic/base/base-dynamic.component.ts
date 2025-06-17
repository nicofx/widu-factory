// base-dynamic.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { DynamicComponentService } from '../services/dynamic-component.service';
import { DynamicRegistryService } from '../services/dynamic-registry.service';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DynamicComponentService]
})
export abstract class BaseDynamicComponent<B = any, F = any>
  implements OnInit, OnDestroy
{
  @Input() id!: string;
  protected svc = inject(DynamicComponentService<B, F>);
  private registry = inject(DynamicRegistryService<DynamicComponentService<B, F>>, { optional: true });

  readonly data = this.svc.data;  // Signal para template

  ngOnInit() {
    if (!this.id) throw new Error(`${this.constructor.name} requiere @Input() id`);
    this.registry?.register(this.id, this.svc);
  }
  ngOnDestroy() {
    this.registry?.unregister(this.id);
  }
}
