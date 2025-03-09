import { database } from "@/configs/firebase";
import { InscritoType } from "@/types";
import { equalTo, get, orderByChild, query, ref, set } from "firebase/database";

type ApiProps = {
    params: {
        eventoId: string
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    const refInscricoes = ref(database, `eventos/${params.eventoId}/inscricoes`)
    const snapshotInscricoes = await get(refInscricoes)

    const inscricoes = Object.values(snapshotInscricoes.val()) as InscritoType[]

    return Response.json({ inscricoes })
}

export async function POST(request: Request, { params }: ApiProps) {
    const inscrito: InscritoType = await request.json();

    const refEmail = ref(database, `eventos/${params.eventoId}/inscricoes/${inscrito.id}`)
    const inscritoEmail = await get(refEmail)

    if (inscritoEmail.exists()) {
        return Response.json({ message: "Já existe esse cadastro" }, { status: 400 });
    }

    const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${inscrito.id}`)
    await set(refInscrito, inscrito)

    return Response.json({ message: "Informações cadastradas com sucesso" }, { status: 201 });
}