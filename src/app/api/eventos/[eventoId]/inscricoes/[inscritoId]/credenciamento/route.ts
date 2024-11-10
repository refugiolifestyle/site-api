import { database } from "@/configs/firebase"
import { getPagamentoInscrito } from "@/lib/utils"
import { Credenciamento, InscritoType } from "@/types"
import { get, ref, set } from "firebase/database"

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    const refCredenciamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/credenciamento`)
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

        const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
        const snapshotInscrito = await get(refInscrito);
        const inscrito = snapshotInscrito.val() as InscritoType
        const pagamento = getPagamentoInscrito(inscrito)
        if (pagamento?.tipo === "money") {
            const refPagamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/pagamentos/${pagamento.txid}`)
            await set(refPagamento, {
                ...pagamento,
                status: "CONCLUIDA",
                pagoEm: new Date().toString(),
            })
        }

        const refCredenciamento = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/credenciamento`)
        await set(refCredenciamento, {
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