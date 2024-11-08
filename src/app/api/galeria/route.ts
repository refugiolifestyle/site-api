import { storage } from "@/configs/firebase";
import { listAll, getDownloadURL, ref } from "firebase/storage";

export const dynamic = 'force-static'
export const revalidate = 30 * 24 * 60 * 60 * 1000

export async function GET() {
    const refSnapshot = ref(storage, 'site/galeria')
    const snapshot = await listAll(refSnapshot)

    const fotos = []
    for (let foto of snapshot.items) {
        fotos.push(await getDownloadURL(foto))
    }

    return Response.json({ fotos })
}
