export type Resource = string;
export type Action = string;
export type WildcardPermission = '*';
export type Permission = `${Resource}.${Action}` | WildcardPermission;
