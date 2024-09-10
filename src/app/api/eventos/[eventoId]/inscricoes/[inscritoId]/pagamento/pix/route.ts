// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { database } from "@/firebase"
import { EventoType, InscritoType, PixCharge, PixChargeLoc } from "@/types"
import { get, ref, set } from "firebase/database"
import { v4 } from "uuid"

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    try {
        const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
        const snapshotInscrito = await get(refInscrito);
        const inscrito = snapshotInscrito.val() as InscritoType

        const refEvento = ref(database, `eventos/${params.eventoId}`)
        const snapshotEvento = await get(refEvento);
        const evento = snapshotEvento.val() as EventoType

        const efipay = new EfiPay(efi)
        let charge = await efipay.pixCreateImmediateCharge({ }, {
            "calendario": {
                "expiracao": 3600
            },
            "devedor": {
                "cpf": inscrito.cpf,
                "nome": inscrito.nome
            },
            "valor": {
                "original": `${evento.valor}.00`
            },
            "chave": process.env.EFI_PIX,
            "solicitacaoPagador": `Inscrição Refugio - ${evento.titulo}`
        }) as PixCharge

        let visualization = await efipay.pixGenerateQRCode({
            id: charge.loc.id
        }) as PixChargeLoc

        const refPagamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamento`)
        await set(refPagamento, {
            locationId: charge.loc.id,
            status: charge.status,
            txid: charge.txid,
            valor: charge.valor.original,
            url: visualization.linkVisualizacao
        })

        const refEventosPagamento = ref(database, `eventosPagamentos/${charge.txid}`)
        await set(refEventosPagamento, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamento`)

        return Response.json({ checkout: visualization.linkVisualizacao })
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao gerar o pagamento" }, { status: 400 })
    }
}