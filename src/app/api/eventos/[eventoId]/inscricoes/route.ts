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

    if (!inscrito.cpf) {
        return Response.json({ message: "Campo CPF é obrigatório" }, { status: 400 })
    }

    if (!inscrito.email) {
        return Response.json({ message: "Campo Email é obrigatório" }, { status: 400 })
    }

    const refEmail = ref(database, `eventos/${params.eventoId}/inscricoes`)
    const orderEmail = query(refEmail, orderByChild("email"))
    const equalEmail = query(orderEmail, equalTo(inscrito.email))
    const inscritoEmail = await get(equalEmail)

    if (inscritoEmail.exists()) {
        return Response.json({ message: "Já existe um inscrito com esse email" }, { status: 400 });
    }

    const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${inscrito.cpf}`)
    await set(refInscrito, inscrito)
    
    const refMembros = ref(database, `membros/${inscrito.cpf}`)
    await set(refMembros, inscrito)

    return Response.json({ message: "Inscrito cadastrado com sucesso" }, { status: 201 });
}