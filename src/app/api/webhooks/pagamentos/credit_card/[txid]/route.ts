import { database } from "@/firebase";
import { ref, push, set } from "firebase/database";

type Props = {
    params: {
        txid: string
    }
}

export async function POST(request: Request, { params }: Props) {
    const webhookResponse = new Response(request.body);
    const resp = await webhookResponse.json()

    console.log(resp)
    // const [evento] = data.items;

    // const refSnapshotStatus = ref(database, `eventos/${evento.code}/inscricoes/${data.customer.document}/pagamento/status`)
    // await set(refSnapshotStatus, data.status)

    return Response.json({})
}
