// dynamic-component.service.ts
import { Injectable, signal } from '@angular/core';
import { DynamicComponentData } from '../models/dynamic-component.model';

@Injectable()
export class DynamicComponentService<Body = any, Footer = any> {
  private _data = signal<DynamicComponentData<Body, Footer>>({
    body: {} as Body,
    footer: {} as Footer,
    loading: false,
    updatedAt: undefined
  });
  readonly data = this._data.asReadonly();

  updateBody(patch: Partial<Body>) {
    this._data.update(d => ({
      ...d,
      body: { ...d.body, ...patch },
      updatedAt: new Date()
    }));
  }
  updateFooter(patch: Partial<Footer>) {
    this._data.update(d => ({
      ...d,
      footer: { ...d.footer, ...patch },
      updatedAt: new Date()
    }));
  }
  // …otros métodos comunes (load, updatePartial…)
}
