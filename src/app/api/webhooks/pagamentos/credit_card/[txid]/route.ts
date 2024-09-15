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
    const [_, notificationId] = webhookResponseData.split("=")

    let { data: notifications } = await efipay
        .getNotification({ token: notificationId }) as { code: number, data: ChargeReturn[] }

    let notification = notifications
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
        .pop()

    const refeventosPagamentos = ref(database, `eventosPagamentos/${params.txid}`)
    const snapshotPagamento = await get(refeventosPagamentos)

    if (!snapshotPagamento.exists()) {
        await set(ref(database, `eventosPagamentosAvulsos/${params.txid}/status`), notification?.status.current)

        if (notification?.status.current == 'paid') {
            await set(ref(database, `eventosPagamentosAvulsos/${params.txid}/pagoEm`), notification?.created_at)
        }
    }
    else {
        let refPagamento = snapshotPagamento.val()
        await set(ref(database, `${refPagamento}/status`), notification?.status.current)

        if (notification?.status.current == 'paid') {
            await set(ref(database, `${refPagamento}/pagoEm`), notification?.created_at)
        }
    }


    return Response.json({})
}