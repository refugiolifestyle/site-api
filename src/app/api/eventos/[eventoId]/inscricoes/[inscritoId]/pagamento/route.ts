import { database } from "@/firebase"
import { EventoType, InscritoType } from "@/types"
import { get, ref, set } from "firebase/database"

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

    if (inscrito.pagamento) {
        return Response.json({ checkout: inscrito.pagamento.checkout.url })
    }

    const refEvento = ref(database, `eventos/${params.eventoId}`)
    const snapshotEvento = await get(refEvento);
    const evento = snapshotEvento.val() as EventoType

    let request = await fetch(`${process.env.PAGARME_URL}/orders`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${process.env.PAGARME_SECRET}:`).toString('base64'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "items": [
                {
                    "amount": `${evento.valor}00`,
                    "description": evento.titulo,
                    "quantity": 1
                }
            ],
            "customer": {
                "type": "individual",
                "name": inscrito.nome,
                "document_type": 'cpf',
                "document": inscrito.cpf,
                "email": inscrito.email,
                "phones": {
                    "mobile_phone": {
                        "country_code": '55',
                        "area_code": inscrito.telefone?.slice(0, 2),
                        "number": inscrito.telefone?.slice(2)
                    }
                }
            },
            "payments": [
                {
                    "payment_method": "checkout",
                    "checkout": {
                        "accepted_payment_methods": ["credit_card", "pix"],
                        "credit_card": {
                            "statement_descriptor": evento.id.slice(0, 22).toUpperCase(),
                            "installments": [
                                {
                                    "number": 1,
                                    "total": `${evento.valor}00`
                                }
                            ]
                        },
                        "pix": {
                            "expires_in": 3600
                        },
                    }
                }
            ]
        })
    })

    const pagamento = await request.json()

    if (!request.ok) {
        console.error(inscrito.cpf, pagamento)
        return Response.json({
            message: "Falha ao processar o pagamento"
        }, {
            status: 400
        })
    }

    const [checkout] = pagamento.checkouts

    const refPagamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamento`)
    await set(refPagamento, {
        id: pagamento.id,
        codigo: pagamento.code,
        valor: evento.valor,
        finalizado: pagamento.closed,
        status: pagamento.status,
        criadoEm: pagamento.created_at,
        atualizadoEm: pagamento.updated_at,
        checkout: {
            id: checkout.id,
            url: checkout.payment_url,
            criadoEm: checkout.created_at,
            atualizadoEm: checkout.updated_at
        }
    })

    return Response.json({ checkout: checkout.payment_url })
}