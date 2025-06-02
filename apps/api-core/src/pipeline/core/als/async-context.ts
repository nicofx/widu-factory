import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestContext } from '../../interfaces/context.interface';

/**
 * `AsyncContext` centraliza el almacenamiento del `RequestContext`
 * usando AsyncLocalStorage para que cualquier código descendiente
 * pueda recuperarlo sin pasar `requestId`.
 */
class AsyncContext {
  private readonly als = new AsyncLocalStorage<RequestContext>();

  run<T>(ctx: RequestContext, fn: () => Promise<T>): Promise<T> {
    return this.als.run(ctx, fn);
  }

  get(): RequestContext | undefined {
    return this.als.getStore();
  }
}

export const asyncContext = new AsyncContext();
