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
    const refEventos = refDatabase(database, `eventos/${params.eventoId}`)
    const snapshotEventos = await getDatabase(refEventos)

    const evento: EventoType = snapshotEventos.val()
    delete evento.inscricoes
    
    const chamada = refStorage(storage, `site/eventos/${params.eventoId}/chamada.mp4`);
    const fundo = refStorage(storage, `site/eventos/${params.eventoId}/fundo.jpg`);
    const logo = refStorage(storage, `site/eventos/${params.eventoId}/logo.png`);

    await getDownloadURL(chamada).then(chamadaUrl => evento.chamada = chamadaUrl)
    await getDownloadURL(fundo).then(fundoUrl => evento.fundo = fundoUrl)
    await getDownloadURL(logo).then(logoUrl => evento.logo = logoUrl)    

    return Response.json({ evento })
}