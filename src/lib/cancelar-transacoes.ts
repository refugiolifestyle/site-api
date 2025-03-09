// @ts-ignore:next-line
import EfiPay from 'sdk-node-apis-efi'
import efi from "@/configs/efi"

import { EventoType, InscritoType } from "@/types";
import { ref, set } from 'firebase/database';
import { database } from '@/configs/firebase';

export async function cancelarTransacoesEmAberto(evento: EventoType, inscrito: InscritoType) {
    for (let pagamento of Object.values(inscrito.pagamentos || {})) {
        if (["CONCLUIDA", "paid", "REMOVIDA_PELO_USUARIO_RECEBEDOR", "canceled"].includes(pagamento.status!)) {
            continue;
        }

        const efipay = new EfiPay(efi)

        let status = "canceled"
        switch (pagamento.tipo) {
            case 'pix':
                status = "REMOVIDA_PELO_USUARIO_RECEBEDOR"
                await efipay.pixUpdateCharge({ txid: pagamento.txid }, { status })
                break;
            case 'credit_card':
                await efipay.cancelCharge({ id: pagamento.codigo })
                break;
        }

        await set(ref(database, `eventos/${evento.id}/inscricoes/${inscrito.cpf!}/pagamentos/${pagamento.txid}/status`), status)
        await set(ref(database, `eventos/${evento.id}/inscricoes/${inscrito.cpf!}/pagamentos/${pagamento.txid}/canceladoEm`), new Date().toString())
    }
}