// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { database } from "@/configs/firebase"
import { Charge, EventoPagamentosType, EventoType, InscritoType } from "@/types"
import { get, push, ref, remove, set } from "firebase/database"
import { v4 } from "uuid"
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

        const txid = v4()
        const valor = pagamentos.reduce((a, p) => a + p.valores['credit_card'], 0)

        let { data: charge } = await efipay
            .createOneStepLink({}, {
                items: pagamentos.map(pagamento => ({
                    name: pagamento.nome,
                    value: parseInt(`${pagamento.valores['credit_card']}00`),
                    amount: 1,
                })),
                metadata: {
                    custom_id: txid,
                    notification_url: `${process.env.DOMAIN_URL}/api/webhooks/pagamentos/credit_card/${txid}`
                },
                customer: {
                    email: inscrito.email
                },
                settings: {
                    expire_at: evento.limitePagamentos,
                    request_delivery_address: false,
                    payment_method: 'credit_card',
                    message: evento.titulo
                }
            }) as { code: number, data: Charge }

        const refPagamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${charge.custom_id}`)
        await set(refPagamento, {
            valor,
            codigo: charge.charge_id,
            status: charge.status,
            txid: charge.custom_id,
            url: charge.payment_url,
            criadoEm: charge.created_at,
            expiraEm: charge.expire_at,
            tipo: "credit_card",
            parcelas: pagamentos
        })

        const refEventosPagamento = ref(database, `eventosPagamentos/${charge.custom_id}`)
        await set(refEventosPagamento, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${charge.custom_id}`)

        return Response.json({ checkout: charge.payment_url, txid: charge.custom_id })
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao gerar o pagamento" }, { status: 400 })
    }
}