export class CodigoVerificacion {

  constructor(
    public readonly idCodigoVerificacion: number,
    public readonly correo: string,
    public readonly codigo: string,
    public readonly fecha_expiracion: Date,
    public readonly created_at: Date = new Date()
  ) { }
}