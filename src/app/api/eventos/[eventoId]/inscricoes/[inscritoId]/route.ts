import { database } from "@/firebase";
import { get, ref } from "firebase/database";

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
    const snapshotInscrito = await get(refInscrito)
    let data = snapshotInscrito.val()

    if (!snapshotInscrito.exists()) {
        const refInscritoAnteriomente = ref(database, `inscricoes/${params.inscritoId}`)
        const snapshotInscritoAnteriomente = await get(refInscritoAnteriomente)

        data = {
            ...snapshotInscritoAnteriomente.val(),
            novo: true
        }

    }

    const { eventos, cpf, telefone, ...inscrito } = data

    return Response.json({
        inscrito: {
            ...inscrito,
            cpf: cpf.replaceAll(/[^\d]+/g, ''),
            telefone: telefone.replaceAll(/[^\d]+/g, ''),
        }
    })
}