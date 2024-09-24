import CardTableCredenciamento from "@/components/card-table-inscricoes-credenciamento"
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

  return <div className="grid gap-6">
    <CardTableCredenciamento
      celulas={celulas}
      evento={evento} />
  </div>
}