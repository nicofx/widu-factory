// src/core/pipeline/subsystems/service/service-resolver.subsystem.ts
import { Injectable } from '@nestjs/common';

/**
 * Este subsistema actúa como contenedor de servicios accesibles desde steps.
 * Permite registrar (registrar<T>(Clase, instancia)) servicios NestJS
 * y luego resolverlos con resolve<T>(Clase).
 */
@Injectable()
export class ServiceResolverSubsystem {
  private services = new Map<new (...args: any[]) => any, any>();

  /**
   * Registrar un servicio bajo su clase (token).
   * Ejemplo: resolver.register(PlansService, this.plansServiceInstance)
   */
  register<T>(token: new (...args: any[]) => T, instance: T): void {
    this.services.set(token, instance);
  }

  /**
   * Recuperar un servicio previamente registrado.
   * Ejemplo: const plans = resolver.resolve(PlansService)
   */
  resolve<T>(token: new (...args: any[]) => T): T | undefined {
    return this.services.get(token);
  }

  /**
   * Limpiar todos los servicios registrados (al terminar la petición).
   */
  clear(): void {
    this.services.clear();
  }
}
