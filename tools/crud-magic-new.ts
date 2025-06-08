#!/usr/bin/env ts-node
import { Command } from 'commander';
import { paramCase, pascalCase } from 'change-case';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const cli = new Command()
  .argument('<Entity>')
  .option('--softDelete', 'Enable soft delete', false)
  .option('--audit', 'Enable audit', false)
  .parse();

const opts    = cli.opts();
const raw     = cli.args[0];
const name    = paramCase(raw);     // cards
const Class   = pascalCase(raw);    // Cards
const baseDir = join(__dirname, '..', 'apps/api-core/src/logic', name);

mkdirSync(join(baseDir, 'schemas'), { recursive: true });

/* 1. Schema --------------------------------------------------- */
writeFileSync(join(baseDir, `schemas/${name}.schema.ts`), `
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ${Class} extends Document {
  @Prop({ required: true }) name!: string;
}
export const ${Class}Schema = SchemaFactory.createForClass(${Class});
`);

/* 2. Module --------------------------------------------------- */
writeFileSync(join(baseDir, `${name}.module.ts`), `
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ${Class}, ${Class}Schema } from './schemas/${name}.schema';
import { CrudMagicModule } from '../../crud-magic/crud-magic.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ${Class}.name, schema: ${Class}Schema }]),
    CrudMagicModule.forFeature([{
      name: '${Class}',
      schema: ${Class}Schema,
      permisos: {
        create: '${name}.create',
        read:   '${name}.read',
        update: '${name}.update',
        delete: '${name}.delete'
      },
      softDelete: ${opts.softDelete},
      audit: ${opts.audit}
    }]),
  ],
})
export class ${Class}Module {}
`);

console.log(`✨  Scaffold listo: ${baseDir}`);
