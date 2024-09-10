export type InscritoType = {
  id?: string
  idPagarme?: string
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
  tiposPagamentos?: string
  inscricoes?: InscritoType[]
}
export interface Pagamento {
  id: string
  codigo: string
  valor: string
  status: string
  criadoEm: string
  pagoEm?: string
  url: string
}

export type PixCharge = {
  calendario: {
    criacao: string,
    expiracao: number
  },
  txid: string,
  revisao: number,
  loc: {
    id: number,
    location: string,
    tipoCob: string
  },
  location: string,
  status: string,
  devedor: {
    cpf?: string,
    cnpj?: string,
    nome: string
  },
  valor: {
    original: string
  },
  chave: string,
  solicitacaoPagador?: string,
  pixCopiaECola: string
}

export type PixChargeLoc = {
  qrcode: string,
  imagemQrcode: string,
  linkVisualizacao: string
}

export interface PixReturn {
  endToEndId: string
  txid: string
  chave: string
  valor: string
  horario: string
}