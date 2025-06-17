// apps/api-core/src/logic/projects/projects.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { CrudMagicModule } from '../../crud-magic/crud-magic.module';

@Module({
  imports: [
    // 1) Registro normal de Mongoose para el esquema de Project
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),

    // 2) Engancharlo a CrudMagicModule.forFeature(), incluyendo los campos obligatorios
    CrudMagicModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
        permisos: {
          create: 'projects.create',
          read:   'projects.read',
          update: 'projects.update',
          delete: 'projects.delete',
        },
        // Opcionales: si no los necesitas ahora, puedes omitirlos o dejar vacíos
        filtros: {
          buscarTexto:   ['name', 'description'], // p. ej. campos de texto para búsqueda
          camposExactos: ['status'],              // p. ej. filtros exactos
          camposRango:   ['budget'],              // p. ej. filtros por rango numérico
        },
        relaciones: [
          // si Project tuviera alguna relación a popular, por ejemplo:
          // { campo: 'owner', model: 'User', permisoLeer: 'users.read' }
        ],
        softDelete:   true,   // habilita soft‐delete para Project
        audit:        true,   // habilita auditoría (create/update/delete)
        importExport: true,   // habilita endpoints de import/export CSV
        bulkOps:      true,   // habilita bulk-create / bulk-update
        fieldLevelAuth: false, // si no necesitas seguridad a nivel de campo, pon false
        protectedFields: {
          // p. ej. si “budget” solo lo puede editar quien tenga ‘projects.editBudget’
          // budget: 'projects.editBudget'
        },
        hooks: {
          // aquí podrías listar hooks a ejecutar antes/después de cada operación
          // beforeCreate: ['sendWelcomeEmail', 'populateDefaults'],
          // afterUpdate:  ['logProjectUpdate'],
        },
        relationsPopulateDefault: [
          // por ejemplo, ['owner', 'teamMembers']
        ],
      },
    ]),
  ],
})
export class ProjectsModule {}
