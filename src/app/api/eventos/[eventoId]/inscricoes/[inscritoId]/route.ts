import { database } from "@/configs/firebase";
import { get, ref } from "firebase/database";

type ApiProps = {
    params: {
        eventoId: string,
        inscritoId: number
    }
}

export async function GET(_: Request, { params }: ApiProps) {
    const refInscrito = ref(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}`)
    const snapshotInscrito = await get(refInscrito)
    let data = snapshotInscrito.val()

    if (!snapshotInscrito.exists()) {
        const refInscritoAnteriomente = ref(database, `membros/${params.inscritoId}`)
        const snapshotInscritoAnteriomente = await get(refInscritoAnteriomente)

        if (!snapshotInscritoAnteriomente.exists()) {
            return Response.json({
                inscrito: {
                    cpf: params.inscritoId,
                    novo: true
                }
            })
        }

        const {visitante, rede, celula, telefone, cpf, ...membro} = snapshotInscritoAnteriomente.val()
        data = {
            ...membro,
            visitante,
            cpf: cpf.replaceAll(/[^\d]+/g, ''),
            telefone: telefone.replaceAll(/[^\d]+/g, ''),
            rede: visitante ? "" : rede,
            celula: visitante ? "" : celula,
            novo: true
        }

    }

    let { eventos, ...inscrito } = data
    return Response.json({
        inscrito
    })
}