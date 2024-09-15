export type CelulaType = {
  id: number
  rede: number
  celula: string
}

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
  meta?: number
  limitePagamentos?: string
  tiposPagamentos?: string
  inscricoes?: InscritoType[]
}
export interface Pagamento {
  txid: string
  codigo: string
  valor: string
  status: string
  criadoEm: string
  pagoEm?: string
  expiraEm?: string
  locationId?: number
  url: string
}

export type Charge = {
  charge_id: number,
  status: string,
  total: number,
  custom_id: string | null,
  payment_url: string,
  payment_method: string,
  billet_discount: number | null,
  card_discount: number | null,
  conditional_discount_value: number | null,
  conditional_discount_type: string | null,
  conditional_discount_date: string | null,
  request_delivery_address: boolean,
  message: string | null,
  expire_at: string,
  created_at: string
}

export type ChargeReturn = {
  created_at: string
  custom_id: any
  id: number
  identifiers: {
    charge_id: number
  }
  received_by_bank_at: string
  status: {
    current: string
    previous: string
  }
  type: string
  value: number
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

export type PixReturn = {
  endToEndId: string
  txid: string
  chave: string
  valor: string
  horario: string
}