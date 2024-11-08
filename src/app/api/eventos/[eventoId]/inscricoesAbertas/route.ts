import { database } from "@/configs/firebase";
import { get as getDatabase, ref as refDatabase } from "firebase/database";

type ApiProps = {
    params: {
        eventoId: string
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    const refInscricoesAbertas = refDatabase(database, `eventos/${params.eventoId}/inscricoesAbertas`)
    const snapshotInscricoesAbertas = await getDatabase(refInscricoesAbertas)

    return Response.json({ 
        inscricoesAbertas: snapshotInscricoesAbertas.val()
     })
}