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
    const flyer = refStorage(storage, `site/eventos/${params.eventoId}/flyer.jpeg`);
    const logo = refStorage(storage, `site/eventos/${params.eventoId}/logo.png`);

    await getDownloadURL(chamada).then(url => evento.chamada = url).catch(() => null)
    await getDownloadURL(fundo).then(url => evento.fundo = url).catch(() => null)
    await getDownloadURL(flyer).then(url => evento.flyer = url).catch(() => null)
    await getDownloadURL(logo).then(url => evento.logo = url).catch(() => null)

    return Response.json({ evento })
}