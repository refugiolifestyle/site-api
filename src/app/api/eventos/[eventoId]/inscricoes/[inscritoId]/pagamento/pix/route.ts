// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { database } from "@/configs/firebase"
import { EventoPagamentosType, EventoType, InscritoType, PixCharge, PixChargeLoc } from "@/types"
import { get, ref, remove, set } from "firebase/database"
import { cancelarTransacoesEmAberto } from '@/lib/cancelar-transacoes'

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

        const efipay = new EfiPay(efi)

        const valor = pagamentos.reduce((a, p) => a + p.valores['pix'], 0)

        let charge = await efipay.pixCreateImmediateCharge({}, {
            "calendario": {
                "expiracao": 60 * 60 * 24
            },
            "devedor": {
                "nome": inscrito.esposo
            },
            "valor": {
                "original": `${valor}.00`
            },
            "chave": process.env.EFI_PIX,
            "solicitacaoPagador": evento.titulo,
            infoAdicionais: pagamentos.map(pagamento => ({
                nome: pagamento.nome,
                valor: pagamento.valores['pix'].toLocaleString('pt-BR', { currency: "BRL", style: "currency" })
            }))
        }) as PixCharge

        let visualization = await efipay.pixGenerateQRCode({
            id: charge.loc.id
        }) as PixChargeLoc

        const refPagamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${charge.txid}`)
        await set(refPagamento, {
            valor,
            tipo: "pix",
            codigo: charge.loc.id,
            status: charge.status,
            txid: charge.txid,
            url: visualization.linkVisualizacao,
            criadoEm: new Date(charge.calendario.criacao).toString(),
            expiraEm: new Date(Date.now() + 1000 * 60 * 60 * 24).toString(),
            parcelas: pagamentos
        })

        const refEventosPagamento = ref(database, `eventosPagamentos/${charge.txid}`)
        await set(refEventosPagamento, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${charge.txid}`)

        return Response.json({ checkout: visualization.linkVisualizacao, txid: charge.txid })
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao gerar o pagamento" }, { status: 400 })
    }
}