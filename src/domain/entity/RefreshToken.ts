export class RefreshToken {
  constructor(
    public readonly idRefreshToken: number,
    public readonly token: string,
    public readonly idUsuario: number,
    public readonly fecha_expiracion: Date,
    public readonly revocado: boolean = false,
    public readonly created_at?: Date
  ) {}

  estaExpirado(): boolean {
    return this.fecha_expiracion.getTime() < Date.now();
  }

  esValido(): boolean {
    return !this.revocado && !this.estaExpirado();
  }
}
