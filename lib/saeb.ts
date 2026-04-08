/** Converte theta (média 0, DP 1) para escala SAEB (média 250, DP 50) */
export function thetaToSaeb(theta: number): number {
  return 250 + 50 * theta;
}

/** Formata pontuação SAEB como string */
export function formatSaeb(theta: number): string {
  return Math.round(thetaToSaeb(theta)).toString();
}
