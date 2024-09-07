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
    let snapshotInscrito = await get(refInscrito)

    if (!snapshotInscrito.exists()) {
        const refInscritoAnteriomente = ref(database, `inscricoes/${params.inscritoId}`)
        snapshotInscrito = await get(refInscritoAnteriomente)
    }

    const {eventos, cpf, telefone, ...inscrito} = snapshotInscrito.val()

    return Response.json({ inscrito: {
        ...inscrito,
        cpf: cpf.replaceAll(/[^\d]+/, ''),
        telefone: telefone.replaceAll(/[^\d]+/, ''),
    } })
}