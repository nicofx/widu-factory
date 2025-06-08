// libs/crud-magic/src/utils/config-validator.ts
import schema from '../schemas/crud-magic.schema.json';
import AjvConstructor from 'ajv';
const ajv = new AjvConstructor({ allErrors: true });

export function validateCrudConfig(obj: unknown): void {
  if (!ajv.validate(schema, obj)) {
    const msg = ajv.errors!
    .map(e => `${e.instancePath || '(root)'} → ${e.message}`)
    .join(' | ');
    throw new Error(`CrudMagic config invalid ➜ ${msg}`);
  }
}
