// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { database } from "@/configs/firebase"
import { EventoPagamentosType, EventoType, InscritoType, PixCharge, PixChargeLoc } from "@/types"
import { get, ref, remove, set } from "firebase/database"
import { cancelarTransacoesEmAberto } from '@/lib/cancelar-transacoes'
import { v4 } from 'uuid'

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function POST(request: Request, { params }: ApiProps) {
    try {
        const pagamentos: EventoPagamentosType[] = await request.json();

        if (!pagamentos) {
            throw "O campo parcelas é obrigatório"
        }

        const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
        const snapshotInscrito = await get(refInscrito);
        const inscrito = snapshotInscrito.val() as InscritoType

        const refEvento = ref(database, `eventos/${params.eventoId}`)
        const snapshotEvento = await get(refEvento);
        const evento = snapshotEvento.val() as EventoType

        await cancelarTransacoesEmAberto(evento, inscrito)

        const txid = v4()
        const valor = pagamentos.reduce((a, p) => a + p.valores['money'], 0)

        const refPagamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${txid}`)
        await set(refPagamento, {
            valor,
            tipo: "money",
            status: "ATIVA",
            txid: txid,
            criadoEm: new Date().toString(),
            parcelas: pagamentos
        })

        return Response.json({ txid: txid })
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao gerar o pagamento" }, { status: 400 })
    }
}