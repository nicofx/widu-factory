// dynamic-component.model.ts
export interface DynamicComponentData<Body = any, Footer = any> {
  body: Body;
  footer: Footer;
  loading: boolean;
  updatedAt?: Date;
}
