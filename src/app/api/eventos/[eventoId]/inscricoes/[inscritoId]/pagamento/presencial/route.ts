import { database, storage } from "@/configs/firebase"
import { cancelarTransacoesEmAberto } from "@/lib/cancelar-transacoes"
import { EventoType, InscritoType } from "@/types"
import { get, ref, set } from "firebase/database"
import { getDownloadURL, ref as refStorage, uploadString } from "firebase/storage"
import { v4 } from "uuid"

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function POST(request: Request, { params }: ApiProps) {
    try {
        const { foto, valor }: { foto?: string, valor: string } = await request.json();
        
        if (!valor) {
            throw "O campo valor é obrigatório"
        }

        const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
        const snapshotInscrito = await get(refInscrito);
        const inscrito = snapshotInscrito.val() as InscritoType

        const refEvento = ref(database, `eventos/${params.eventoId}`)
        const snapshotEvento = await get(refEvento);
        const evento = snapshotEvento.val() as EventoType

        await cancelarTransacoesEmAberto(evento, inscrito)

        const txid = v4()

        let fotoUrl = null
        if (foto) {
            const comprovanteRef = refStorage(storage, `site/eventos/${params.eventoId}/pagamentoPresencial/${params.inscritoId}/${txid}`);
            await uploadString(comprovanteRef, foto, 'data_url')

            fotoUrl = await getDownloadURL(comprovanteRef)
        }

        const refCredenciamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${txid}`)
        await set(refCredenciamento, {
            valor,
            tipo: "presencial",
            status: "CONCLUIDA",
            url: fotoUrl,
            pagoEm: new Date().toString(),
            txid: txid,
            criadoEm: new Date().toString(),
        });

        return Response.json({ message: "Pagamento realizado com sucesso" })
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao gerar o pagamento" }, { status: 500 })
    }
}