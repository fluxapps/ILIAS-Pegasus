
export interface ILIASConfig {
  readonly installations: Array<ILIASInstallation>
}

export interface ILIASInstallation {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly clientId: string;
  readonly apiKey: string;
  readonly apiSecret: string;
  readonly accessTokenTTL: number;
}
