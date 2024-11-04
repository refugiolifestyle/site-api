import { database, storage } from "@/firebase";
import { EventoType } from "@/types";
import { get as getDatabase, ref as refDatabase } from "firebase/database";
import { getDownloadURL, ref as refStorage, } from "firebase/storage";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_: Request) {
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
        const flyer = refStorage(storage, `site/eventos/${evento.id}/flyer.jpeg`);

        await Promise.all([
            getDownloadURL(chamada),
            getDownloadURL(fundo),
            getDownloadURL(flyer),
            getDownloadURL(logo)
        ])
            .then(([chamadaUrl, fundoUrl, flyerUrl, logoUrl]) => {
                if (chamadaUrl) { evento.chamada = chamadaUrl }
                if (fundoUrl) { evento.fundo = fundoUrl }
                if (flyerUrl) { evento.flyer = flyerUrl }
                if (logoUrl) { evento.logo = logoUrl }
            })
    }

    return Response.json({ eventos })
}
