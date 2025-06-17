// src/crud-magic/decorators/hook.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const HOOK_KEY = 'CRUD_HOOKS';

/**
 * @CrudHook('beforeCreate')
 */
export const CrudHook = (hookName: string) => SetMetadata(HOOK_KEY, hookName);
