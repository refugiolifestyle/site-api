import { database } from "@/firebase";
import { PixReturn } from "@/types";
import { ref, update, set, get } from "firebase/database";

export async function POST(request: Request) {
    const webhookResponse = new Response(request.body);
    const data = await webhookResponse.json() as { pix: PixReturn[] }

    for (let pixReturn of data.pix) {
        console.log("pixReturn", pixReturn)

        const refeventosPagamentos = ref(database, `eventosPagamentos/${pixReturn.txid}`)
        const snapshotPagamento = await get(refeventosPagamentos)

        let [refPagamento] = Object.values<string>(snapshotPagamento.val())

        const refSnapshotStatus = ref(database, `${refPagamento}/status`)
        await set(refSnapshotStatus, "CONCLUIDA")

        const refSnapshotHoraio = ref(database, `${refPagamento}/pagoEm`)
        await set(refSnapshotHoraio, pixReturn.horario)

        const refSnapshotPixId = ref(database, `${refPagamento}/pixID`)
        await set(refSnapshotPixId, pixReturn.endToEndId)
    }

    return Response.json({})
}
