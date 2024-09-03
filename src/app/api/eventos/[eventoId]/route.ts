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

    const chamada = refStorage(storage, `site/eventos/${params.eventoId}/chamada.mp4`);
    const fundo = refStorage(storage, `site/eventos/${params.eventoId}/fundo.jpg`);
    const logo = refStorage(storage, `site/eventos/${params.eventoId}/logo.png`);

    const evento: EventoType = {
        ...snapshotEventos.val(),
        chamada: await getDownloadURL(chamada),
        fundo: await getDownloadURL(fundo),
        logo: await getDownloadURL(logo),
    }

    delete evento.inscricoes

    return Response.json({ evento })
}