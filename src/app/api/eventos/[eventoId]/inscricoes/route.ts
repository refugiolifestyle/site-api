import { database } from "@/configs/firebase";
import { InscritoType } from "@/types";
import { equalTo, get, orderByChild, query, ref, set } from "firebase/database";
import crypto from 'crypto'

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

    let id = crypto
        .createHash('sha1')
        .update(`${inscrito.rede}-${inscrito.celula}-${inscrito.esposo}-${inscrito.esposa}-${inscrito.telefoneEsposo}-${inscrito.telefoneEsposa}`)
        .digest('hex');

    const refEmail = ref(database, `eventos/${params.eventoId}/inscricoes/${id}`)
    const inscritoEmail = await get(refEmail)

    if (inscritoEmail.exists()) {
        return Response.json({ message: "Já existe esse cadastro" }, { status: 400 });
    }

    const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${id}`)
    await set(refInscrito, {...inscrito, id})

    return Response.json({ message: "Informações cadastradas com sucesso" }, { status: 201 });
}