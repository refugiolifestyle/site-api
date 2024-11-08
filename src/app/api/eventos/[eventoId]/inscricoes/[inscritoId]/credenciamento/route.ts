import { database } from "@/configs/firebase"
import { Credenciamento } from "@/types"
import { get, ref as refDatabase, set as setDatabase } from "firebase/database"

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    const refCredenciamento = refDatabase(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/credenciamento`)
    let comprovanteSnapshot = await get(refCredenciamento)

    if (!comprovanteSnapshot.exists()) {
        return Response.json({ error: "Credenciamento não encontrado" }, { status: 404 })
    }

    let credenciamento: Credenciamento = comprovanteSnapshot.val()

    return Response.json({ credenciamento })
}

export async function PATCH(request: Request, { params }: ApiProps) {
    try {
        const { servo }: { servo: string } = await request.json();

        if (!servo) {
            return Response.json({ error: "O campo servo é obrigatório" }, { status: 400 })
        }

        const refCredenciamento = refDatabase(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/credenciamento`)
        await setDatabase(refCredenciamento, {
            servo,
            credenciadoEm: new Date().toString()
        });

        return Response.json({ message: "Credenciamento realizado com sucesso" })
    }
    catch (e) {
        console.error(e)
        return Response.json({ error: "Falha ao realizar o credenciamento" }, { status: 500 })
    }
}