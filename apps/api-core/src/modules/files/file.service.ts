// apps/api-core/src/modules/files/file.service.ts

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileMeta } from './schemas/file.schema';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FileService {
  private s3Client: S3Client;
  private bucketName: string;
  
  constructor(
    @InjectModel(FileMeta.name) private readonly fileMetaModel: Model<FileMeta>,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME')!;
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    
    
  }
  
  /**
  * Sube el buffer recibido a S3 bajo un key generado.
  */
  async uploadFile(
    tenantId: string,
    userId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<FileMeta> {
    const extension = originalName.split('.').pop();
    const fileId = uuidv4();
    const bucketKey = `${tenantId}/${userId}/${fileId}.${extension}`;
    
    // 1) subir a S3
    const putCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: bucketKey,
      Body: fileBuffer,
      ContentType: mimeType,
    });
    try {
      await this.s3Client.send(putCommand);
    } catch (err) {
      throw new InternalServerErrorException('Error subiendo archivo a S3.');
    }
    
    // 2) Generar URL pre-signed (válida 1 hora)
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: bucketKey,
    });
    const url = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 });
    
    // 3) Guardar metadata en Mongo
    const newMeta = new this.fileMetaModel({
      tenantId,
      userId,
      bucketKey,
      url,
      contentType: mimeType,
    });
    return await newMeta.save();
  }
  
  /**
  * Generar una nueva URL pre-signed (por si expira la anterior).
  */
  async getPresignedUrl(id: string, tenantId: string): Promise<string> {
    const meta = await this.fileMetaModel.findOne({ _id: id, tenantId }).exec();
    if (!meta) {
      throw new NotFoundException('Archivo no encontrado');
    }
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: meta.bucketKey,
    });
    return await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 });
  }
}
