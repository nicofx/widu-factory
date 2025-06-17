// apps/api-core/src/modules/users/dto/user-profile-response.dto.ts

/**
 * DTO de respuesta para el perfil de usuario.
 * Mezcla campos de la cuenta (user) y del perfil extendido.
 * 
 * 🚀 Extensible: solo agregá o quitá campos según tu app.
 * 
 * Ejemplo de uso: para endpoints como /profile/me, /users/:id/profile, etc.
 */
export class UserProfileResponseDto {
  /** Email de login del usuario */
  readonly email!: string;

  /** Nombre público del usuario */
  readonly name?: string;

  /** Teléfono (opcional) */
  readonly phone?: string;

  /** URL del avatar (opcional) */
  readonly avatarUrl?: string;

  /** Bio o descripción breve (opcional) */
  readonly bio?: string;

  // Agregá acá los campos que quieras exponer como "parte del perfil"

  // Si tenés campos más específicos, agregalos así:
  // readonly location?: string;
  // readonly birthday?: Date;
  // readonly website?: string;
}
