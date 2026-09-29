export class CodigoVerificacion {
  constructor(
    public readonly idCodigoVerificacion: number | null,
    public readonly correo: string,
    public readonly codigo: string,
    public readonly fecha_expiracion: Date,
    public readonly created_at: Date | null,
  ) {}
}
