import { database } from "@/configs/firebase";
import { PixReturn } from "@/types";
import { ref, set, get } from "firebase/database";

export async function POST(request: Request) {
    try {
        const webhookResponse = new Response(request.body);
        const data = await webhookResponse.json() as { pix: PixReturn[] }

        for (let pixReturn of data.pix || []) {
            const refeventosPagamentos = ref(database, `eventosPagamentos/${pixReturn.txid}`)
            const snapshotPagamento = await get(refeventosPagamentos)

            if (snapshotPagamento.exists()) {
                let refPagamento = snapshotPagamento.val()
                let statusClientSnap = await get(ref(database, `${refPagamento}/status`))
                let statusClient = statusClientSnap.val() as string

                if (!["CONCLUIDA", "paid"].includes(statusClient)) {
                    await Promise.all([
                        set(ref(database, `${refPagamento}/status`), "CONCLUIDA"),
                        set(ref(database, `${refPagamento}/pagoEm`), pixReturn.horario),
                        set(ref(database, `${refPagamento}/pixID`), pixReturn.endToEndId)
                    ])
                }
            }
        }

        return Response.json({})
    }
    catch (e) {
        console.error(e)
        return Response.json({}, { status: 500 })
    }
}
