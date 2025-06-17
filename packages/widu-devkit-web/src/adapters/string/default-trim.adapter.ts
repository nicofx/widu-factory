import { Adapter } from '../base/adapter.interface';

export class DefaultTrimAdapter implements Adapter<string | null | undefined, string> {
  apply(value: string | null | undefined): string {
    return value?.trim() ?? '';
  }
}
