export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  clienteId: string;
  role?: string;
  claims?: string[];
  matricula?: string;
  documento?: string;
  clienteNome?: string;
  redeNome?: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
  lembrar?: boolean;
  subDominio?: string;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}
