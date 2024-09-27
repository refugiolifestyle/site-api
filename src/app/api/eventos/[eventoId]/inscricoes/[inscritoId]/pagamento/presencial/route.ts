// @ts-ignore:next-line

import { database, storage } from "@/firebase"
import { getDownloadURL, ref as refStorage, uploadString } from "firebase/storage"
import { get, ref, remove, set } from "firebase/database"
import { EventoType } from "@/types"

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function POST(request: Request, { params }: ApiProps) {
    try {
        const { foto }: { foto: string } = await request.json();

        if (!foto) {
            return Response.json({ error: "O campo foto é obrigatório" }, { status: 400 })
        }

        const refEvento = ref(database, `eventos/${params.eventoId}`)
        const snapshotEvento = await get(refEvento);
        const evento = snapshotEvento.val() as EventoType

        const comprovanteRef = refStorage(storage, `site/eventos/${params.eventoId}/pagamentoPresencial/${params.inscritoId}`);
        await uploadString(comprovanteRef, foto, 'data_url')

        const refCredenciamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamento`)
        await set(refCredenciamento, {
            status: "CONCLUIDA",
            valor: evento.valor,
            url: await getDownloadURL(comprovanteRef),
            pagoEm: new Date().toString(),
            presencial: true
        });

        return Response.json({ message: "Pagamento realizado com sucesso" })
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao gerar o pagamento" }, { status: 400 })
    }
}