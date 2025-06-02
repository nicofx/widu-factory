export class InvalidPipelineConfigError extends Error {
  public readonly code = 'INVALID_PIPELINE_CONFIG';
  constructor(public readonly details: any) {
    super('El archivo de configuración de pipeline es inválido');
    Object.setPrototypeOf(this, InvalidPipelineConfigError.prototype);
  }
}
