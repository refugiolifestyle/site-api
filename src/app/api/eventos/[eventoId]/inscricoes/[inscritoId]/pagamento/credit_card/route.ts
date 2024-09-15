// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { database } from "@/firebase"
import { Charge, EventoType, InscritoType } from "@/types"
import { get, ref, remove, set } from "firebase/database"
import { v4 } from "uuid"

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    try {
        const efipay = new EfiPay(efi)

        const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
        const snapshotInscrito = await get(refInscrito);
        const inscrito = snapshotInscrito.val() as InscritoType

        if (inscrito.pagamento && !['unpaid', 'ATIVA'].includes(inscrito.pagamento.status)) {
            if (inscrito.pagamento.expiraEm) {
                let expiraEmDate = new Date(inscrito.pagamento.expiraEm)
                if (Date.now() < expiraEmDate.getTime()) {
                    return Response.json({ checkout: inscrito.pagamento.url })
                }
            }

            if (inscrito.pagamento.status != 'pending') {
                await remove(ref(database, `eventosPagamentos/${inscrito.pagamento.txid}`))
                await efipay.cancelCharge({ id: inscrito.pagamento.locationId })
            }
        }
        
        const refEvento = ref(database, `eventos/${params.eventoId}`)
        const snapshotEvento = await get(refEvento);
        const evento = snapshotEvento.val() as EventoType

        const txid = v4()

        let { data: charge } = await efipay
            .createOneStepLink({}, {
                items: [{
                    name: evento.titulo,
                    value: parseInt(`${evento.valor}00`),
                    amount: 1,
                }],
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
                    payment_method: 'credit_card'
                }
            }) as { code: number, data: Charge }

        const refPagamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamento`)
        await set(refPagamento, {
            locationId: charge.charge_id,
            status: charge.status,
            txid: charge.custom_id,
            valor: evento.valor,
            url: charge.payment_url,
            criadoEm: charge.created_at,
            expiraEm: charge.expire_at
        })

        const refEventosPagamento = ref(database, `eventosPagamentos/${charge.custom_id}`)
        await set(refEventosPagamento, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamento`)

        return Response.json({ checkout: charge.payment_url })
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao gerar o pagamento" }, { status: 400 })
    }
}