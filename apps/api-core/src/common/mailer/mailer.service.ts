// apps/api-core/src/common/mailer/mailer.service.ts

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import * as ejs from 'ejs';
import { readFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter | undefined;
  private readonly logger = new Logger(MailerService.name);
  private useSES: boolean;

  constructor(private readonly configService: ConfigService) {
    // Elegir entre SMTP o AWS SES según variable de entorno
    this.useSES = configService.get<string>('MAIL_PROVIDER') === 'ses';

    if (this.useSES) {
      // Configuración de AWS SES
      const region = configService.get<string>('AWS_REGION');
      const accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID');
      const secretAccessKey = configService.get<string>('AWS_SECRET_ACCESS_KEY');

      // No usamos nodemailer en este caso, sino el SDK de AWS
      this.transporter = undefined;
    } else {
      // Configuración SMTP con nodemailer
      const host = configService.get<string>('SMTP_HOST');
      const port = configService.get<number>('SMTP_PORT');
      const user = configService.get<string>('SMTP_USER');
      const pass = configService.get<string>('SMTP_PASS');

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true para 465, false para otros
        auth: { user, pass },
      });
    }
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const filePath = join(__dirname, '../../mail-templates', `${templateName}.ejs`);
    const templateStr = await readFile(filePath, 'utf-8');
    return ejs.render(templateStr, context);
  }

  /**
   * Envío genérico de correo.
   */
  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    if (this.useSES) {
      // Enviar con AWS SES
      const sesClient = new SESClient({ region: this.configService.get<string>('AWS_REGION') });
      const rawMessage = [
        `From: ${this.configService.get<string>('SES_FROM_EMAIL')}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        html,
      ].join('\n');

      const command = new SendRawEmailCommand({
        RawMessage: { Data: Buffer.from(rawMessage) },
      });
      try {
        await sesClient.send(command);
      } catch (err) {
        this.logger.error(`Error enviando correo SES a ${to}`, err);
        throw new InternalServerErrorException('Error al enviar correo (SES).');
      }
    } else {
      // Enviar con SMTP/Nodemailer
      try {
        if (!this.transporter) {
          throw new InternalServerErrorException('SMTP transporter is not configured.');
        }
        await this.transporter.sendMail({
          from: this.configService.get<string>('SMTP_FROM_EMAIL'),
          to,
          subject,
          html,
        });
      } catch (err) {
        this.logger.error(`Error enviando correo SMTP a ${to}`, err);
        throw new InternalServerErrorException('Error al enviar correo (SMTP).');
      }
    }
  }

  /**
   * Enviar correo de verificación de cuenta.
   */
  async sendVerificationEmail(
    tenantId: string,
    toEmail: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationLink = `${frontendUrl}/verify-email?token=${token}&tenant=${tenantId}`;

    const html = await this.renderTemplate('verify-account', {
      name,
      verificationLink,
    });

    await this.sendMail(toEmail, 'Verifica tu cuenta en WiduFactory', html);
  }

  /**
   * Enviar correo de restablecimiento de contraseña.
   */
  async sendPasswordResetEmail(
    tenantId: string,
    toEmail: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}&tenant=${tenantId}`;

    const html = await this.renderTemplate('reset-password', {
      name,
      resetLink,
    });

    await this.sendMail(toEmail, 'Restablece tu contraseña en WiduFactory', html);
  }

  /**
   * Notificación de cambio de rol.
   */
  async sendRoleChangeNotice(
    tenantId: string,
    toEmail: string,
    name: string,
    newRole: string,
  ): Promise<void> {
    const html = await this.renderTemplate('role-changed', {
      name,
      newRole,
    });
    await this.sendMail(toEmail, 'Tu rol ha cambiado en WiduFactory', html);
  }
}
