import { database } from "@/firebase";
import { PixReturn } from "@/types";
import { ref, update, set, get } from "firebase/database";

export async function POST(request: Request) {
    try {
        const webhookResponse = new Response(request.body);
        const data = await webhookResponse.json() as { pix: PixReturn[] }

        for (let pixReturn of data.pix) {
            const refeventosPagamentos = ref(database, `eventosPagamentos/${pixReturn.txid}`)
            const snapshotPagamento = await get(refeventosPagamentos)

            console.log("snapshotPagamento.val()", snapshotPagamento.val())

            let [refPagamento] = Object.values<string>(snapshotPagamento.val())
            console.log("refPagamento", refPagamento)

            await Promise.all([
                set(ref(database, `${refPagamento}/status`), "CONCLUIDA"),
                set(ref(database, `${refPagamento}/pagoEm`), pixReturn.horario),
                set(ref(database, `${refPagamento}/pixID`), pixReturn.endToEndId)
            ])
        }

        return Response.json({})
    }
    catch (e) {
        console.error(e)
        return Response.json({}, { status: 500 })
    }
}
