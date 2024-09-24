import { database, storage } from "@/firebase"
import { Credenciamento, InscritoType } from "@/types"
import { get, ref as refDatabase, set as setDatabase } from "firebase/database"
import { getDownloadURL, ref as refStorage, uploadString } from "firebase/storage"

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
    
    const comprovanteRef = refStorage(storage, credenciamento.comprovante);
    let comprovante = await getDownloadURL(comprovanteRef)

    return Response.json({ credenciamento: {
        comprovante,
        servo: credenciamento.servo,
        credenciadoEm: credenciamento.credenciadoEm,
    } })
}

export async function PATCH(request: Request, { params }: ApiProps) {
    try {
        const {comprovante, servo}: {comprovante: string, servo: string} = await request.json();
    
        if (!comprovante || !servo) {
            return Response.json({ error: "Os campos servo e comprovante são obrigatórios" }, { status: 400 })
        }
    
        const comprovanteRef = refStorage(storage, `site/eventos/${params.eventoId}/credenciamento/${params.inscritoId}`);
        let comprovanteFile = await uploadString(comprovanteRef, comprovante, 'data_url')

        const refCredenciamento = refDatabase(database, `eventos/${params.eventoId}/inscricoes/${params.inscritoId}/credenciamento`)
        await setDatabase(refCredenciamento, {
            servo,
            comprovante: comprovanteFile.metadata.fullPath,
            credenciadoEm: new Date(comprovanteFile.metadata.timeCreated).toString()
        });
    
        return Response.json({ message: "Credenciamento realizado com sucesso" })
    } 
    catch(e) {
        console.error(e)
        return Response.json({ error: "Falha ao realizar o credenciamento" }, { status: 500 })
    }
}