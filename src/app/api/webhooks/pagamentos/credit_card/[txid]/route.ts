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

export async function POST(_: Request, { params }: Props) {
    const efipay = new EfiPay(efi)
    
    let { data: notifications } = await efipay
        .getNotification({
            token: params.txid
        }) as { code: number, data: ChargeReturn[] }

    let notification = notifications
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
        .pop()

    const refeventosPagamentos = ref(database, `eventosPagamentos/${params.txid}`)
    const snapshotPagamento = await get(refeventosPagamentos)

    let refPagamento = snapshotPagamento.val()
    await Promise.all([
        set(ref(database, `${refPagamento}/status`), notification?.status.current),
        set(ref(database, `${refPagamento}/pagoEm`), notification?.received_by_bank_at),
        set(ref(database, `${refPagamento}/chargeID`), notification?.identifiers.charge_id)
    ])

    return Response.json({})
}
/api/webhooks/pagamentos/credit_card/50b8c4e4-c9b8-4a6c-a977-846b94daff1d