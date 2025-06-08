1. README/documentación mínima + diagrama de flujo
Circuito de Permisos, Roles y Features (WiduFactory)
mermaid
Copiar
Editar
graph TD
    subgraph Backend (NestJS)
        Plans --> Roles
        Roles --> Permissions
        Users -->|tiene| Roles
        Users -->|tiene| Planes
        Plans -->|roles por defecto| Users
        PermissionsGuard -.-> Endpoints
        RolesGuard -.-> Endpoints
        FeaturesGuard -.-> Endpoints
        Endpoints -->|JWT| Frontend
        HACLService -.-> Endpoints
    end
    subgraph Frontend (Angular)
        "JWT (roles, permissions, features)" --> "Guards & UI"
        "GET /me/permissions" --> "Guards & UI"
        "Guards & UI" --> "Mostrar/Ocultar/Deshabilitar"
    end
Resumen:

Backend: define y gestiona planes, roles, permisos y features.

Frontend: consume JWT y endpoints /me para saber qué puede mostrar/habilitar cada usuario.

Guards: tanto en backend como en frontend usan la misma semántica (nombre de permiso, role, feature).

2. Checklist de Endpoints y Funciones Clave
/roles: CRUD, mapping de permisos.

/permissions: CRUD.

/plans: CRUD, mapping de roles por plan.

/users/me: info completa, trae roles, permisos y features (del plan).

Login: devuelve JWT con roles, permisos y features.

Guardias: @Permissions, @Roles, @Features (a futuro), todos con nombre simple y compartido.

HACLService: punto único para consulta runtime (para lógica compleja).

3. Ejemplo en Angular: Guards nativos usando lenguaje compartido
a) El backend define los permisos y features en plano universal
Por ejemplo:

Permiso: project.create

Feature: ai-chat

Role: admin

b) El backend incluye esos permisos/features en el JWT:
json
Copiar
Editar
{
  "sub": "userId",
  "tenantId": "default",
  "roles": ["admin"],
  "permissions": ["project.create", "project.read"],
  "features": ["ai-chat", "export-data"]
}
c) El frontend Angular consume el JWT y/o endpoint /me:
Servicio de sesión simple (TypeScript):
typescript
Copiar
Editar
@Injectable({ providedIn: 'root' })
export class AuthService {
  private permissions: string[] = [];
  private features: string[] = [];
  private roles: string[] = [];
  
  // Llamado en login o refresh
  loadFromJwt(jwt: any) {
    this.permissions = jwt.permissions || [];
    this.features = jwt.features || [];
    this.roles = jwt.roles || [];
  }

  hasPermission(perm: string): boolean {
    return this.permissions.includes(perm);
  }
  hasFeature(feature: string): boolean {
    return this.features.includes(feature);
  }
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}
Guardias nativas de Angular:
typescript
Copiar
Editar
@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const required = route.data['permissions'] as string[];
    return required.every(p => this.auth.hasPermission(p));
  }
}

@Injectable({ providedIn: 'root' })
export class FeatureGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const required = route.data['features'] as string[];
    return required.every(f => this.auth.hasFeature(f));
  }
}
Uso en rutas Angular (app-routing.module.ts):
typescript
Copiar
Editar
const routes: Routes = [
  {
    path: 'proyectos',
    component: ProyectosComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['project.read'] }
  },
  {
    path: 'ai-chat',
    component: AiChatComponent,
    canActivate: [FeatureGuard],
    data: { features: ['ai-chat'] }
  }
];
Uso en plantillas (botones, secciones):
html
Copiar
Editar
<button *ngIf="auth.hasPermission('project.create')">
  Nuevo Proyecto
</button>
<button *ngIf="auth.hasFeature('ai-chat')">
  Usar AI Chat
</button>
4. Ejemplo de refresh de permisos
Cuando un admin cambia permisos/roles, el frontend puede:

Hacer logout/login (rústico pero seguro)

Pedir /me o /me/permissions y actualizar el AuthService.

En proyectos avanzados, implementar refresh silencioso del JWT o token rotativo.

5. Notas para extensibilidad
Dejar todo lo que se transmite de backend a frontend en strings simples, sin traducciones.

Si algún día hay scopes (project.read:own), solo se amplía el modelo, el guard sigue igual.

Si hay features avanzados, se agregan a JWT y endpoint /me igual que permisos.



Checklist para dejar el sistema RBAC/HACL listo, eficiente y escalable
A. Backend
Centralizar la definición de permisos y features

Que cada módulo declare explícitamente sus permisos y features como strings, en un archivo central o esquema por módulo.

Ejemplo: un archivo permissions.project.ts con todos los permisos de “project”.

Automatización de generación de permisos/features

Que el CRUD Magic (o un script de build) pueda generar automáticamente los permisos estándar al crear un módulo nuevo.

Ejemplo: al crear “clientes”, ya tenés clientes.create, clientes.read, etc.

Incluír features en el JWT y/o endpoints /me

Cuando un usuario hace login, su JWT debe traer roles, permisos y features activos.

Si agregás features después, que /me los traiga también.

Endpoints claros de consulta

/me (o /users/me): devuelve roles, permisos, features.

/roles, /permissions, /plans: CRUD puro.

Endpoints para mapear permisos↔roles y roles↔planes fácilmente.

Guards backend simples y unificados

@Permissions, @Roles, y en el futuro @Features, que lean del mismo esquema/nombres que el frontend.

Guards siempre usan tenantId para evitar fugas de datos.

Seeder robusto

Siempre debe haber tenant, role y plan por defecto.

El sistema tiene que ser usable desde el minuto uno, sin “setup manual”.

Documentación mínima

README o doc en el repo que explique el flujo y ejemplos, como los que te mandé.

B. Frontend (Angular)
Servicio AuthService universal

Centraliza roles, permisos y features.

Exponé métodos: hasPermission(), hasRole(), hasFeature().

Guards de permisos/features

Guards reutilizables que usan el AuthService.

Usá data en las rutas Angular para requerir permisos/features.

Ejemplo:

ts
Copiar
Editar
data: { permissions: ['project.read'] }
UI reactiva

Botones, secciones, rutas: todos usan métodos del AuthService para ocultar/habilitar según corresponda.

Ejemplo:

html
Copiar
Editar
<button *ngIf="auth.hasPermission('project.create')">Crear Proyecto</button>
Refresh de sesión

Cuando cambian roles/permisos de un user, podés:

Pedir de nuevo /me y actualizar AuthService, o

Forzar logout/login si hay cambios críticos.

Diálogo backend-frontend nativo

Nunca “traduzcas” nombres de permisos/features entre backend y frontend.

Usá los mismos strings y semántica en ambos lados.

C. Escalabilidad/Futuro
Cache eficiente

Mantener el cache de permisos/features por usuario con expiración corta (ya lo hacés).

Considerar cache global por tenant si la escala crece mucho.

Auditoría (opcional, enterprise)

Registrar cambios en roles, permisos, planes, features.

Scopes y granularidad avanzada (cuando lo pida el negocio)

Dejar preparado el modelo y los guards para ampliar a cosas como project.read:own si algún cliente lo pide.

Features premium/experimentales

Si en el futuro tenés features premium, sólo agregás el nombre en el plan/usuario/JWT, y el frontend ya puede consultarlo.

Testing automático

Tests e2e que cubran los casos básicos de acceso/no acceso por permisos, roles, features.

Mocks de backend para simular distintos JWT en el frontend.