export type InscritoType = {
  id?: string
  cpf: string
  nome?: string
  telefone?: string
  rede?: string
  celula?: string
  preInscricao?: string
  inscricaoConfirmada?: string
}

export type EventoType = {
  id: string
  titulo: string
  ativo: boolean
  logo: string
  chamada: string
  fundo: string
  inscricoes?: InscritoType[]
}