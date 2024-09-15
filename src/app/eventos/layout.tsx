import Link from "next/link"
import { ReactElement } from "react"
import { EventoType } from "@/types"

export const dynamic = 'auto'
export const revalidate = 0

export default async function LayoutEventosPage({ children }: { children: ReactElement }) {
  const eventosResponse = await fetch(`${process.env.DOMAIN_URL}/api/eventos`)
  const { eventos } = await eventosResponse.json() as { eventos: EventoType[] }

  return <>
    <div className="mx-auto grid w-full max-w-7xl gap-2">
      <h1 className="text-3xl font-semibold">Eventos</h1>
    </div>
    <div className="mx-auto grid w-full max-w-7xl items-start gap-4 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
      <nav className="grid gap-4 text-sm text-muted-foreground">
        {eventos.map(e => <Link key={e.id} href={`/eventos/${e.id}`}>{e.titulo}</Link>)}
      </nav>
      <div className="grid gap-4">
        {children}
      </div>
    </div>
  </>
}