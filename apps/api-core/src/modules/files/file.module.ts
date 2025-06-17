// apps/api-core/src/modules/files/file.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileMeta, FileMetaSchema } from './schemas/file.schema';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileMeta.name, schema: FileMetaSchema }]),
    forwardRef(() => AuthModule), // Para proteger rutas con JwtAuthGuard
  ],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
