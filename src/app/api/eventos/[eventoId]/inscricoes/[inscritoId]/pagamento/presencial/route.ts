import { database, storage } from "@/configs/firebase"
import { EventoType } from "@/types"
import { get, ref, set } from "firebase/database"
import { getDownloadURL, ref as refStorage, uploadString } from "firebase/storage"

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function POST(request: Request, { params }: ApiProps) {
    try {
        const { foto }: { foto?: string } = await request.json();

        const refEvento = ref(database, `eventos/${params.eventoId}`)
        const snapshotEvento = await get(refEvento);
        const evento = snapshotEvento.val() as EventoType

        let fotoUrl = null
        if (foto) {
            const comprovanteRef = refStorage(storage, `site/eventos/${params.eventoId}/pagamentoPresencial/${params.inscritoId}`);
            await uploadString(comprovanteRef, foto, 'data_url')

            fotoUrl = await getDownloadURL(comprovanteRef)
        }


        const refCredenciamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamento`)
        await set(refCredenciamento, {
            status: "CONCLUIDA",
            valor: 0,
            url: fotoUrl,
            pagoEm: new Date().toString(),
            meioPagamento: "presencial"
        });

        return Response.json({ message: "Pagamento realizado com sucesso" })
    }
    catch (e) {
        console.error(e)
        return Response.json({ message: "Falha ao gerar o pagamento" }, { status: 400 })
    }
}