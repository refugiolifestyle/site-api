// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { database } from "@/firebase";
import { ref, push, set, get } from "firebase/database";
import { ChargeReturn } from '@/types';

type Props = {
    params: {
        txid: string
    }
}

export async function POST(request: Request, { params }: Props) {
    const efipay = new EfiPay(efi)

    const webhookResponse = new Response(request.body);
    const webhookResponseData = await webhookResponse.text()
    console.log("webhookResponseData", webhookResponseData)
    const [_, notificationId] = webhookResponseData.split("=")
    console.log("notificationId", notificationId)

    let { data: notifications } = await efipay
        .getNotification({ token: notificationId }) as { code: number, data: ChargeReturn[] }

        console.log("getNotification", notifications)
    let notification = notifications
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
        .pop()

        console.log("notification", notification)
    const refeventosPagamentos = ref(database, `eventosPagamentos/${params.txid}`)
    const snapshotPagamento = await get(refeventosPagamentos)

    let refPagamento = snapshotPagamento.val()
    console.log("refPagamento", refPagamento)
    await Promise.all([
        set(ref(database, `${refPagamento}/status`), notification?.status.current),
        set(ref(database, `${refPagamento}/pagoEm`), notification?.received_by_bank_at),
        set(ref(database, `${refPagamento}/chargeID`), notification?.identifiers.charge_id)
    ])

    return Response.json({})
}