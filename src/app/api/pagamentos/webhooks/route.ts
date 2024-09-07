import { database } from "@/firebase";
import { ref, push, set } from "firebase/database";

export async function POST(request: Request) {
    const webhookResponse = new Response(request.body);
    const {data} = await webhookResponse.json()
    const [evento] = data.items;

    const refSnapshotStatus = ref(database, `eventos/${evento.code}/inscricoes/${data.customer.document}/pagamento/status`)
    await set(refSnapshotStatus, data.status)
    
    const refSnapshotPagoEm = ref(database, `eventos/${evento.code}/inscricoes/${data.customer.document}/pagamento/pagoEm`)
    await set(refSnapshotPagoEm, data.closed_at)

    return Response.json({ message: "Recebido" })
}
