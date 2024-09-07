export type InscritoType = {
  id?: string
  cpf: string
  nome?: string
  telefone?: string
  rede?: string
  celula?: string
  email?: string
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
  status: string
  criadoEm: string
  atualizadoEm: string
  pagoEm?: string
  url: string
}