export type InscritoType = {
  id?: string
  cpf: string
  nome?: string
  telefone?: string
  rede?: string
  celula?: string
  preInscricao?: string
  inscricaoConfirmada?: string
  pagamento?: Pagamento
}

export type EventoType = {
  id: string
  titulo: string
  ativo: boolean
  logo: string
  chamada: string
  fundo: string
  valor: number
  inscricoes?: InscritoType[]
}
export interface Pagamento {
  id: string
  codigo: string
  valor: string
  finalizado: string
  status: string
  criadoEm: string
  atualizadoEm: string
  checkout: Checkout
}

export interface Checkout {
  id: string
  url: string
  criadoEm: string
  atualizadoEm: string
}
