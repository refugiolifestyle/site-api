import { database } from "@/firebase";
import { PixReturn } from "@/types";
import { ref, push, set, get } from "firebase/database";

export async function POST(request: Request) {
    const webhookResponse = new Response(request.body);
    const { pix } = await webhookResponse.json() as { pix: PixReturn }

    console.log("pix", pix)

    const refPagamento = ref(database, `eventosPagamentos/${pix.txid}`)
    const snapshotPagamento = await get(refPagamento)

    let shotPagamento = snapshotPagamento.val()

    console.log("shotPagamento", shotPagamento)

    let [eventoPagamento] = Object.entries(shotPagamento)
    let [txid, pagamento] = eventoPagamento as [string, {eventoId: string, inscritoId: string}]

    const refSnapshotStatus = ref(database, `eventos/${pagamento.eventoId}/inscricoes/${pagamento.inscritoId}/pagamento/status`)
    await set(refSnapshotStatus, "CONCLUIDA")

    const refSnapshotHoraio = ref(database, `eventos/${pagamento.eventoId}/inscricoes/${pagamento.inscritoId}/pagamento/pagoEm`)
    await set(refSnapshotHoraio, pix.horario)

    const refSnapshotPixId = ref(database, `eventos/${pagamento.eventoId}/inscricoes/${pagamento.inscritoId}/pagamento/pixID`)
    await set(refSnapshotPixId, pix.endToEndId)

    return Response.json({})
}
