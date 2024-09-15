import CardTableInscricoes from "@/components/card-table-inscricoes"
import { CelulaType, EventoType, InscritoType } from "@/types"

export const dynamic = 'auto'
export const revalidate = 0

type Props = {
  params: {
    eventoId: string
  }
}


export default async function EventoPage({ params }: Props) {
  const celulasResponse = await fetch(`${process.env.DOMAIN_URL}/api/celulas`)
  const { celulas } = await celulasResponse.json() as { celulas: CelulaType[] }

  const eventoResponse = await fetch(`${process.env.DOMAIN_URL}/api/eventos/${params.eventoId}`)
  const { evento } = await eventoResponse.json() as { evento: EventoType }

  const eventoInscricoesResponse = await fetch(`${process.env.DOMAIN_URL}/api/eventos/${params.eventoId}/inscricoes`)
  const { inscricoes } = await eventoInscricoesResponse.json() as { inscricoes: InscritoType[] }

  return <div className="grid gap-6">
    <CardTableInscricoes celulas={celulas} evento={evento} inscricoes={inscricoes} />
  </div>
}