import { Dispatch, SetStateAction } from "react"

export type CelulaType = {
  id: number
  rede: string
  celula: string
  lider: string
}

export type BannerType = {
  ativo: boolean
  imagem: string
  link: string
}

export type InscritoType = {
  id?: string
  esposo?: string
  esposa?: string
  telefoneEsposo?: string
  telefoneEsposa?: string
  rede?: string
  celula?: string
  finalizada?: boolean
  inscritoEm?: string
  pagamentos?: Pagamento[]
  pagamentosAFazer?: EventoPagamentosType[]
  novo?: boolean
  termos?: boolean
  pagamento?: Pagamento
  credenciamento?: Credenciamento
}

export const Steps = {
  "VALIDACAO": 1,
  "FORMULARIO": 2,
  "TERMOS": 3,
  "PARCELAS": 4,
  "PAGAMENTO": 5,
  "FINALIZACAO": 6
}

export type Pagamento = {
  parcelas: EventoPagamentosType[]
  tipo?: string
  txid?: string
  codigo?: string
  valor?: string
  status?: string
  criadoEm?: string
  pagoEm?: string
  expiraEm?: string
  canceladoEm?: string
  url?: string
  pixID?: string
  notificationId?: string
}

export type EventoPagamentosType = {
  parcela: number
  nome: string
  valores: {[key: string]: number}
}

export type EventoType = {
  id: string
    subtitulo: string
    titulo: string
  pagamentos: EventoPagamentosType[]
  inscricoesAbertas: boolean
  limitePagamentos: string
  meta?: number
  metaBatida?: Object
  inscricoes?: InscritoType[]
  ativo: boolean
  logo: string
  chamada: string | null
  fundo: string
  flyer: string
  valor: number
  kits?: string[]
  tiposPagamentos: string
  credenciamentoAberto?: boolean
  credenciamentos?: Credenciamento[]
  termos: EventoTermoType[]
}

export type EventoTermoType = {
  termo: number
  descricao: string
  assinado?: boolean
}

export type Credenciamento = {
  credenciadoEm: string
  servo: string
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

export type UseStepActions = {
  goToNextStep: () => void;
  goToPrevStep: () => void;
  reset: () => void;
  canGoToNextStep: boolean;
  canGoToPrevStep: boolean;
  setStep: Dispatch<SetStateAction<number>>;
};