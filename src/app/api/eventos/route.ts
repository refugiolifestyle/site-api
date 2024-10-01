import { database, storage } from "@/firebase";
import { EventoType } from "@/types";
import { get as getDatabase, ref as refDatabase } from "firebase/database";
import { getDownloadURL, ref as refStorage } from "firebase/storage";



export async function GET() {
    const refEventos = refDatabase(database, `eventos`)
    const snapshotEventos = await getDatabase(refEventos)

    const eventos: EventoType[] = [];
    const values = Object.values<EventoType>(snapshotEventos.val());

    for (let value of values) {
        let { inscricoes, ...evento } = value
        if (!evento.ativo) {
            continue;
        }

        const chamada = refStorage(storage, `site/eventos/${evento.id}/chamada.mp4`);
        const fundo = refStorage(storage, `site/eventos/${evento.id}/fundo.jpg`);
        const logo = refStorage(storage, `site/eventos/${evento.id}/logo.png`);

        eventos.push({
            ...evento,
            chamada: await getDownloadURL(chamada),
            fundo: await getDownloadURL(fundo),
            logo: await getDownloadURL(logo),
        });
    }

    return Response.json({ eventos })
}
