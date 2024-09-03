import { database, storage } from "@/firebase";
import { EventoType } from "@/types";
import { get as getDatabase, ref as refDatabase } from "firebase/database";
import { getDownloadURL, ref as refStorage } from "firebase/storage";

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