import { database } from "@/firebase"
import { push, ref, set } from "firebase/database"

type ApiProps = {
    params: {
        eventoId: string
        celulaId: string
    }
}

export async function PATCH(_: Request, { params }: ApiProps) {
    const refMeta = ref(database, `eventos/${params.eventoId}/metaBatida/${params.celulaId}`)
    await set(refMeta, new Date().toString())

    return Response.json({ message: "Meta cadastrada com sucesso" }, { status: 200 });
}