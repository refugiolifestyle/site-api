import { database } from "@/firebase";
import { InscritoType } from "@/types";
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

    const inscrito: InscritoType = snapshotInscrito.val()

    return Response.json({ inscrito })
}