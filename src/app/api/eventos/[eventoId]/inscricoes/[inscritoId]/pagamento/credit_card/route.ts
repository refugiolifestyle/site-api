// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { database } from "@/firebase"
import { EventoType, InscritoType } from "@/types"
import { get, ref, set } from "firebase/database"
import { v4 } from "uuid"

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
    const snapshotInscrito = await get(refInscrito);
    const inscrito = snapshotInscrito.val() as InscritoType

    const refEvento = ref(database, `eventos/${params.eventoId}`)
    const snapshotEvento = await get(refEvento);
    const evento = snapshotEvento.val() as EventoType

    const txid = v4()

    const efipay = new EfiPay(efi)
    return efipay
        .pixCreateCharge({ txid }, {
            "calendario": {
                "expiracao": 3600
            },
            "devedor": {
                "cpf": inscrito.cpf,
                "nome": inscrito.nome
            },
            "valor": {
                "original": evento.valor
            },
            "chave": process.env.EFI_PIX,
            "solicitacaoPagador": `Inscrição Refugio - ${evento.titulo}`
        })
        .then((result: any) => {
            
        })
        .catch(() => {
            return Response.json({ message: "Falha ao gerar o pagamento" }, { status: 400 })
        })
}

// export async function GET(_: Request, { params }: ApiProps) {
//     const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
//     const snapshotInscrito = await get(refInscrito);
//     const inscrito = snapshotInscrito.val() as InscritoType

//     if (inscrito.pagamento && !inscrito.idPagarme) {
//         let requestOrder = await fetch(`${process.env.PAGARME_URL}/orders/${inscrito.pagamento.id}`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': 'Basic ' + Buffer.from(`${process.env.PAGARME_SECRET}:`).toString('base64'),
//                 'Content-Type': 'application/json'
//             }
//         })

//         let requestOrderJson = await requestOrder.json() as { customer: { id: string } }
//         const refPagamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/idPagarme`)
//         await set(refPagamento, requestOrderJson.customer.id);

//         inscrito.idPagarme = requestOrderJson.customer.id
//     }

//     if (inscrito.pagamento && inscrito.idPagarme && inscrito.pagamento.status != "paid") {
//         let requestOrders = await fetch(`${process.env.PAGARME_URL}/orders?customer_id=${inscrito.idPagarme}&page=1&size=10`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': 'Basic ' + Buffer.from(`${process.env.PAGARME_SECRET}:`).toString('base64'),
//                 'Content-Type': 'application/json'
//             }
//         })

//         let requestOrdersJson = await requestOrders.json() as { data: [{ id: string }] }
//         for (let order of requestOrdersJson.data) {
//             let requestOrdersClosed = await fetch(`${process.env.PAGARME_URL}/orders/${order.id}/closed`, {
//                 method: 'PATCH',
//                 headers: {
//                     'Authorization': 'Basic ' + Buffer.from(`${process.env.PAGARME_SECRET}:`).toString('base64'),
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ "status": "failed" })
//             })

//             console.log("orders closed", await requestOrdersClosed.json())
//         }

//         let requestCharges = await fetch(`${process.env.PAGARME_URL}/charges?customer_id=${inscrito.idPagarme}&page=1&size=10`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': 'Basic ' + Buffer.from(`${process.env.PAGARME_SECRET}:`).toString('base64'),
//                 'Content-Type': 'application/json'
//             }
//         })

//         let requestChargesJson = await requestCharges.json() as { data: [{ id: string }] }
//         for (let order of requestChargesJson.data) {
//             let requestChargesResult = await fetch(`${process.env.PAGARME_URL}/charges/${order.id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': 'Basic ' + Buffer.from(`${process.env.PAGARME_SECRET}:`).toString('base64'),
//                     'Content-Type': 'application/json'
//                 }
//             })

//             console.log("charges deleted",  await requestChargesResult.json())
//         }
//     }

//     const refEvento = ref(database, `eventos/${params.eventoId}`)
//     const snapshotEvento = await get(refEvento);
//     const evento = snapshotEvento.val() as EventoType

//     let request = await fetch(`${process.env.PAGARME_URL}/orders`, {
//         method: 'POST',
//         headers: {
//             'Authorization': 'Basic ' + Buffer.from(`${process.env.PAGARME_SECRET}:`).toString('base64'),
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             "items": [
//                 {
//                     "amount": `${evento.valor}00`,
//                     "description": evento.titulo,
//                     "quantity": 1,
//                     "code": evento.id
//                 }
//             ],
//             "customer": {
//                 "type": "individual",
//                 "name": inscrito.nome,
//                 "document_type": 'cpf',
//                 "document": inscrito.cpf,
//                 "email": inscrito.email,
//                 "phones": {
//                     "mobile_phone": {
//                         "country_code": '55',
//                         "area_code": inscrito.telefone?.slice(0, 2),
//                         "number": inscrito.telefone?.slice(2)
//                     }
//                 }
//             },
//             "payments": [
//                 {
//                     "payment_method": "checkout",
//                     "checkout": {
//                         "skip_checkout_success_page": true,
//                         "accepted_payment_methods": evento.tiposPagamentos ? evento.tiposPagamentos.split(',') : ["pix"],
//                         "credit_card": {
//                             "statement_descriptor": evento.id.slice(0, 22).toUpperCase(),
//                             "installments": [
//                                 {
//                                     "number": 1,
//                                     "total": `${evento.valor}00`
//                                 }
//                             ]
//                         },
//                         "pix": {
//                             "expires_in": 3600 * 24
//                         },
//                     }
//                 }
//             ]
//         })
//     })

//     const pagamento = await request.json()

//     if (!request.ok) {
//         console.error(inscrito.cpf, pagamento)
//         return Response.json({
//             message: "Falha ao processar o pagamento"
//         }, {
//             status: 400
//         })
//     }

//     console.log(pagamento)

//     const [checkout] = pagamento.checkouts

//     const refPagamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamento`)
//     await set(refPagamento, {
//         id: pagamento.id,
//         codigo: pagamento.code,
//         valor: evento.valor,
//         status: pagamento.status,
//         criadoEm: pagamento.created_at,
//         atualizadoEm: pagamento.updated_at,
//         url: checkout.payment_url,
//     })

//     return Response.json({ checkout: checkout.payment_url })
// }