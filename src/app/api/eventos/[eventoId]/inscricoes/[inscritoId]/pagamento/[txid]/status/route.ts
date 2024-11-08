import { database } from "@/configs/firebase"
import { get, ref } from "firebase/database"

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number,
        txid: string
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    const refPagamentoStatus = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${params.txid}/status`)
    const snapshotInscrito = await get(refPagamentoStatus);
    const status = snapshotInscrito.val() as string

    return Response.json({ status })
}