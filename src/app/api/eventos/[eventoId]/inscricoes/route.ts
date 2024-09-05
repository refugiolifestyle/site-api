import { database } from "@/firebase";
import { InscritoType } from "@/types";
import { get, ref, set } from "firebase/database";

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

    if (!inscrito.cpf) {
        return Response.json({ message: "Campo cpf é obrigatório" }, { status: 400 })
    }

    const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${inscrito.cpf}`)
    await set(refInscrito, inscrito)

    return Response.json({ message: "Inscrito cadastrado com sucesso" }, { status: 201 });
}